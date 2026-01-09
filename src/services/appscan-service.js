import { Api, HttpClient } from '../generated/Api.js';
import { Config } from '../utils/config.js';

// Predefined filter combinations
const FILTER_PRESETS = {
  status: {
    active: ['Open', 'Reopened', 'InProgress'],
    inactive: ['Noise', 'Passed', 'Fixed'],
    pending: ['Open', 'Reopened'],
    processed: ['InProgress', 'Fixed', 'Passed'],
  },
  severity: {
    low: ['Low', 'Informational'],
    medium: ['Medium'],
    high: ['High', 'Critical'],
  },
};

/**
 * Build OData filter string for multiple values with OR logic
 * @param {string} field - Field name
 * @param {Array<string>} values - Array of values
 * @returns {string} OData filter string
 */
function buildOrFilter(field, values) {
  if (!values || values.length === 0) return '';
  if (values.length === 1) return `${field} eq '${values[0]}'`;
  return `(${values.map((v) => `${field} eq '${v}'`).join(' or ')})`;
}

/**
 * Build OData filter string from filter options
 * @param {Object} options - Filter options
 * @returns {string} OData $filter query string
 */
function buildODataFilter(options) {
  const filters = [];

  if (options.statusActive) {
    filters.push(buildOrFilter('Status', FILTER_PRESETS.status.active));
  } else if (options.statusInactive) {
    filters.push(buildOrFilter('Status', FILTER_PRESETS.status.inactive));
  } else if (options.statusPending) {
    filters.push(buildOrFilter('Status', FILTER_PRESETS.status.pending));
  } else if (options.statusProcessed) {
    filters.push(buildOrFilter('Status', FILTER_PRESETS.status.processed));
  } else if (options.statusFilter) {
    filters.push(buildOrFilter('Status', options.statusFilter));
  }

  if (options.severityLow) {
    filters.push(buildOrFilter('Severity', FILTER_PRESETS.severity.low));
  } else if (options.severityMedium) {
    filters.push(buildOrFilter('Severity', FILTER_PRESETS.severity.medium));
  } else if (options.severityHigh) {
    filters.push(buildOrFilter('Severity', FILTER_PRESETS.severity.high));
  } else if (options.severityFilter) {
    filters.push(buildOrFilter('Severity', options.severityFilter));
  }

  if (options.jiraAssigned) {
    filters.push('ExternalId ne null');
  } else if (options.jiraUnassigned) {
    filters.push('ExternalId eq null');
  }

  if (options.excludePassedNoise) {
    filters.push("(Status ne 'Passed' and Status ne 'Noise')");
  }

  return filters.length > 0 ? filters.join(' and ') : '';
}

export class AppScanService {
  constructor(config) {
    this.config = config || new Config();
    this.api = null;
    this.token = null;
    this.isReauthenticating = false; // Prevent multiple simultaneous re-auth attempts
  }

