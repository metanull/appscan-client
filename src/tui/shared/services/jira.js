/**
 * Jira Service Wrapper
 * This wraps the parent package's JiraService to provide a clean interface
 * for the Ink UI and adds audit logging for all write operations.
 */

// Import from parent package
import { JiraService as ParentJiraService } from '../../../services/jira-service.js';
import { JiraDescriptionBuilder } from '../../../utils/jira-description-builder.js';
import * as AppScanUrls from '../../../utils/appscan-urls.js';
import { auditService } from '../../shared/utils/audit.js';
import logger from '../../../utils/logger.js';
import { parseAVSFromComments } from '../../../utils/asvs-utils.js';

export class JiraService {
  /**
   * @param {Config} config - Configuration object with Jira settings
   */
  constructor(config) {
    this.config = config;
    this.service = new ParentJiraService(config);
    this.initialized = false;
  }

  /**
   * Initializes the Jira API client connection
   */
  initialize() {
    if (!this.initialized) {
      this.service.initialize();
      this.initialized = true;
    }
  }

  /**
   * Creates a single Jira issue from AppScan issues via Jira API
   * @param {string} projectKey - Jira project key
   * @param {string} summary - Issue summary/title
   * @param {Array<Object>} issues - Array of AppScan issue objects
   * @param {string} baseUrl - AppScan base URL for links
   * @param {AsocService} AsocService - Service to fetch additional details
   * @param {Object|null} app - Optional application object
   * @param {Object|null} scan - Optional scan object
   * @param {string|null} parentEpic - Optional parent epic key
   * @returns {Promise<Object>} Created Jira issue object
   */
  async createJiraIssue(
    projectKey,
    summary,
    issues,
    baseUrl,
    AsocService,
    app = null,
    scan = null,
    parentEpic = null
  ) {
    this.initialize();

    try {
      logger.info('Creating Jira issue', {
        projectKey,
        summary,
        issueCount: issues.length,
        parentEpic,
      });

      // Enrich issues with article content and comments if AsocService is provided
      if (AsocService) {
        await this.enrichIssuesWithDetails(issues, AsocService);
      }

      const builder = new JiraDescriptionBuilder(issues, baseUrl, app, scan);
      const description = builder.addMetadata().addIssuesByType().build();

      // Collect ASVS labels from issues
      const avsLabels = [];
      for (const issue of issues) {
        const avsInfo = parseAVSFromComments(issue.comments || []);
        if (avsInfo && avsInfo.label) {
          avsLabels.push(avsInfo.label.toLowerCase());
        }
      }

      const fields = {
        project: { key: projectKey },
        summary: summary,
        description: this.service.convertToADF(description),
        issuetype: { name: 'Story' },
        labels: ['appscan', 'security', ...avsLabels],
        assignee: null,
      };

      if (parentEpic) {
        fields.parent = { key: parentEpic };
      }

      const jiraIssue = await this.service.client.issues.createIssue({
        fields,
      });

      // Update AppScan issues with Jira key
      if (AsocService && app?.Id && jiraIssue.key) {
        logger.info('Updating AppScan issues with Jira key', {
          jiraKey: jiraIssue.key,
          issueCount: issues.length,
        });

        try {
          const issueIds = issues.map((issue) => issue.Id);
          await AsocService.bulkUpdateIssues(issueIds, app.Id, {
            ExternalId: jiraIssue.key,
          });
          logger.info('AppScan issues updated with Jira key successfully');
        } catch (updateError) {
          logger.warn('Failed to update AppScan issues with Jira key', {
            error: updateError.message,
          });
        }
      }

      // Audit the creation
      auditService.logJiraCreate(projectKey, summary, issues.length, {
        success: true,
        jiraKey: jiraIssue.key,
        jiraId: jiraIssue.id,
      });

      logger.info('Jira issue created successfully', {
        jiraKey: jiraIssue.key,
      });
      return jiraIssue;
    } catch (error) {
      logger.error('Failed to create Jira issue', error, {
        projectKey,
        summary,
        issueCount: issues.length,
      });

      auditService.logJiraCreate(projectKey, summary, issues.length, {
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Enriches issues with article content and comments from AppScan API
   * @param {Array<Object>} issues - Array of AppScan issue objects to enrich
   * @param {AsocService} AsocService - Service to fetch additional details
   * @private
   */
  async enrichIssuesWithDetails(issues, AsocService) {
    // Group issues by type to fetch article only once per type
    const issuesByType = {};
    for (const issue of issues) {
      const type = issue.IssueType || 'Unknown';
      if (!issuesByType[type]) {
        issuesByType[type] = [];
      }
      issuesByType[type].push(issue);
    }

    // Fetch article for first issue of each type
    for (const [type, typeIssues] of Object.entries(issuesByType)) {
      const firstIssue = typeIssues[0];
      try {
        // Fetch article HTML - the method returns markdown directly
        const articleMarkdown = await AsocService.getIssueArticle(firstIssue);
        if (articleMarkdown) {
          // Trim article to only include Cause and Fix recommendation sections
          firstIssue.articleMarkdown =
            this.extractRelevantArticleSections(articleMarkdown);
        }
      } catch (error) {
        logger.warn(`Failed to fetch article for ${type}`, {
          error: error.message,
        });
      }
    }

    // Fetch comments and article URLs for all issues
    for (const issue of issues) {
      try {
        const comments = await AsocService.getIssueComments(issue.Id);
        issue.comments = comments || [];
      } catch (error) {
        logger.warn(`Failed to fetch comments for issue ${issue.Id}`, {
          error: error.message,
        });
        issue.comments = [];
      }

      try {
        const articleUrl = await AsocService.getFocusedArticleUrl(issue);
        issue.focusedArticleUrl = articleUrl;
      } catch (error) {
        logger.warn(`Failed to fetch article URL for issue ${issue.Id}`, {
          error: error.message,
        });
      }
    }
  }

  /**
   * Extracts only the Cause and Fix recommendation sections from article markdown
   * @param {string} markdown - Full article markdown content
   * @returns {string} Filtered markdown with only relevant sections
   * @private
   */
  extractRelevantArticleSections(markdown) {
    if (!markdown) return '';

    const lines = markdown.split('\n');
    const result = [];
    let inRelevantSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check if this is a heading line
      if (trimmedLine.startsWith('#')) {
        // Extract heading text (remove # symbols and trim)
        const headingText = trimmedLine.replace(/^#+\s*/, '').toLowerCase();

        // Check if this is Cause or Fix recommendation
        if (
          headingText === 'cause' ||
          headingText.includes('fix recommendation')
        ) {
          inRelevantSection = true;
          result.push(line);
        } else {
          // We've hit a different heading (not Cause or Fix recommendation)
          inRelevantSection = false;
        }
      } else if (inRelevantSection) {
        // We're in a relevant section, keep the content
        result.push(line);
      }
    }

    return result.join('\n').trim();
  }

  /**
   * Retrieves a Jira issue by key or ID via Jira API
   * @param {string} issueKey - Jira issue key or ID
   * @returns {Promise<Object>} Jira issue object
   */
  async getJiraIssue(issueKey) {
    this.initialize();
    return await this.service.client.issues.getIssue({
      issueIdOrKey: issueKey,
    });
  }

  /**
   * Searches for Jira issues using JQL query via Jira API
   * @param {string} jql - JQL query string
   * @returns {Promise<Object>} Search results with matching issues
   */
  async searchJiraIssues(jql) {
    this.initialize();
    return await this.service.client.issueSearch.searchForIssuesUsingJql({
      jql,
    });
  }

  /**
   * Generates URL to view a Jira issue
   * @param {string} issueKey - Jira issue key
   * @returns {string} URL to the Jira issue
   */
  getJiraUrl(issueKey) {
    const jiraHost = this.config.getJiraHost();
    return AppScanUrls.getJiraUrl(jiraHost, issueKey);
  }

  /**
   * Gets the configured Jira project key
   * @returns {string} Jira project key
   */
  getProjectKey() {
    return this.config.getJiraProjectKey();
  }

  /**
   * Creates one or more Jira issues from AppScan issues with optional grouping
   * @param {string} projectKey - Jira project key
   * @param {string} groupBy - Grouping strategy ('type', 'severity', or 'none')
   * @param {Array<Object>} issues - Array of AppScan issue objects
   * @param {AsocService} AsocService - Service to fetch additional details
   * @param {Object|null} app - Optional application object
   * @param {Object|null} scan - Optional scan object
   * @param {string|null} parentEpic - Optional parent epic key
   * @param {string|null} appName - Optional application name for summary prefix
   * @returns {Promise<Array<Object>>} Array of created Jira issue objects
   */
  async createIssues(
    projectKey,
    groupBy,
    issues,
    AsocService,
    app = null,
    scan = null,
    parentEpic = null,
    appName = null
  ) {
    this.initialize();

    try {
      logger.info('Creating Jira issues', {
        projectKey,
        groupBy,
        issueCount: issues.length,
        parentEpic,
        appName,
      });

      // Group issues if needed
      let grouped;
      if (groupBy === 'type') {
        grouped = issues.reduce((acc, issue) => {
          const type = issue.IssueType || 'Unknown';
          if (!acc[type]) acc[type] = [];
          acc[type].push(issue);
          return acc;
        }, {});
      } else if (groupBy === 'severity') {
        grouped = issues.reduce((acc, issue) => {
          const severity = issue.Severity || 'Unknown';
          if (!acc[severity]) acc[severity] = [];
          acc[severity].push(issue);
          return acc;
        }, {});
      } else {
        // No grouping - one Jira per issue
        grouped = Object.fromEntries(
          issues.map((i, idx) => [`Issue ${idx + 1}`, [i]])
        );
      }

      const results = [];
      for (const [groupName, groupIssues] of Object.entries(grouped)) {
        const prefix = appName || 'Security';
        const summary = `${prefix}: ${groupName} (${groupIssues.length} issue${groupIssues.length > 1 ? 's' : ''})`;
        const result = await this.createJiraIssue(
          projectKey,
          summary,
          groupIssues,
          this.config.getBaseUrl(),
          AsocService,
          app,
          scan,
          parentEpic
        );
        results.push(result);
      }

      logger.info('Jira issues created successfully', {
        count: results.length,
      });
      return results;
    } catch (error) {
      logger.error('Failed to create Jira issues', error);
      throw error;
    }
  }

  /**
   * Checks if Jira configuration is valid and ready to use
   * @returns {boolean} True if Jira is configured
   */
  isConfigured() {
    return this.config.isJiraValid();
  }
}

export default JiraService;
