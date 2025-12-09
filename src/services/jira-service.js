import { Version3Client } from 'jira.js';

export class JiraService {
  constructor(config) {
    this.config = config;
    this.client = null;
  }

  initialize() {
    if (!this.config.jiraHost || !this.config.jiraEmail || !this.config.jiraApiToken) {
      throw new Error(
        'Jira credentials not configured. Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.'
      );
    }

    this.client = new Version3Client({
      host: this.config.jiraHost,
      authentication: {
        basic: {
          email: this.config.jiraEmail,
          apiToken: this.config.jiraApiToken,
        },
      },
    });

    return this.client;
  }

  async createIssue(projectKey, summary, description, issueType = 'Bug', options = {}) {
    if (!this.client) {
      this.initialize();
    }

    try {
      const issueData = {
        fields: {
          project: {
            key: projectKey,
          },
          summary: summary,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: description,
                  },
                ],
              },
            ],
          },
          issuetype: {
            name: issueType,
          },
        },
      };

      // Add optional fields
      if (options.priority) {
        issueData.fields.priority = { name: options.priority };
      }

      if (options.labels && options.labels.length > 0) {
        issueData.fields.labels = options.labels;
      }

      if (options.assignee) {
        issueData.fields.assignee = { accountId: options.assignee };
      }

      const response = await this.client.issues.createIssue(issueData);
      return response;
    } catch (error) {
      throw new Error(`Failed to create Jira issue: ${error.message}`);
    }
  }

  async getProject(projectKey) {
    if (!this.client) {
      this.initialize();
    }

    try {
      const project = await this.client.projects.getProject({ projectIdOrKey: projectKey });
      return project;
    } catch (error) {
      throw new Error(`Failed to get Jira project: ${error.message}`);
    }
  }
}

export default JiraService;