  async authenticate() {
    if (!this.config.isValid()) {
      throw new Error(
        'API credentials not configured. Please set APPSCAN_API_KEY and APPSCAN_API_SECRET environment variables.'
      );
    }

    try {
      const httpClient = new HttpClient({
        baseURL: this.config.getBaseUrl(),
      });
      this.api = new Api(httpClient);

      const response = await this.api.v4.Account_ApiKeyLogin({
        KeyId: this.config.getApiKey(),
        KeySecret: this.config.getApiSecret(),
      });

      if (!response || !response.Token) {
        throw new Error(
          'Authentication response did not contain a valid token'
        );
      }

      this.token = response.Token;

      // Update API instance with authorization token
      const authenticatedHttpClient = new HttpClient({
        baseURL: this.config.getBaseUrl(),
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      this.api = new Api(authenticatedHttpClient);

      return this.token;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Transform CustomFields array to a simple key-value object
   * @private
   * @param {Object} app - Application object with CustomFields array
   * @returns {Object} Application with transformed customFields
   */
  _transformCustomFields(app) {
    if (app.CustomFields && Array.isArray(app.CustomFields)) {
      const customFieldsMap = {};
      app.CustomFields.forEach((cf) => {
        customFieldsMap[cf.Name] =
          cf.Value && cf.Value.trim() ? cf.Value : null;
      });

      app.customFields = customFieldsMap;
      app._customFieldsRaw = app.CustomFields;
      delete app.CustomFields;
    }
    return app;
  }

  /**
   * List all applications with transformed CustomFields
   * Transforms CustomFields array to a simple key-value object for easier access
   * @returns {Promise<Object>} Response with Items array containing applications
   */
  async listApplications() {
    await this.ensureAuthenticated();
    return this.withAuthRetry(async () => {
      const response = await this.api.v4.Apps_Get({});

      if (response.Items && Array.isArray(response.Items)) {
        response.Items = response.Items.map((app) =>
          this._transformCustomFields(app)
        );
      }

      return response;
    }, 'Failed to list applications');
  }

  async listScans(appId) {
    await this.ensureAuthenticated();
    const query = {
      $count: false,
    };
    if (appId) {
      query.$filter = `AppId eq ${appId}`;
    }
    return this.withAuthRetry(
      async () => await this.api.v4.Scans_Get(query),
      'Failed to list scans'
    );
  }

  async listScanExecutions(scanId) {
    await this.ensureAuthenticated();
    return this.withAuthRetry(
      async () => await this.api.v4.Scans_GetExecutions(scanId, {}),
      'Failed to list scan executions'
    );
  }

  /**
   * List issues for a scope (Application, Scan, or ScanExecution) with optional filters
   * @param {string} scopeId - Scope ID (Application ID, Scan ID, or ScanExecution ID)
   * @param {Object} filterOptions - Filter options
   * @param {boolean} filterOptions.statusActive - Active issues (Open, Reopened, InProgress)
   * @param {boolean} filterOptions.statusInactive - Inactive issues (Noise, Closed, Passed, Fixed)
   * @param {boolean} filterOptions.statusPending - Pending issues (Open, Reopened)
   * @param {boolean} filterOptions.statusProcessed - Processed issues (InProgress, Fixed, Passed)
   * @param {boolean} filterOptions.severityLow - Low severity (Low, Informational)
   * @param {boolean} filterOptions.severityMedium - Medium severity
   * @param {boolean} filterOptions.severityHigh - High severity (High, Critical)
   * @param {boolean} filterOptions.jiraAssigned - Issues with Jira link
   * @param {boolean} filterOptions.jiraUnassigned - Issues without Jira link
   * @param {Array<string>} filterOptions.statusFilter - Custom status filter array
   * @param {Array<string>} filterOptions.severityFilter - Custom severity filter array
   * @param {string} excludeStatus - Comma-separated statuses to exclude (client-side filtering)
   * @param {string} scope - Scope type: 'Application', 'Scan', or 'ScanExecution' (default: 'Scan')
   * @returns {Promise<Object>} Issues response
   */
  async listIssues(
    scopeId,
    filterOptions = null,
    excludeStatus = null,
    scope = 'Scan'
  ) {
    await this.ensureAuthenticated();

    if (typeof filterOptions === 'string') {
      excludeStatus = filterOptions;
      filterOptions = null;
    }

    return this.withAuthRetry(async () => {
      const queryParams = {};

      if (filterOptions && typeof filterOptions === 'object') {
        const odataFilter = buildODataFilter(filterOptions);
        if (odataFilter) {
          queryParams.$filter = odataFilter;
        }
      }

      const response = await this.api.v4.Issues_Get(
        scope,
        scopeId,
        queryParams
      );

      if (
        excludeStatus &&
        typeof excludeStatus === 'string' &&
        excludeStatus.trim().length > 0 &&
        (!filterOptions || typeof filterOptions !== 'object') &&
        response.Items
      ) {
        const statusesToExclude = excludeStatus
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        if (statusesToExclude.length > 0) {
          response.Items = response.Items.filter(
            (issue) => !statusesToExclude.includes(issue.Status)
          );
          if (response.Count !== undefined) {
            response.Count = response.Items.length;
          }
        }
      }

      return response;
    }, 'Failed to list issues');
  }

  /**
   * Get detailed information for a specific application by ID
   * Transforms CustomFields array to a simple key-value object for easier access
   * @param {string} appId - Application UUID
   * @returns {Promise<Object>} Application details with simplified customFields
   */
  async getApplicationDetails(appId) {
    await this.ensureAuthenticated();
    return this.withAuthRetry(async () => {
      // Use $filter to get a single application (no direct GET /Apps/{id} endpoint exists)
      const response = await this.api.v4.Apps_Get({
        $filter: `Id eq ${appId}`,
      });

      const app = response.Items?.[0];
      if (!app) {
        throw new Error(`Application with ID ${appId} not found`);
      }

      // Transform CustomFields using shared helper
      return this._transformCustomFields(app);
    }, 'Failed to get application details');
  }

  async getScanDetails(scanId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Scans_Get({ ScanId: scanId });
      return response;
    } catch (error) {
      throw new Error(`Failed to get issue details: ${error.message}`);
    }
  }

  async getArticle(issueId, options = {}) {
    await this.ensureAuthenticated();
    try {
      const issue = await this.api.v4.Issues_GetIssue(issueId, {});

      if (!issue) {
        throw new Error(`Issue not found: ${issueId}`);
      }

      const queryParams = {
        id: issueId,
        issuetype: issue.IssueTypeId,
      };

      if (options.language || issue.Language) {
        queryParams.language = options.language || issue.Language;
      }

      if (options.api || issue.Api) {
        queryParams.api = options.api || issue.Api;
      }

      if (options.cveId || issue.CveId) {
        queryParams.cveId = options.cveId || issue.CveId;
      }

      if (options.nl) {
        queryParams.nl = options.nl;
      }

      if (options.mode) {
        queryParams.mode = options.mode;
      }

      if (options.enableTrainingLinks !== undefined) {
        queryParams.enableTrainingLinks = options.enableTrainingLinks;
      }

      const response = await this.api.v4.Reports_GetArticle(queryParams);

      // Fix relative URLs in the article HTML by converting them to absolute URLs
      if (response && typeof response === 'string') {
        const baseUrl = this.config.getBaseUrl();
        const articleApiPath = '/api/v4/Reports/Article/';
        return response.replace(
          /href="(\?issuetype=[^"]*)"/g,
          `href="${baseUrl}${articleApiPath}$1"`
        );
      }

      return response;
    } catch (error) {
      // Provide more detailed error information
      if (error.response) {
        throw new Error(
          `Failed to get article: ${error.response.status} - ${
            error.response.statusText || error.message
          }`
        );
      }
      throw new Error(`Failed to get article: ${error.message}`);
    }
  }

  /**
   * Get issue article as markdown
   * Fetches the focused article HTML and converts it to markdown
   * @param {Object} issue - The issue object containing IssueTypeId, Language, and ApiVulnName
   * @returns {Promise<string>} Article content as markdown
   */
  async getIssueArticle(issue) {
    await this.ensureAuthenticated();
    try {
      const TurndownService = (await import('turndown')).default;
      const { parse } = await import('node-html-parser');

      const focusedUrl = await this.getFocusedArticleUrl(issue);

      const response = await fetch(focusedUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Parse HTML and extract body content using proper DOM parser
      const root = parse(html);
      const bodyElement = root.querySelector('body');
      const bodyContent = bodyElement ? bodyElement.innerHTML : html;

      // Configure turndown for better markdown conversion
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        fence: '```',
        emDelimiter: '_',
        strongDelimiter: '**',
        linkStyle: 'inlined',
        linkReferenceStyle: 'full',
      });

      turndownService.addRule('removeScripts', {
        filter: ['script', 'style', 'noscript'],
        replacement: () => '',
      });

      turndownService.addRule('preserveCodeBlocks', {
        filter: 'pre',
        replacement: (content, node) => {
          const codeElement = node.querySelector('code');
          const code = codeElement ? codeElement.textContent : node.textContent;
          return '\n\n```\n' + code + '\n```\n\n';
        },
      });

      const markdown = turndownService.turndown(bodyContent);
      return markdown;
    } catch (error) {
      throw new Error(`Failed to get issue article: ${error.message}`);
    }
  }

