/**
 * Azure DevOps Service
 * Handles interactions with Azure DevOps Advanced Security APIs
 */

import * as azdev from 'azure-devops-node-api';

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
   * @param {string} [options.type] - Alert type filter. Valid values: 'unknown', 'dependency', 'secret', 'code', 'license'
   * @param {string} [options.severity] - Severity filter. Valid values: 'low', 'medium', 'high', 'critical', 'note', 'warning', 'error', 'undefined'
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

    return allAlerts;
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
