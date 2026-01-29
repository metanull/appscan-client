/**
 * Azure DevOps Service
 * Handles interactions with Azure DevOps Advanced Security APIs
 */

import * as azdev from 'azure-devops-node-api';
import axios from 'axios';
import { ExpandOption } from 'azure-devops-node-api/interfaces/AlertInterfaces.js';
import {
  getAzdoProxyOptions,
  getAxiosProxyConfig,
} from '../utils/proxy-config.js';

/**
 * Alert Type enum mapping
 * @see https://docs.microsoft.com/en-us/rest/api/azure/devops/alert/alerts/list
 */
export const AlertType = {
  Unknown: 0,
  Dependency: 1,
  Secret: 2,
  Code: 3,
  License: 4,
};

/**
 * Severity enum mapping
 */
export const Severity = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
  Note: 4,
  Warning: 5,
  Error: 6,
  Undefined: 7,
};

/**
 * State enum mapping
 */
export const State = {
  Unknown: 0,
  Active: 1,
  Dismissed: 2,
  Fixed: 4,
  AutoDismissed: 8,
};

/**
 * DismissalType enum mapping
 */
export const DismissalType = {
  Unknown: 0,
  Fixed: 1,
  AcceptedRisk: 2,
  FalsePositive: 3,
  AgreedToGuidance: 4,
  ToolUpgrade: 5,
};

/**
 * Convert alert type name to numeric value
 * @param {string} typeName - Alert type name (e.g., 'secret', 'dependency')
 * @returns {number} Alert type enum value
 */
function getAlertTypeValue(typeName) {
  const normalized = typeName.toLowerCase();
  const typeMap = {
    unknown: AlertType.Unknown,
    dependency: AlertType.Dependency,
    secret: AlertType.Secret,
    code: AlertType.Code,
    license: AlertType.License,
  };
  if (!(normalized in typeMap)) {
    throw new Error(
      `Invalid alert type: ${typeName}. Valid values: Unknown, Dependency, Secret, Code, License`
    );
  }
  return typeMap[normalized];
}

/**
 * Convert severity name to numeric value
 * @param {string} severityName - Severity name (e.g., 'critical', 'high')
 * @returns {number} Severity enum value
 */
function getSeverityValue(severityName) {
  const normalized = severityName.toLowerCase();
  const severityMap = {
    low: Severity.Low,
    medium: Severity.Medium,
    high: Severity.High,
    critical: Severity.Critical,
    note: Severity.Note,
    warning: Severity.Warning,
    error: Severity.Error,
    undefined: Severity.Undefined,
  };
  if (!(normalized in severityMap)) {
    throw new Error(
      `Invalid severity: ${severityName}. Valid values: Low, Medium, High, Critical, Note, Warning, Error, Undefined`
    );
  }
  return severityMap[normalized];
}

/**
 * Convert state name to numeric value
 * @param {string} stateName - State name (e.g., 'active', 'dismissed')
 * @returns {number} State enum value
 */
export function getStateValue(stateName) {
  const normalized = stateName.toLowerCase();
  const stateMap = {
    unknown: State.Unknown,
    active: State.Active,
    dismissed: State.Dismissed,
    fixed: State.Fixed,
    autodismissed: State.AutoDismissed,
  };
  if (!(normalized in stateMap)) {
    throw new Error(
      `Invalid state: ${stateName}. Valid values: Unknown, Active, Dismissed, Fixed, AutoDismissed`
    );
  }
  return stateMap[normalized];
}

/**
 * Convert dismissal type name to numeric value
 * @param {string} dismissalTypeName - Dismissal type name (e.g., 'falsepositive')
 * @returns {number} DismissalType enum value
 */
