/**
 * Azure DevOps Service
 * Handles interactions with Azure DevOps Advanced Security APIs
 */

import * as azdev from 'azure-devops-node-api';

export class AzdoService {
  /**
   * Create AzdoService instance
   * @param {Object} config - Configuration object
   */
  constructor(config) {
    this.config = config;
    this.connection = undefined;
  }

  /**
   * Initialize connection to Azure DevOps
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.connection) {
      return;
    }

    const pat =
      process.env.AZDO_PAT ||
      process.env.AZDO_PERSONAL_ACCESS_TOKEN ||
      process.env.AZURE_DEVOPS_PAT;

    if (!pat) {
      throw new Error(
        'Missing Azure DevOps PAT. Set AZDO_PAT or AZURE_DEVOPS_PAT environment variable.'
      );
    }

    const orgUrl = this.getOrgUrl();
    const authHandler = azdev.getPersonalAccessTokenHandler(pat);
    this.connection = new azdev.WebApi(orgUrl, authHandler);
    await this.connection.connect();
  }

  /**
   * Get organization URL from config
   * @returns {string}
   */
  getOrgUrl() {
    const baseUrl = this.config.getAzureDevOpsBaseUrl();
    const org = this.config.getAzureDevOpsOrg();

    if (!org) {
      throw new Error(
        'Missing Azure DevOps organization. Set AZURE_DEVOPS_ORG environment variable.'
      );
    }

    // Support multiple env var patterns
    const orgUrlFromEnv = process.env.AZDO_ORG_URL || process.env.AZDO_OR;

    if (orgUrlFromEnv) {
      return orgUrlFromEnv;
    }

    return `${baseUrl.replace(/\/$/, '')}/${org}`;
  }

  /**
   * Get organization connection data
   * @returns {Promise<Object>}
   */
  async getOrganization() {
    await this.connect();
    const connectionData = await this.connection.connect();
    return {
      serverUrl: this.connection.serverUrl,
      authenticatedUser: connectionData.authenticatedUser?.providerDisplayName,
      instanceId: connectionData.instanceId,
      deploymentType: connectionData.deploymentType,
    };
  }

  /**
   * List all projects (applications)
   * @returns {Promise<Array>}
   */
  async listProjects() {
    await this.connect();
    const coreApi = await this.connection.getCoreApi();
    return await coreApi.getProjects();
  }

  /**
   * Get project by ID or name
   * @param {string} projectIdOrName - Project ID or name
   * @returns {Promise<Object>}
   */
  async getProject(projectIdOrName) {
    await this.connect();
    const coreApi = await this.connection.getCoreApi();
    return await coreApi.getProject(projectIdOrName);
  }

  /**
   * List repositories for a project
   * @param {string} projectIdOrName - Project ID or name
   * @returns {Promise<Array>}
   */
  async listRepositories(projectIdOrName) {
    await this.connect();
    const project = await this.getProject(projectIdOrName);
    const gitApi = await this.connection.getGitApi();
    return await gitApi.getRepositories(project.id);
  }

  /**
   * Get repository by ID or name
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryIdOrName - Repository ID or name
   * @returns {Promise<Object>}
   */
  async getRepository(projectIdOrName, repositoryIdOrName) {
    await this.connect();
    const gitApi = await this.connection.getGitApi();
    return await gitApi.getRepository(repositoryIdOrName, projectIdOrName);
  }

