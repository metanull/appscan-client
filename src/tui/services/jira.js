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

  async createJiraIssue(projectKey, summary, issues, baseUrl) {
    this.initialize();

    try {
      logger.info('Creating Jira issue', {
        projectKey,
        summary,
        issueCount: issues.length,
      });

      const builder = new JiraDescriptionBuilder(issues, baseUrl);
      const description = builder
        .addSummary(null, null)
        .addIssuesByType()
        .addIssueIds()
        .build();

      const jiraIssue = await this.service.client.issues.createIssue({
        fields: {
          project: { key: projectKey },
          summary: summary,
          description: this.service.convertToADF(description),
          issuetype: { name: 'Bug' },
          labels: ['appscan', 'security'],
        },
      });

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

  async createIssues(projectKey, groupBy, issues) {
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
        grouped = Object.fromEntries(issues.map((i, idx) => [`Issue ${idx + 1}`, [i]]));
      }

      const results = [];
      for (const [groupName, groupIssues] of Object.entries(grouped)) {
        const summary = `Security: ${groupName} (${groupIssues.length} issue${groupIssues.length > 1 ? 's' : ''})`;
        const result = await this.createJiraIssue(
          projectKey,
          summary,
          groupIssues,
          this.config.getAppScanBaseUrl()
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