  /**
   * Get focused article URL for an issue based on ApiVulnName
   * @param {Object} issue - The issue object containing IssueTypeId, Language, and ApiVulnName
   * @returns {Promise<string>} The focused article URL
   */
  async getFocusedArticleUrl(issue) {
    const baseUrl = this.config.getBaseUrl();

    // Build general article URL
    const articleParams = new URLSearchParams({
      issuetype: issue.IssueTypeId,
    });

    if (issue.Language) {
      articleParams.append('language', issue.Language);
    }

    const generalArticleUrl = `${baseUrl}/api/v4/Reports/Article/?${articleParams.toString()}`;

    if (!issue.ApiVulnName) {
      return generalArticleUrl;
    }

    try {
      await this.ensureAuthenticated();

      const response = await this.api.v4.Reports_GetArticle({
        issuetype: issue.IssueTypeId,
        language: issue.Language,
      });

      if (!response || typeof response !== 'string') {
        return generalArticleUrl;
      }

      const apiLinksMatch = response.match(
        /<div[^>]*id="apiLinks"[^>]*>([\s\S]*?)<\/div>/i
      );

      if (!apiLinksMatch) {
        return generalArticleUrl;
      }

      const apiLinksContent = apiLinksMatch[1];
      const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;

      while ((match = linkRegex.exec(apiLinksContent)) !== null) {
        const href = match[1];
        const linkText = match[2].replace(/<[^>]*>/g, '').trim();

        if (linkText === issue.ApiVulnName) {
          const decodeHtmlEntities = (text) => {
            const entities = {
              '&amp;': '&',
              '&lt;': '<',
              '&gt;': '>',
              '&quot;': '"',
              '&#39;': "'",
              '&apos;': "'",
            };
            return text.replace(
              /&[#\w]+;/g,
              (entity) => entities[entity] || entity
            );
          };

          const decodedHref = decodeHtmlEntities(href);
          const focusedUrl = `${baseUrl}/api/v4/Reports/Article/${decodedHref}`;
          return focusedUrl;
        }
      }

      return generalArticleUrl;
    } catch {
      return generalArticleUrl;
    }
  }

  async generateSecurityReport(type, id, options = {}) {
    await this.ensureAuthenticated();
    try {
      const config = {
        ReportFileType: options.format || 'Html',
        Title: options.title || '',
        Notes: options.notes || '',
        Locale: options.locale || 'en-US',
        Summary: options.summary !== false,
        Details: options.details !== false,
        Discussion: options.discussion !== false,
        Overview: options.overview !== false,
        TableOfContent: options.tableOfContent !== false,
        History: options.history !== false,
        Coverage: options.coverage !== false,
        MinimizeDetails: options.minimizeDetails !== false,
        Articles: options.articles !== false,
      };

      const payload = {
        OdataFilter: options.odataFilter || '',
        ApplyPolicies: options.applyPolicies || 'None',
        SelectPolicyIds: options.selectPolicyIds || [],
        Configuration: config,
      };

      const validTypes = ['Scan', 'Application', 'ScanExecution'];
      if (!validTypes.includes(type)) {
        throw new Error(
          `Invalid report type: ${type}. Must be Scan, Application, or ScanExecution`
        );
      }

      const response = await this.api.v4.Reports_CreateSecurityReport(
        type,
        id,
        payload
      );

      return response;
    } catch (error) {
      throw new Error(`Failed to generate security report: ${error.message}`);
    }
  }

  async listReports(top = 100, count = false) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Reports_Get({
        $top: top,
        $count: count,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to list reports: ${error.message}`);
    }
  }

  async getReportStatus(reportId) {
    await this.ensureAuthenticated();
    try {
      const reports = await this.listReports(100, false);
      const report = reports.Items?.find((r) => r.Id === reportId);
      return report;
    } catch (error) {
      throw new Error(`Failed to get report status: ${error.message}`);
    }
  }

  async downloadReport(reportId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Reports_Download(reportId);
      return response;
    } catch (error) {
      throw new Error(`Failed to download report: ${error.message}`);
    }
  }

  async generateAndDownloadReport(type, id, options = {}) {
    await this.ensureAuthenticated();
    try {
      // Generate the report
      const generateResponse = await this.generateSecurityReport(
        type,
        id,
        options
      );
      const reportId = generateResponse.Id;

      if (!reportId) {
        throw new Error('Report generation did not return a report ID');
      }

      // Wait for the report to be ready
      const maxRetries = options.maxRetries || 60; // 60 retries = 5 minutes max
      const retryDelay = options.retryDelay || 5000; // 5 seconds between checks

      let report = null;
      let retries = 0;

      while (retries < maxRetries) {
        report = await this.getReportStatus(reportId);

        if (report && report.Status === 'Ready') {
          break;
        }

        if (report && report.Status === 'Failed') {
          throw new Error(
            `Report generation failed: ${report.StatusMessage || 'Unknown error'}`
          );
        }

        // Wait before checking again
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retries++;
      }

      if (!report || report.Status !== 'Ready') {
        throw new Error(
          `Report generation timed out after ${(maxRetries * retryDelay) / 1000} seconds`
        );
      }

      const reportContent = await this.downloadReport(reportId);

      return {
        reportId,
        report,
        content: reportContent,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate and download report: ${error.message}`
      );
    }
  }

