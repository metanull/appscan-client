import chalk from 'chalk';

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

  /**
   * Convert markdown-like text to JIRA ADF (Atlassian Document Format)
   */
  convertToADF(markdownText) {
    const lines = markdownText.split('\n');
    const content = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Empty line
      if (line.trim() === '') {
        continue;
      }
      
      // Heading 1
      if (line.startsWith('# ')) {
        content.push({
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: line.substring(2) }]
        });
      }
      // Heading 2
      else if (line.startsWith('## ')) {
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: line.substring(3) }]
        });
      }
      // Heading 3
      else if (line.startsWith('### ')) {
        content.push({
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: line.substring(4) }]
        });
      }
      // Heading 4
      else if (line.startsWith('#### ')) {
        content.push({
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: line.substring(5) }]
        });
      }
      // Heading 5
      else if (line.startsWith('##### ')) {
        content.push({
          type: 'heading',
          attrs: { level: 5 },
          content: [{ type: 'text', text: line.substring(6) }]
        });
      }
      // Heading 6
      else if (line.startsWith('###### ')) {
        content.push({
          type: 'heading',
          attrs: { level: 6 },
          content: [{ type: 'text', text: line.substring(7) }]
        });
      }
      // Bullet list item
      else if (line.startsWith('- ')) {
        // Check if we need to start a new list or continue existing
        const listItem = {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: this.parseInlineContent(line.substring(2))
          }]
        };
        
        // Look back to see if previous item was a list
        if (content.length > 0 && content[content.length - 1].type === 'bulletList') {
          content[content.length - 1].content.push(listItem);
        } else {
          content.push({
            type: 'bulletList',
            content: [listItem]
          });
        }
      }
      // Regular paragraph
      else {
        content.push({
          type: 'paragraph',
          content: this.parseInlineContent(line)
        });
      }
    }
    
    return {
      type: 'doc',
      version: 1,
      content: content.length > 0 ? content : [{
        type: 'paragraph',
        content: [{ type: 'text', text: markdownText }]
      }]
    };
  }

  /**
   * Parse inline content (links, bold, etc.)
   */
  parseInlineContent(text) {
    const content = [];
    
    // Simple link pattern: [text](url)
    const linkPattern = /\[([^\]]+)\]\(([^\)]+)\)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = linkPattern.exec(text)) !== null) {
      // Add text before link
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          content.push({ type: 'text', text: beforeText });
        }
      }
      
      // Add link
      content.push({
        type: 'text',
        text: match[1],
        marks: [{
          type: 'link',
          attrs: { href: match[2] }
        }]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      content.push({ type: 'text', text: text.substring(lastIndex) });
    }
    
    return content.length > 0 ? content : [{ type: 'text', text: text }];
  }

  async createIssue(projectKey, summary, description, issueType = 'Bug', options = {}) {
    if (!this.client) {
      this.initialize();
    }

    let issueData;
    try {
      issueData = {
        fields: {
          project: {
            key: projectKey,
          },
          summary: summary,
          description: typeof description === 'string' 
            ? this.convertToADF(description)
            : description,
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

      // Log the description length for debugging
      const descriptionJson = JSON.stringify(issueData.fields.description);
      const descriptionLength = descriptionJson.length;
      console.log(chalk.gray(`\nJIRA Description length: ${descriptionLength} characters`));
      console.log(chalk.gray(`ADF nodes: ${issueData.fields.description.content?.length || 0} nodes\n`));
      
      const response = await this.client.issues.createIssue(issueData);
      return response;
    } catch (error) {
      // Provide detailed error information for debugging
      let errorMessage = `Failed to create Jira issue: ${error.message}`;
      
      if (error.response) {
        errorMessage += `\n  Status: ${error.response.status}`;
        if (error.response.data) {
          errorMessage += `\n  Details: ${JSON.stringify(error.response.data, null, 2)}`;
        }
      }
      
      // Add description size info for CONTENT_LIMIT_EXCEEDED errors
      if (issueData && error.response?.data?.errorMessages?.includes('CONTENT_LIMIT_EXCEEDED')) {
        const descriptionJson = JSON.stringify(issueData.fields.description);
        errorMessage += `\n  Description size: ${descriptionJson.length} characters`;
        errorMessage += `\n  Description nodes: ${issueData.fields.description.content?.length || 0} nodes`;
        errorMessage += `\n  Note: JIRA has a content limit (typically 32KB for description field)`;
      }
      
      throw new Error(errorMessage);
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

  /**
   * Get available issue types for a project
   * @param {string} projectKey - Project key
   * @returns {Promise<Array>} Array of issue types
   */
  async getProjectIssueTypes(projectKey) {
    if (!this.client) {
      this.initialize();
    }

    try {
      const project = await this.client.projects.getProject({ 
        projectIdOrKey: projectKey,
        expand: 'issueTypes'
      });
      return project.issueTypes || [];
    } catch (error) {
      throw new Error(`Failed to get project issue types: ${error.message}`);
    }
  }

  /**
   * Search for JIRA issues by summary text
   * @param {string} summaryText - Text to search for in issue summaries
   * @param {string} projectKey - Optional project key to limit search
   * @returns {Promise<Array>} Array of matching issues
   */
  async searchIssuesBySummary(summaryText, projectKey = null) {
    if (!this.client) {
      this.initialize();
    }

    try {
      // Build JQL query
      let jql = `summary ~ "${summaryText.replace(/"/g, '\\"')}"`;
      if (projectKey) {
        jql += ` AND project = ${projectKey}`;
      }
      jql += ' ORDER BY created DESC';

      // Use the correct v3 API method: searchForIssuesUsingJqlEnhancedSearch
      // This is the new recommended endpoint that replaced the deprecated searchForIssuesUsingJql
      const response = await this.client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
        jql,
        maxResults: 50,
        fields: ['summary', 'status', 'key', 'created', 'updated'],
        validateQuery: 'strict'
      });

      return response.issues || [];
    } catch {
      // Don't throw error, just return empty array and log warning
      // Silently fail for JIRA search to not interrupt triage workflow
      return [];
    }
  }

  /**
   * Find JIRA issue for a specific scan
   * @param {string} scanName - Scan name to search for
   * @param {string} projectKey - Optional project key
   * @returns {Promise<Object|null>} JIRA issue if found, null otherwise
   */
  async findIssueForScan(scanName, projectKey = null) {
    try {
      const searchText = `[Security] ${scanName}`;
      const issues = await this.searchIssuesBySummary(searchText, projectKey);
      
      // Return the most recent issue that matches
      if (issues.length > 0) {
        return {
          key: issues[0].key,
          summary: issues[0].fields.summary,
          status: issues[0].fields.status.name,
          url: `${this.config.jiraHost}/browse/${issues[0].key}`,
          created: issues[0].fields.created,
          updated: issues[0].fields.updated
        };
      }
      
      return null;
    } catch {
      // Silent failure - just return null
      return null;
    }
  }
}

export default JiraService;
