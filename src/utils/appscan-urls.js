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

/**
 * Get the Jira project URL
 * @param {string} jiraHost - Jira host URL
 * @param {string} projectKey - Jira project key (e.g., 'AGR')
 * @returns {string|null} The full URL to the Jira project
 */
export function getJiraProjectUrl(jiraHost, projectKey) {
  if (!jiraHost || !projectKey) {
    return null;
  }
  return `${jiraHost}/jira/software/c/projects/${projectKey}/summary`;
}

/**
 * Get the Azure DevOps project URL
 * @param {string} baseUrl - Azure DevOps base URL (default: https://dev.azure.com)
 * @param {string} org - Organization name
 * @param {string} project - Project name
 * @returns {string|null} The full URL to the DevOps project
 */
export function getAzureDevOpsProjectUrl(baseUrl, org, project) {
  if (!baseUrl || !org || !project) {
    return null;
  }
  return `${baseUrl}/${org}/${project}`;
}

/**
 * Get the Azure DevOps repository URL
 * @param {string} baseUrl - Azure DevOps base URL
 * @param {string} org - Organization name
 * @param {string} project - Project name
 * @param {string} repo - Repository name
 * @returns {string|null} The full URL to the repository
 */
export function getAzureDevOpsRepoUrl(baseUrl, org, project, repo) {
  if (!baseUrl || !org || !project || !repo) {
    return null;
  }
  return `${baseUrl}/${org}/${project}/_git/${repo}`;
}

/**
 * Get the Confluence space URL
 * @param {string} confluenceHost - Confluence host URL
 * @param {string} spaceKey - Space key
 * @returns {string|null} The full URL to the Confluence space
 */
export function getConfluenceSpaceUrl(confluenceHost, spaceKey) {
  if (!confluenceHost || !spaceKey) {
    return null;
  }
  return `${confluenceHost}/wiki/spaces/${spaceKey}/overview`;
}