export function getDismissalTypeValue(dismissalTypeName) {
  const normalized = dismissalTypeName.toLowerCase().replace(/[_-]/g, '');
  const dismissalMap = {
    unknown: DismissalType.Unknown,
    fixed: DismissalType.Fixed,
    acceptedrisk: DismissalType.AcceptedRisk,
    falsepositive: DismissalType.FalsePositive,
    agreedtoguidance: DismissalType.AgreedToGuidance,
    toolupgrade: DismissalType.ToolUpgrade,
  };
  if (!(normalized in dismissalMap)) {
    throw new Error(
      `Invalid dismissal type: ${dismissalTypeName}. Valid values: Unknown, Fixed, AcceptedRisk, FalsePositive, AgreedToGuidance, ToolUpgrade`
    );
  }
  return dismissalMap[normalized];
}

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
    const proxyOptions = await getAzdoProxyOptions();
    this.connection = new azdev.WebApi(orgUrl, authHandler, proxyOptions);
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
   * @param {string} [options.type] - Alert type filter. Valid values: 'unknown', 'dependency', 'secret', 'code', 'license'
   * @param {string} [options.severity] - Severity filter. Valid values: 'low', 'medium', 'high', 'critical', 'note', 'warning', 'error', 'undefined'
   * @param {number} [options.top=10000] - Maximum number of alerts to return. Azure DevOps supports up to 10,000 items per request.
   * @returns {Promise<Array>}
   */
  async listAlerts(projectIdOrName, repositoryId, options = {}) {
    await this.connect();
    const alertApi = await this.connection.getAlertApi();

    // Build search criteria for API filtering
    const criteria = {};
    if (options.type) {
      // Convert type name to numeric enum value
      criteria.alertType = getAlertTypeValue(options.type);
    }
    if (options.severity) {
      // Convert severity name to numeric enum value
      criteria.severity = getSeverityValue(options.severity);
    }

    // NOTE: The azure-devops-node-api package does NOT expose the continuation token
    // from the x-ms-continuationtoken HTTP header. The only way to get all alerts
    // is to use a large 'top' value. Azure DevOps supports up to 10,000 items per request.
    const top = options.top !== undefined ? options.top : 10000;

    const page = await alertApi.getAlerts(
      projectIdOrName,
      repositoryId,
      top,
      undefined, // orderBy
      Object.keys(criteria).length > 0 ? criteria : undefined, // criteria
      undefined, // expand
      undefined // continuationToken
    );

    // Extract alerts from response (handle different response shapes)
    if (!page) {
      return [];
    }
    if (Array.isArray(page)) {
      return page;
    }
    if (Array.isArray(page.value)) {
      return page.value;
    }
    if (Array.isArray(page.result)) {
      return page.result;
    }
    return [];
  }

  /**
   * List alerts for all repositories in a project
   * @param {string} projectIdOrName - Project ID or name
   * @param {Object} options - Filter options
   * @param {string} [options.type] - Alert type filter. Valid values: 'unknown', 'dependency', 'secret', 'code', 'license'
   * @param {string} [options.severity] - Severity filter. Valid values: 'low', 'medium', 'high', 'critical', 'note', 'warning', 'error', 'undefined'
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
        const isAdvSecurityNotEnabled =
          error.statusCode === 404 ||
          error.message?.includes('Advanced Security is not enabled') ||
          error.message?.includes('VS2150009');
        if (!isAdvSecurityNotEnabled) {
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
   * @param {Object} [options] - Optional parameters
   * @param {boolean} [options.includeFingerprint=true] - Include validation fingerprint (for secret alerts)
   * @returns {Promise<Object>}
   */
  async getAlert(projectIdOrName, repositoryId, alertId, options = {}) {
    await this.connect();
    const alertApi = await this.connection.getAlertApi();
    const { includeFingerprint = true } = options;
    const expand = includeFingerprint
      ? ExpandOption.ValidationFingerprint
      : ExpandOption.None;
    return await alertApi.getAlert(
      projectIdOrName,
      alertId,
      repositoryId,
      undefined, // ref
      expand
    );
  }

  /**
   * Update alert
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {number} alertId - Alert ID
   * @param {Object} update - Update object
   * @param {number} [update.state] - New state
   * @param {number} [update.severity] - New severity level
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

  /**
   * Get the base URL for Azure DevOps Search API
   * @returns {string}
   */
  getSearchBaseUrl() {
    const searchBaseUrl = this.config.getAzureDevOpsSearchBaseUrl();
    const org = this.config.getAzureDevOpsOrg();

    if (!org) {
      throw new Error(
        'Missing Azure DevOps organization. Set AZURE_DEVOPS_ORG environment variable.'
      );
    }

    return `${searchBaseUrl.replace(/\/$/, '')}/${org}`;
  }

  /**
   * Search code across Azure DevOps repositories
   * Uses the Azure DevOps Search API (almsearch.dev.azure.com)
   * @see https://learn.microsoft.com/en-us/rest/api/azure/devops/search/code-search-results/fetch-code-search-results
   * @param {string} searchText - The search text
   * @param {Object} [options] - Search options
   * @param {string} [options.projectId] - Filter by project ID or name
   * @param {string} [options.repositoryId] - Filter by repository ID or name
   * @param {string} [options.path] - Filter by file path
   * @param {string} [options.branch] - Filter by branch name
   * @param {number} [options.top=50] - Number of results to return
   * @param {number} [options.skip=0] - Number of results to skip
   * @param {boolean} [options.includeSnippet=true] - Include matched code snippets
   * @returns {Promise<Object>} Search response with count, results, and facets
   */
  async codeSearch(searchText, options = {}) {
    await this.connect();

    const pat =
      process.env.AZDO_PAT ||
      process.env.AZDO_PERSONAL_ACCESS_TOKEN ||
      process.env.AZURE_DEVOPS_PAT;

    if (!pat) {
      throw new Error(
        'Missing Azure DevOps PAT. Set AZDO_PAT or AZURE_DEVOPS_PAT environment variable.'
      );
    }

    const {
      projectId,
      repositoryId,
      path,
      branch,
      top = 50,
      skip = 0,
      includeSnippet = true,
    } = options;

    const filters = {};
    if (projectId) {
      filters.Project = [projectId];
    }
    if (repositoryId) {
      filters.Repository = [repositoryId];
    }
    if (path) {
      filters.Path = [path];
    }
    if (branch) {
      filters.Branch = [branch];
    }

    const requestBody = {
      searchText,
      $skip: skip,
      $top: top,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      includeSnippet,
      includeFacets: true,
    };

    const searchUrl = projectId
      ? `${this.getSearchBaseUrl()}/${projectId}/_apis/search/codesearchresults?api-version=7.2-preview.1`
      : `${this.getSearchBaseUrl()}/_apis/search/codesearchresults?api-version=7.2-preview.1`;

    const proxyConfig = await getAxiosProxyConfig();

    const response = await axios.post(searchUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`,
      },
      ...proxyConfig,
    });

    return response.data;
  }

  /**
   * List all secret alerts across all projects and repositories
   * @param {Object} [options] - Filter options
   * @param {string} [options.projectId] - Filter by project ID or name
   * @param {string} [options.repositoryId] - Filter by repository ID (requires projectId)
   * @param {boolean} [options.includeFixed=false] - Include fixed alerts
   * @param {boolean} [options.includeDismissed=false] - Include dismissed alerts
   * @param {boolean} [options.includeFingerprint=true] - Include fingerprint data for each alert
   * @param {Function} [options.onProgress] - Progress callback (processedRepos, totalRepos, alertsFound)
   * @returns {Promise<Array>} Array of secret alerts with project/repo metadata
   */
  async listAllSecretAlerts(options = {}) {
    await this.connect();

    const {
      projectId,
      repositoryId,
      includeFixed = false,
      includeDismissed = false,
      includeFingerprint = true,
      onProgress,
    } = options;

    const allAlerts = [];

    // Get projects to scan
    let projects;
    if (projectId) {
      const project = await this.getProject(projectId);
      projects = [project];
    } else {
      projects = await this.listProjects();
    }

    // Count total repositories for progress tracking
    let totalRepos = 0;
    const projectRepos = new Map();

    for (const project of projects) {
      try {
        let repos;
        if (repositoryId && projectId) {
          const repo = await this.getRepository(project.id, repositoryId);
          repos = repo ? [repo] : [];
        } else {
          repos = await this.listRepositories(project.id);
        }
        projectRepos.set(project.id, repos);
        totalRepos += repos?.length || 0;
      } catch {
        projectRepos.set(project.id, []);
      }
    }

    let processedRepos = 0;

    for (const project of projects) {
      const repos = projectRepos.get(project.id) || [];

      for (const repo of repos) {
        processedRepos++;

        if (onProgress) {
          onProgress(processedRepos, totalRepos, allAlerts.length);
        }

        try {
          const alerts = await this.listAlerts(project.name, repo.id, {
            type: 'secret',
          });

          if (alerts && alerts.length > 0) {
            for (const alert of alerts) {
              // Filter by state
              if (!includeFixed && alert.state === State.Fixed) {
                continue;
              }
              if (
                !includeDismissed &&
                (alert.state === State.Dismissed ||
                  alert.state === State.AutoDismissed)
              ) {
                continue;
              }

              let alertData = alert;

              if (includeFingerprint) {
                try {
                  alertData = await this.getAlert(
                    project.name,
                    repo.id,
                    alert.alertId,
                    { includeFingerprint: true }
                  );

                  // Re-check state after fetching full details
                  if (!includeFixed && alertData.state === State.Fixed) {
                    continue;
                  }
                  if (
                    !includeDismissed &&
                    (alertData.state === State.Dismissed ||
                      alertData.state === State.AutoDismissed)
                  ) {
                    continue;
                  }
                } catch {
                  // Use basic alert if details fetch fails
                }
              }

              allAlerts.push({
                ...alertData,
                projectId: project.id,
                projectName: project.name,
                repositoryId: repo.id,
                repositoryName: repo.name,
              });
            }
          }
        } catch (error) {
          // Skip repositories without advanced security enabled
          const isAdvSecurityNotEnabled =
            error.statusCode === 404 ||
            error.message?.includes('Advanced Security is not enabled') ||
            error.message?.includes('VS2150009');
          if (!isAdvSecurityNotEnabled) {
            throw error;
          }
        }
      }
    }

    return allAlerts;
  }
}

export default AzdoService;