  async ensureAuthenticated() {
    if (!this.token) {
      await this.authenticate();
    }
  }

  /**
   * Wraps API calls with automatic retry on 401 (authentication expired)
   * @param {Function} apiCall - The API call function to execute
   * @param {string} errorContext - Context for error messages
   * @returns {Promise<any>} The API response
   */
  async withAuthRetry(apiCall, errorContext) {
    try {
      return await apiCall();
    } catch (error) {
      // Check if it's a 401 error (authentication expired)
      const is401 =
        error.response?.status === 401 ||
        error.statusCode === 401 ||
        error.message?.includes('401') ||
        error.message?.toLowerCase().includes('unauthorized');

      if (is401 && !this.isReauthenticating) {
        // Authentication expired - try to re-authenticate once
        try {
          this.isReauthenticating = true;
          this.token = null; // Clear expired token
          await this.authenticate();
          this.isReauthenticating = false;

          // Retry the API call with new token
          return await apiCall();
        } catch (reauthError) {
          this.isReauthenticating = false;
          throw new Error(
            `${errorContext}: Authentication failed after retry - ${reauthError.message}`
          );
        }
      }

      // Not a 401 or already retried, throw original error
      throw new Error(`${errorContext}: ${error.message}`);
    }
  }

  /**
   * Bulk update multiple issues with the same status and comment
   * @param {Array<string>} issueIds - Array of issue IDs to update
   * @param {string} status - New status for all issues
   * @param {string} comment - Comment to add to all issues (optional)
   * @param {string} externalId - External ID (optional)
   * @returns {Promise<Object>} Update results
   */
  async bulkUpdateIssues(
    issueIds,
    status = null,
    comment = null,
    externalId = null
  ) {
    await this.ensureAuthenticated();

    if (!issueIds || issueIds.length === 0) {
      throw new Error('No issue IDs provided for bulk update');
    }

    if (status) {
      const validStatuses = [
        'Open',
        'InProgress',
        'Reopened',
        'Noise',
        'Passed',
        'Fixed',
        'New',
      ];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`
        );
      }
    }

    try {
      const updateData = {};

      if (status) {
        updateData.Status = status;
      }

      if (comment) {
        updateData.Comment = comment;
      }

      if (externalId) {
        updateData.ExternalId = externalId;
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error(
          'No fields to update. Must provide status, comment, or externalId'
        );
      }

      const firstIssue = await this.api.v4.Issues_GetIssue(issueIds[0], {});

      if (!firstIssue || !firstIssue.ApplicationId) {
        throw new Error(
          `Cannot determine ApplicationId from issue: ${issueIds[0]}`
        );
      }

      const applicationId = firstIssue.ApplicationId;

      const odataFilter = issueIds.map((id) => `Id eq ${id}`).join(' or ');

      const result = await this.api.v4.Issues_UpdateFilteredIssues(
        'Application',
        applicationId,
        updateData,
        {
          odataFilter: odataFilter,
        }
      );

      return {
        success: true,
        totalRequested: issueIds.length,
        totalUpdated:
          result?.UpdatedIssues || result?.TotalIssues || issueIds.length,
        result,
      };
    } catch (error) {
      throw new Error(`Failed to bulk update issues: ${error.message}`);
    }
  }

  /**
   * Update ALL issues in a scan (no filter applied)
   * @param {string} scanId - Scan ID
   * @param {string} status - New status (Open, InProgress, Noise, Passed, Fixed)
   * @param {string} comment - Optional comment
   * @param {string} externalId - Optional external ID (e.g., Jira key)
   * @returns {Promise<Object>} Update result
   */
  async updateAllIssuesInScan(
    scanId,
    status,
    comment = null,
    externalId = null
  ) {
    await this.ensureAuthenticated();
    try {
      const updateData = { Status: status };

      if (comment) {
        updateData.Comment = comment;
      }

      if (externalId) {
        updateData.ExternalId = externalId;
      }

      const result = await this.api.v4.Issues_UpdateFilteredIssues(
        'Scan',
        scanId,
        updateData,
        {} // No filter = update all issues in scan
      );

      return {
        success: true,
        scanId: scanId,
        totalUpdated: result?.UpdatedIssues || result?.TotalIssues || 0,
        result,
      };
    } catch (error) {
      throw new Error(`Failed to update all issues in scan: ${error.message}`);
    }
  }

  /**
   * Update ALL issues in an application (no filter applied)
   * @param {string} applicationId - Application ID
   * @param {string} status - New status (Open, InProgress, Noise, Passed, Fixed)
   * @param {string} comment - Optional comment
   * @param {string} externalId - Optional external ID (e.g., Jira key)
   * @returns {Promise<Object>} Update result
   */
  async updateAllIssuesInApplication(
    applicationId,
    status,
    comment = null,
    externalId = null
  ) {
    await this.ensureAuthenticated();
    try {
      const updateData = { Status: status };

      if (comment) {
        updateData.Comment = comment;
      }

      if (externalId) {
        updateData.ExternalId = externalId;
      }

      const result = await this.api.v4.Issues_UpdateFilteredIssues(
        'Application',
        applicationId,
        updateData,
        {}
      );

      return {
        success: true,
        applicationId: applicationId,
        totalUpdated: result?.UpdatedIssues || result?.TotalIssues || 0,
        result,
      };
    } catch (error) {
      throw new Error(
        `Failed to update all issues in application: ${error.message}`
      );
    }
  }
}

export default AppScanService;
