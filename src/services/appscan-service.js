import { Api, HttpClient } from '../generated/Api.js';
import { Config } from '../utils/config.js';

export class AppScanService {
  constructor(config) {
    this.config = config || new Config();
    this.api = null;
    this.token = null;
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

  async listApplications() {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Apps_Get({});
      return response;
    } catch (error) {
      throw new Error(`Failed to list applications: ${error.message}`);
    }
  }

  async listScans(appId) {
    await this.ensureAuthenticated();
    const query = {
      $count: false,
    };
    if (appId) {
      query.$filter = `AppId eq ${appId}`;
    }
    try {
      const response = await this.api.v4.Scans_Get(query);
      return response;
    } catch (error) {
      throw new Error(`Failed to list scans: ${error.message}`);
    }
  }

  async listScanExecutions(scanId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Scans_GetExecutions(scanId, {});
      return response;
    } catch (error) {
      throw new Error(`Failed to list scan executions: ${error.message}`);
    }
  }

  async listIssues(scanId, excludeStatus = 'Noise') {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Issues_Get('Scan', scanId, {});

      // Filter issues by status if excludeStatus is provided
      if (excludeStatus && response.Items) {
        const statusesToExclude = excludeStatus
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        if (statusesToExclude.length > 0) {
          response.Items = response.Items.filter(
            (issue) => !statusesToExclude.includes(issue.Status)
          );
          // Update count if present
          if (response.Count !== undefined) {
            response.Count = response.Items.length;
          }
        }
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to list issues: ${error.message}`);
    }
  }

  async getApplicationDetails(appId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Apps_Get({ Id: appId });
      return response;
    } catch (error) {
      throw new Error(`Failed to get application details: ${error.message}`);
    }
  }

  async getScanDetails(scanId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Scans_Get({ ScanId: scanId });
      return response;
    } catch (error) {
      throw new Error(`Failed to get scan details: ${error.message}`);
    }
  }

  async getIssueDetails(issueId, locale = 'en-US', format = 'html') {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Issues_IssueDetails(issueId, {
        Locale: locale,
        Format: format,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to get issue details: ${error.message}`);
    }
  }

  async getArticle(issueId, options = {}) {
    await this.ensureAuthenticated();
    try {
      // First, get the issue to retrieve issueType and other fields
      const issue = await this.api.v4.Issues_GetIssue(issueId, {});

      if (!issue) {
        throw new Error(`Issue not found: ${issueId}`);
      }

      // Build query parameters according to the API specification
      // The API expects: id (issueId), issuetype, language, api, cveId, nl, mode, enableTrainingLinks
      const queryParams = {
        id: issueId,
        issuetype: issue.IssueTypeId,
      };

      // Add optional parameters if provided or available from issue
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

      // Validate type
      const validTypes = ['Scan', 'Application', 'ScanExecution'];
      if (!validTypes.includes(type)) {
        throw new Error(
          `Invalid report type: ${type}. Must be Scan, Application, or ScanExecution`
        );
      }

      // Use the single Reports_CreateSecurityReport method with scope parameter
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

      // Download the report
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

    // Validate status if provided
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
      // Build the update payload
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

      // Must have at least one field to update
      if (Object.keys(updateData).length === 0) {
        throw new Error(
          'No fields to update. Must provide status, comment, or externalId'
        );
      }

      // Get the first issue to determine the application ID
      const firstIssue = await this.api.v4.Issues_GetIssue(issueIds[0], {});

      if (!firstIssue || !firstIssue.ApplicationId) {
        throw new Error(
          `Cannot determine ApplicationId from issue: ${issueIds[0]}`
        );
      }

      const applicationId = firstIssue.ApplicationId;

      // Build OData filter for multiple IDs
      // Format: Id eq guid1 or Id eq guid2 or Id eq guid3
      const odataFilter = issueIds.map((id) => `Id eq ${id}`).join(' or ');

      // Update all issues using filtered update
      // Note: PUT endpoint uses 'odataFilter' parameter (not '$filter' like GET)
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
      // Build update payload
      const updateData = { Status: status };

      if (comment) {
        updateData.Comment = comment;
      }

      if (externalId) {
        updateData.ExternalId = externalId;
      }

      // Update all issues in the scan (no filter = all issues)
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
      // Build update payload
      const updateData = { Status: status };

      if (comment) {
        updateData.Comment = comment;
      }

      if (externalId) {
        updateData.ExternalId = externalId;
      }

      // Update all issues in the application (no filter = all issues)
      const result = await this.api.v4.Issues_UpdateFilteredIssues(
        'Application',
        applicationId,
        updateData,
        {} // No filter = update all issues in application
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

  /**
   * Get issue counts grouped by severity for a scan
   * @param {string} scanId - Scan ID
   * @param {string} excludeStatus - Comma-separated statuses to exclude
   * @returns {Promise<Object>} Issue statistics
   */
  async getIssueCounts(scanId, excludeStatus = 'Noise') {
    await this.ensureAuthenticated();
    try {
      const response = await this.listIssues(scanId, excludeStatus);
      const issues = response.Items || [];

      const stats = {
        total: issues.length,
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
        Informational: 0,
      };

      issues.forEach((issue) => {
        const severity = issue.Severity || 'Unknown';
        if (stats[severity] !== undefined) {
          stats[severity]++;
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get issue counts: ${error.message}`);
    }
  }
}

export default AppScanService;
