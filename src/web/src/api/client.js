/**
 * API client for Web UI
 * Communicates with the Express server API
 */

const API_BASE = '/api';

class ApiClient {
  async fetchJSON(url, options = {}) {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Applications
  async getApplications() {
    return this.fetchJSON('/applications');
  }

  // Scans
  async getScans(appId) {
    return this.fetchJSON(`/applications/${appId}/scans`);
  }

  // Issues
  async getIssues(scanId, excludeStatus = 'Noise,Passed') {
    const params = new URLSearchParams({ excludeStatus });
    return this.fetchJSON(`/scans/${scanId}/issues?${params}`);
  }

  async getAllIssuesForApp(appId, excludeStatus = 'Noise,Passed') {
    const params = new URLSearchParams({ excludeStatus });
    return this.fetchJSON(`/applications/${appId}/issues?${params}`);
  }

  async getIssueDetails(issueId) {
    return this.fetchJSON(`/issues/${issueId}/details`);
  }

  async getIssueArticle(issueId) {
    return this.fetchJSON(`/issues/${issueId}/article`);
  }

  async getIssueComments(issueId) {
    return this.fetchJSON(`/issues/${issueId}/comments`);
  }

  async updateIssueStatus(issueId, status, comment = null, externalId = null) {
    return this.fetchJSON(`/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment, externalId }),
    });
  }

  async bulkUpdateIssueStatus(issueIds, status, comment = null) {
    return this.fetchJSON('/issues/bulk/status', {
      method: 'PUT',
      body: JSON.stringify({ issueIds, status, comment }),
    });
  }

  // Jira
  async createJiraIssue(issues, projectKey, issueType, labels = []) {
    return this.fetchJSON('/jira/issue', {
      method: 'POST',
      body: JSON.stringify({ issues, projectKey, issueType, labels }),
    });
  }

  async linkJiraIssue(issueId, jiraKey) {
    return this.fetchJSON(`/issues/${issueId}/jira/link`, {
      method: 'PUT',
      body: JSON.stringify({ jiraKey }),
    });
  }

  async unlinkJiraIssue(issueId) {
    return this.fetchJSON(`/issues/${issueId}/jira/link`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
