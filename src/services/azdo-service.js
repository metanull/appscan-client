/**
 * Azure DevOps Service
 * Handles interactions with Azure DevOps Advanced Security APIs
 */

import * as azdev from 'azure-devops-node-api';
import { ExpandOption } from 'azure-devops-node-api/interfaces/AlertInterfaces.js';
import { getAzdoProxyOptions } from '../utils/proxy-config.js';

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

  // ==========================================
  // Pipeline Variables Methods
  // ==========================================

  /**
   * List build definitions (pipelines) for a project
   * @param {string} projectIdOrName - Project ID or name
   * @param {Object} [options] - Optional parameters
   * @param {boolean} [options.includeAllProperties=true] - Include full definition with variables
   * @returns {Promise<Array>} Array of build definitions
   */
  async listBuildDefinitions(projectIdOrName, options = {}) {
    await this.connect();
    const buildApi = await this.connection.getBuildApi();
    const { includeAllProperties = true } = options;

    const definitions = await buildApi.getDefinitions(
      projectIdOrName,
      undefined, // name
      undefined, // repositoryId
      undefined, // repositoryType
      undefined, // queryOrder
      undefined, // top
      undefined, // continuationToken
      undefined, // minMetricsTime
      undefined, // definitionIds
      undefined, // path
      undefined, // builtAfter
      undefined, // notBuiltAfter
      includeAllProperties
    );

    return definitions || [];
  }

  /**
   * Get a specific build definition with full details (including variables)
   * @param {string} projectIdOrName - Project ID or name
   * @param {number} definitionId - Definition ID
   * @returns {Promise<Object>} Build definition with variables
   */
  async getBuildDefinition(projectIdOrName, definitionId) {
    await this.connect();
    const buildApi = await this.connection.getBuildApi();
    return await buildApi.getDefinition(projectIdOrName, definitionId);
  }

  /**
   * List variable groups for a project
   * @param {string} projectIdOrName - Project ID or name
   * @returns {Promise<Array>} Array of variable groups
   */
  async listVariableGroups(projectIdOrName) {
    await this.connect();
    const taskAgentApi = await this.connection.getTaskAgentApi();
    const groups = await taskAgentApi.getVariableGroups(projectIdOrName);
    return groups || [];
  }

  /**
   * Get a specific variable group
   * @param {string} projectIdOrName - Project ID or name
   * @param {number} groupId - Variable group ID
   * @returns {Promise<Object>} Variable group
   */
  async getVariableGroup(projectIdOrName, groupId) {
    await this.connect();
    const taskAgentApi = await this.connection.getTaskAgentApi();
    return await taskAgentApi.getVariableGroup(projectIdOrName, groupId);
  }

  /**
   * Search for pipeline variables across all pipelines in a project
   * @param {string} projectIdOrName - Project ID or name
   * @param {Object} options - Search options
   * @param {string} [options.searchValue] - Value to search for (only works for non-secret variables)
   * @param {string} [options.searchName] - Variable name to search for (case-insensitive partial match, or regex if useRegex=true)
   * @param {boolean} [options.includeSecrets=true] - Include secret variables in results (value will be null)
   * @param {boolean} [options.useRegex=false] - Treat searchName and searchValue as regex patterns
   * @returns {Promise<Array>} Array of matches { project, pipeline, variableName, variableValue, isSecret, source }
   */
  async searchPipelineVariables(projectIdOrName, options = {}) {
    const { searchValue, searchName, includeSecrets = true, useRegex = false } = options;
    const results = [];

    // Compile regex patterns if useRegex is enabled
    let nameRegex, valueRegex;
    if (useRegex) {
      if (searchName) nameRegex = new RegExp(searchName, 'i');
      if (searchValue) valueRegex = new RegExp(searchValue, 'i');
    }

    // Get all build definitions
    const definitions = await this.listBuildDefinitions(projectIdOrName, {
      includeAllProperties: true,
    });

    for (const defRef of definitions) {
      // Get full definition to access variables
      let definition;
      try {
        definition = await this.getBuildDefinition(
          projectIdOrName,
          defRef.id
        );
      } catch {
        continue;
      }

      // Search in pipeline variables
      if (definition.variables) {
        for (const [varName, varData] of Object.entries(definition.variables)) {
          const isSecret = varData.isSecret === true;
          const value = varData.value;

          // Skip secrets if not included
          if (isSecret && !includeSecrets) continue;

          // Check name match
          let nameMatches;
          if (!searchName) {
            nameMatches = true;
          } else if (useRegex) {
            nameMatches = nameRegex.test(varName);
          } else {
            nameMatches = varName.toLowerCase().includes(searchName.toLowerCase());
          }

          // Check value match (only for non-secrets)
          let valueMatches;
          if (!searchValue) {
            valueMatches = true;
          } else if (isSecret) {
            valueMatches = false;
          } else if (useRegex) {
            valueMatches = value && valueRegex.test(value);
          } else {
            valueMatches = value && value.toLowerCase().includes(searchValue.toLowerCase());
          }

          if (nameMatches && valueMatches) {
            results.push({
              projectName: projectIdOrName,
              pipelineId: definition.id,
              pipelineName: definition.name,
              pipelinePath: definition.path || '\\',
              variableName: varName,
              variableValue: isSecret ? null : value,
              isSecret,
              source: 'pipeline',
            });
          }
        }
      }

      // Search in linked variable groups
      if (definition.variableGroups) {
        for (const groupRef of definition.variableGroups) {
          // Fetch full group details to get variable values
          let group;
          try {
            group = await this.getVariableGroup(projectIdOrName, groupRef.id);
          } catch {
            continue;
          }

          if (!group.variables) continue;

          for (const [varName, varData] of Object.entries(group.variables)) {
            const isSecret = varData.isSecret === true;
            const value = varData.value;

            if (isSecret && !includeSecrets) continue;

            // Check name match
            let nameMatches;
            if (!searchName) {
              nameMatches = true;
            } else if (useRegex) {
              nameMatches = nameRegex.test(varName);
            } else {
              nameMatches = varName.toLowerCase().includes(searchName.toLowerCase());
            }

            // Check value match (only for non-secrets)
            let valueMatches;
            if (!searchValue) {
              valueMatches = true;
            } else if (isSecret) {
              valueMatches = false;
            } else if (useRegex) {
              valueMatches = value && valueRegex.test(value);
            } else {
              valueMatches = value && value.toLowerCase().includes(searchValue.toLowerCase());
            }

            if (nameMatches && valueMatches) {
              results.push({
                projectName: projectIdOrName,
                pipelineId: definition.id,
                pipelineName: definition.name,
                pipelinePath: definition.path || '\\',
                variableGroupId: group.id,
                variableGroupName: group.name,
                variableName: varName,
                variableValue: isSecret ? null : value,
                isSecret,
                source: 'variableGroup',
              });
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Search for variables in variable groups across a project
   * @param {string} projectIdOrName - Project ID or name
   * @param {Object} options - Search options
   * @param {string} [options.searchValue] - Value to search for (only works for non-secret variables)
   * @param {string} [options.searchName] - Variable name to search for (case-insensitive partial match, or regex if useRegex=true)
   * @param {boolean} [options.includeSecrets=true] - Include secret variables in results
   * @param {boolean} [options.useRegex=false] - Treat searchName and searchValue as regex patterns
   * @returns {Promise<Array>} Array of matches
   */
  async searchVariableGroups(projectIdOrName, options = {}) {
    const { searchValue, searchName, includeSecrets = true, useRegex = false } = options;
    const results = [];

    // Compile regex patterns if useRegex is enabled
    let nameRegex, valueRegex;
    if (useRegex) {
      if (searchName) nameRegex = new RegExp(searchName, 'i');
      if (searchValue) valueRegex = new RegExp(searchValue, 'i');
    }

    // Get list of variable groups (may not include full variable values)
    const groupList = await this.listVariableGroups(projectIdOrName);

    for (const groupRef of groupList) {
      // Fetch full group details to get variable values
      let group;
      try {
        group = await this.getVariableGroup(projectIdOrName, groupRef.id);
      } catch {
        continue;
      }

      if (!group.variables) continue;

      for (const [varName, varData] of Object.entries(group.variables)) {
        const isSecret = varData.isSecret === true;
        const value = varData.value;

        if (isSecret && !includeSecrets) continue;

        // Check name match
        let nameMatches;
        if (!searchName) {
          nameMatches = true;
        } else if (useRegex) {
          nameMatches = nameRegex.test(varName);
        } else {
          nameMatches = varName.toLowerCase().includes(searchName.toLowerCase());
        }

        // Check value match (only for non-secrets)
        let valueMatches;
        if (!searchValue) {
          valueMatches = true;
        } else if (isSecret) {
          valueMatches = false;
        } else if (useRegex) {
          valueMatches = value && valueRegex.test(value);
        } else {
          valueMatches = value && value.toLowerCase().includes(searchValue.toLowerCase());
        }

        if (nameMatches && valueMatches) {
          results.push({
            projectName: projectIdOrName,
            variableGroupId: group.id,
            variableGroupName: group.name,
            variableName: varName,
            variableValue: isSecret ? null : value,
            isSecret,
            source: 'variableGroup',
          });
        }
      }
    }

    return results;
  }
}

export default AzdoService;
