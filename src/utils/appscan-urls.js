/**
 * AppScan URL utilities
 * Centralized URL generation for AppScan resources
 */

/**
 * Get the AppScan URL for a specific application
 * @param {string} baseUrl - AppScan base URL
 * @param {string} appId - Application ID
 * @returns {string} The full URL to the application in AppScan
 */
export function getApplicationUrl(baseUrl, appId) {
  return `${baseUrl}/main/myapps/${appId}`;
}

/**
 * Get the AppScan URL for a specific scan
 * @param {string} baseUrl - AppScan base URL
 * @param {string} appId - Application ID
 * @param {string} scanId - Scan ID
 * @returns {string} The full URL to the scan in AppScan
 */
export function getScanUrl(baseUrl, appId, scanId) {
  return `${baseUrl}/main/myapps/${appId}/scans/${scanId}`;
}

/**
 * Get the AppScan URL for a specific issue
 * @param {string} baseUrl - AppScan base URL
 * @param {string} appId - Application ID
 * @param {string} issueId - Issue ID
 * @returns {string} The full URL to the issue in AppScan
 */
export function getIssueUrl(baseUrl, appId, issueId) {
  return `${baseUrl}/main/myapps/${appId}/issues/${issueId}`;
}

/**
 * Get the Jira URL for a specific issue
 * @param {string} jiraHost - Jira host URL (e.g., 'https://jira.company.com')
 * @param {string} issueKey - Jira issue key (e.g., 'PROJ-123')
 * @returns {string|null} The full URL to the Jira issue, or null if jiraHost is not provided
 */
export function getJiraUrl(jiraHost, issueKey) {
  if (!jiraHost || !issueKey) {
    return null;
  }
  return `${jiraHost}/browse/${issueKey}`;
}
