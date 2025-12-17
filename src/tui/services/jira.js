/**
 * Jira Service Wrapper
 * This wraps the parent package's JiraService to provide a clean interface
 * for the Ink UI and adds audit logging for all write operations.
 */

// Import from parent package
import { JiraService as ParentJiraService } from '../../../src/services/jira-service.js';
import { JiraDescriptionBuilder } from '../../../src/utils/jira-description-builder.js';
import { auditService } from '../utils/audit.js';
import logger from '../utils/logger.js';

export class JiraService {
  constructor(config) {
    this.config = config;
    this.service = new ParentJiraService(config);
    this.initialized = false;
  }

  initialize() {
    if (!this.initialized) {
      this.service.initialize();
      this.initialized = true;
    }
  }

  async createJiraIssue(
    projectKey,
    summary,
    issues,
    baseUrl,
    appScanService,
    app = null,
    scan = null
  ) {
    this.initialize();

    try {
      logger.info('Creating Jira issue', {
        projectKey,
        summary,
        issueCount: issues.length,
      });

      // Enrich issues with article content and comments if appScanService is provided
      if (appScanService) {
        await this.enrichIssuesWithDetails(issues, appScanService);
      }

      const builder = new JiraDescriptionBuilder(issues, baseUrl, app, scan);
      const description = builder.addMetadata().addIssuesByType().build();

      const jiraIssue = await this.service.client.issues.createIssue({
        fields: {
          project: { key: projectKey },
          summary: summary,
          description: this.service.convertToADF(description),
          issuetype: { name: 'Story' },
          labels: ['appscan', 'security'],
        },
      });

      // Update AppScan issues with Jira key
      if (appScanService && app?.Id && jiraIssue.key) {
        logger.info('Updating AppScan issues with Jira key', {
          jiraKey: jiraIssue.key,
          issueCount: issues.length,
        });

        try {
          const issueIds = issues.map((issue) => issue.Id);
          await appScanService.bulkUpdateIssues(issueIds, app.Id, {
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
   * Enrich issues with article content and comments
   * @private
   */
  async enrichIssuesWithDetails(issues, appScanService) {
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
        const articleMarkdown =
          await appScanService.getIssueArticle(firstIssue);
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
        const comments = await appScanService.getIssueComments(issue.Id);
        issue.comments = comments || [];
      } catch (error) {
        logger.warn(`Failed to fetch comments for issue ${issue.Id}`, {
          error: error.message,
        });
        issue.comments = [];
      }

      try {
        const articleUrl = await appScanService.getFocusedArticleUrl(issue);
        issue.focusedArticleUrl = articleUrl;
      } catch (error) {
        logger.warn(`Failed to fetch article URL for issue ${issue.Id}`, {
          error: error.message,
        });
      }
    }
  }

  /**
   * Extract only the Cause and Fix recommendation sections from article markdown
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

  async getJiraIssue(issueKey) {
    this.initialize();
    return await this.service.client.issues.getIssue({
      issueIdOrKey: issueKey,
    });
  }

  async searchJiraIssues(jql) {
    this.initialize();
    return await this.service.client.issueSearch.searchForIssuesUsingJql({
      jql,
    });
  }

  getJiraUrl(issueKey) {
    const jiraHost = this.config.getJiraHost();
    return jiraHost ? `${jiraHost}/browse/${issueKey}` : null;
  }

  getProjectKey() {
    return this.config.getJiraProjectKey();
  }

  async createIssues(
    projectKey,
    groupBy,
    issues,
    appScanService,
    app = null,
    scan = null
  ) {
    this.initialize();

    try {
      logger.info('Creating Jira issues', {
        projectKey,
        groupBy,
        issueCount: issues.length,
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
        const summary = `Security: ${groupName} (${groupIssues.length} issue${groupIssues.length > 1 ? 's' : ''})`;
        const result = await this.createJiraIssue(
          projectKey,
          summary,
          groupIssues,
          this.config.getBaseUrl(),
          appScanService,
          app,
          scan
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

  isConfigured() {
    return this.config.isJiraValid();
  }
}

export default JiraService;
