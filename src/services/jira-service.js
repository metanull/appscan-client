let Version3Client;

// Try to import jira.js - it's an optional dependency
try {
  const jiraModule = await import('jira.js');
  Version3Client = jiraModule.Version3Client;
} catch {
  // jira.js is optional - only needed for Jira integration features
}

export class JiraService {
  constructor(config) {
    this.config = config;
    this.client = null;
  }

  initialize() {
    if (!Version3Client) {
      throw new Error(
        'jira.js package is not installed. To use Jira integration features, install it with:\n' +
        '  npm install -g jira.js@^5.2.2\n' +
        'Or if using as a library, add it to your dependencies.'
      );
    }

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
        issueData.fields.priority = options.priority;
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