  /**
   * List alerts for a repository
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {Object} options - Filter options
   * @param {string} [options.type] - Alert type filter
   * @param {string} [options.severity] - Alert severity filter
   * @returns {Promise<Array>}
   */
  async listAlerts(projectIdOrName, repositoryId, options = {}) {
    await this.connect();
    const alertApi = await this.connection.getAlertApi();

    // Build search criteria for API filtering (if supported)
    const criteria = {};
    if (options.type) {
      criteria.alertType = options.type;
    }
    if (options.severity) {
      criteria.severity = options.severity;
    }

    // Fetch ALL alerts using continuation tokens
    const pageTop = 100; // Default page size
    const allAlerts = [];
    let continuation = undefined;

    do {
      const page = await alertApi.getAlerts(
        projectIdOrName,
        repositoryId,
        pageTop,
        undefined,
        Object.keys(criteria).length > 0 ? criteria : undefined,
        continuation
      );

      // Extract alerts from response (handle different response shapes)
      let pageAlerts = [];
      if (!page) {
        pageAlerts = [];
      } else if (Array.isArray(page)) {
        pageAlerts = page;
      } else if (Array.isArray(page.value)) {
        pageAlerts = page.value;
      } else if (Array.isArray(page.result)) {
        pageAlerts = page.result;
      } else {
        pageAlerts = Array.isArray(page) ? page : [];
      }

      allAlerts.push(...pageAlerts);

      // Extract continuation token from response
      let next = null;
      if (page) {
        next =
          page.continuationToken ||
          (page.__continuation &&
            (page.__continuation.continuationToken ||
              page.__continuation.token)) ||
          null;
      }
      if (!next && Array.isArray(page) && page.continuationToken) {
        next = page.continuationToken;
      }
      if (!next && pageAlerts.length > 0) {
        const firstAlert = pageAlerts[0];
        if (
          firstAlert &&
          (firstAlert.__continuation || firstAlert.continuationToken)
        ) {
          next = firstAlert.__continuation || firstAlert.continuationToken;
        }
      }
      continuation = next || undefined;
    } while (continuation);

    // Apply client-side filters if criteria weren't supported by API
    let filtered = allAlerts;

    if (options.type) {
      filtered = filtered.filter(
        (alert) => alert.alertType?.toLowerCase() === options.type.toLowerCase()
      );
    }

    if (options.severity) {
      filtered = filtered.filter(
        (alert) =>
          alert.severity?.toLowerCase() === options.severity.toLowerCase()
      );
    }

    return filtered;
  }

  /**
   * List alerts for all repositories in a project
   * @param {string} projectIdOrName - Project ID or name
   * @param {Object} options - Filter options
   * @param {string} [options.type] - Alert type filter
   * @param {string} [options.severity] - Alert severity filter
   * @returns {Promise<Array>}
   */
  async listAlertsByProject(projectIdOrName, options = {}) {
    await this.connect();
    const project = await this.getProject(projectIdOrName);
    const repositories = await this.listRepositories(projectIdOrName);

    const allAlerts = [];

    for (const repo of repositories) {
      try {
        const alerts = await this.listAlerts(project.name, repo.id, options);
        allAlerts.push(
          ...alerts.map((alert) => ({
            ...alert,
            repositoryId: repo.id,
            repositoryName: repo.name,
            projectName: project.name,
          }))
        );
      } catch (error) {
        // Skip repositories without advanced security enabled
        if (error.statusCode !== 404) {
          throw error;
        }
      }
    }

    return allAlerts;
  }

  /**
   * Get alert details
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {number} alertId - Alert ID
   * @returns {Promise<Object>}
   */
  async getAlert(projectIdOrName, repositoryId, alertId) {
    await this.connect();
    const alertApi = await this.connection.getAlertApi();
    return await alertApi.getAlert(projectIdOrName, alertId, repositoryId);
  }

  /**
   * Update alert
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {number} alertId - Alert ID
   * @param {Object} update - Update object
   * @param {number} [update.state] - New state
   * @param {number} [update.dismissedReason] - Dismissal reason
   * @param {string} [update.dismissedComment] - Dismissal comment
   * @returns {Promise<Object>}
   */
  async updateAlert(projectIdOrName, repositoryId, alertId, update) {
    await this.connect();
    const alertApi = await this.connection.getAlertApi();
    return await alertApi.updateAlert(
      update,
      projectIdOrName,
      alertId,
      repositoryId
    );
  }
}

export default AzdoService;
