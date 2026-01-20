/**
 * Azure DevOps Service Wrapper for TUI
 * Provides UI-specific helpers and audit logging for write operations
 */

import { AzdoService as ParentAzdoService } from '../../services/azdo-service.js';
import {
  State,
  DismissalType,
  getStateValue,
  getDismissalTypeValue,
} from '../../services/azdo-service.js';
import { auditService } from '../utils/audit.js';
import logger from '../../utils/logger.js';
import { Config } from '../../utils/config.js';

export class AzdoService {
  /**
   * @param {string|null} configPath - Optional path to config file
   */
  constructor(configPath = null) {
    this.config = configPath ? Config.loadFromFile(configPath) : new Config();
    this.service = new ParentAzdoService(this.config);

    logger.info('TUI AzdoService initialized', {
      configValid: this.config.isAzdoValid(),
      baseUrl: this.config.getAzureDevOpsBaseUrl(),
      org: this.config.getAzureDevOpsOrg(),
      hasJira: this.config.isJiraValid(),
    });
  }

  // ==========================================
  // Delegated Read Methods (no modification)
  // ==========================================

  /**
   * Retrieves organization details from Azure DevOps
   * @returns {Promise<Object>} Organization details
   */
  async getOrganization() {
    return this.service.getOrganization();
  }

  /**
   * Retrieves all projects (applications) from Azure DevOps
   * @returns {Promise<Array>} Array of project objects
   */
  async listProjects() {
    return this.service.listProjects();
  }

  /**
   * Retrieves a specific project
   * @param {string} projectIdOrName - Project ID or name
   * @returns {Promise<Object>} Project object
   */
  async getProject(projectIdOrName) {
    return this.service.getProject(projectIdOrName);
  }

  /**
   * Retrieves repositories for a specific project
   * @param {string} projectIdOrName - Project ID or name
   * @returns {Promise<Array>} Array of repository objects
   */
  async listRepositories(projectIdOrName) {
    return this.service.listRepositories(projectIdOrName);
  }

  /**
   * Retrieves a specific repository
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryIdOrName - Repository ID or name
   * @returns {Promise<Object>} Repository object
   */
  async getRepository(projectIdOrName, repositoryIdOrName) {
    return this.service.getRepository(projectIdOrName, repositoryIdOrName);
  }

  /**
   * Retrieves alerts for a specific repository
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of alert objects
   */
  async listAlerts(projectIdOrName, repositoryId, options = {}) {
    return this.service.listAlerts(projectIdOrName, repositoryId, options);
  }

  /**
   * Retrieves alerts for all repositories in a project
   * @param {string} projectIdOrName - Project ID or name
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of alert objects with repository info
   */
  async listAlertsByProject(projectIdOrName, options = {}) {
    return this.service.listAlertsByProject(projectIdOrName, options);
  }

  /**
   * Retrieves detailed information for a specific alert
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {number} alertId - Alert ID
   * @returns {Promise<Object>} Alert details object
   */
  async getAlert(projectIdOrName, repositoryId, alertId) {
    return this.service.getAlert(projectIdOrName, repositoryId, alertId);
  }

  // ==========================================
  // Write Methods with Audit Logging
  // ==========================================

  /**
   * Updates a single alert with audit logging
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {number} alertId - Alert ID
   * @param {Object} updateData - Update data (state, dismissedReason, dismissedComment)
   * @returns {Promise<Object>} Updated alert object
   */
  async updateAlert(projectIdOrName, repositoryId, alertId, updateData) {
    try {
      logger.info('Updating alert', {
        project: projectIdOrName,
        repository: repositoryId,
        alertId,
        updateData,
      });

      const result = await this.service.updateAlert(
        projectIdOrName,
        repositoryId,
        alertId,
        updateData
      );

      auditService.logAzdoUpdate(
        'success',
        projectIdOrName,
        repositoryId,
        [alertId],
        updateData
      );

      return result;
    } catch (error) {
      logger.error('Failed to update alert', {
        project: projectIdOrName,
        repository: repositoryId,
        alertId,
        updateData,
        error: error.message,
      });

      auditService.logAzdoUpdate(
        'failure',
        projectIdOrName,
        repositoryId,
        [alertId],
        updateData,
        error
      );

      throw error;
    }
  }

  /**
   * Updates multiple alerts in bulk with chunking and progress callback
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {Array<number>} alertIds - Array of alert IDs
   * @param {Object} updateData - Update data
   * @param {number} chunkSize - Number of alerts to update per chunk (default: 10)
   * @param {Function} onProgress - Progress callback (current, total)
   * @returns {Promise<Array>} Array of update results
   */
  async bulkUpdateAlertsChunked(
    projectIdOrName,
    repositoryId,
    alertIds,
    updateData,
    chunkSize = 10,
    onProgress = null
  ) {
    const results = [];
    const total = alertIds.length;

    logger.info('Starting bulk alert update', {
      project: projectIdOrName,
      repository: repositoryId,
      totalAlerts: total,
      chunkSize,
    });

    for (let i = 0; i < alertIds.length; i += chunkSize) {
      const chunk = alertIds.slice(i, i + chunkSize);

      // Update each alert in the chunk
      for (const alertId of chunk) {
        try {
          const result = await this.updateAlert(
            projectIdOrName,
            repositoryId,
            alertId,
            updateData
          );
          results.push({ alertId, success: true, result });
        } catch (error) {
          results.push({ alertId, success: false, error: error.message });
        }

        // Report progress
        if (onProgress) {
          onProgress(results.length, total);
        }
      }
    }

    logger.info('Bulk alert update completed', {
      total,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });

    return results;
  }

  // ==========================================
  // TUI-Specific Utilities
  // ==========================================

  /**
   * Get alert count for a repository
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {Object} options - Filter options
   * @returns {Promise<number>} Count of alerts
   */
  async getRepositoryAlertCount(projectIdOrName, repositoryId, options = {}) {
    try {
      const alerts = await this.listAlerts(
        projectIdOrName,
        repositoryId,
        options
      );
      return alerts.length;
    } catch (error) {
      if (error.statusCode === 404) {
        return 0;
      }
      throw error;
    }
  }

  /**
   * Get alert count for a project (all repositories)
   * @param {string} projectIdOrName - Project ID or name
   * @param {Object} options - Filter options
   * @returns {Promise<number>} Count of alerts
   */
  async getProjectAlertCount(projectIdOrName, options = {}) {
    try {
      const alerts = await this.listAlertsByProject(projectIdOrName, options);
      return alerts.length;
    } catch {
      // Return 0 if project has no alerts or if there's an error
      return 0;
    }
  }

  /**
   * Get repository count for a project
   * @param {string} projectIdOrName - Project ID or name
   * @returns {Promise<number>} Count of repositories
   */
  async getProjectRepositoryCount(projectIdOrName) {
    try {
      const repos = await this.listRepositories(projectIdOrName);
      return repos.length;
    } catch {
      // Return 0 if project has no repos or if there's an error
      return 0;
    }
  }

  /**
   * Get Azure DevOps alert URL
   * @param {Object} alert - Alert object
   * @returns {string} Alert URL
   */
  getAlertUrl(alert) {
    const orgUrl = this.service.getOrgUrl();
    const projectName = alert.projectName || alert.project?.name;
    const repoId = alert.repositoryId || alert.repository?.id;
    const alertId = alert.alertId || alert.id;

    if (!projectName || !repoId || !alertId) {
      return orgUrl;
    }

    return `${orgUrl}/${encodeURIComponent(projectName)}/_git/${repoId}/alerts/${alertId}`;
  }

  /**
   * Get Azure DevOps project URL
   * @param {Object} project - Project object
   * @returns {string} Project URL
   */
  getProjectUrl(project) {
    const orgUrl = this.service.getOrgUrl();
    const projectName = project.name;

    if (!projectName) {
      return orgUrl;
    }

    return `${orgUrl}/${encodeURIComponent(projectName)}`;
  }

  /**
   * Get Azure DevOps repository URL
   * @param {Object} repository - Repository object
   * @param {string} projectName - Project name
   * @returns {string} Repository URL
   */
  getRepositoryUrl(repository, projectName) {
    const orgUrl = this.service.getOrgUrl();

    if (!projectName || !repository.id) {
      return orgUrl;
    }

    return `${orgUrl}/${encodeURIComponent(projectName)}/_git/${repository.id}`;
  }

  /**
   * Get Jira URL from config
   * @returns {string} Jira URL
   */
  getJiraUrl() {
    const jiraHost = this.config.getJiraHost();
    return jiraHost || '';
  }

  /**
   * Get config instance
   * @returns {Config} Config instance
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get base URL
   * @returns {string} Base URL
   */
  getBaseUrl() {
    return this.service.getOrgUrl();
  }

  /**
   * Parse metadata from alert comment (Jira ID and custom fields stored as JSON)
   * @param {Object} alert - Alert object
   * @returns {Object} Parsed metadata { jiraId, customFields }
   */
  parseAlertMetadata(alert) {
    const metadata = {
      jiraId: null,
      customFields: {},
    };

    if (!alert.dismissal || !alert.dismissal.message) {
      return metadata;
    }

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(alert.dismissal.message);
      if (parsed.jiraId) {
        metadata.jiraId = parsed.jiraId;
      }
      if (parsed.customFields) {
        metadata.customFields = parsed.customFields;
      }
    } catch {
      // Not JSON, ignore
    }

    return metadata;
  }

  /**
   * Build comment with metadata (Jira ID and custom fields as JSON)
   * @param {string} comment - User comment
   * @param {string} jiraId - Jira issue ID
   * @param {Object} customFields - Custom fields
   * @returns {string} Comment with embedded metadata
   */
  buildCommentWithMetadata(comment, jiraId = null, customFields = {}) {
    const metadata = {};

    if (jiraId) {
      metadata.jiraId = jiraId;
    }

    if (customFields && Object.keys(customFields).length > 0) {
      metadata.customFields = customFields;
    }

    // If no metadata, return plain comment
    if (Object.keys(metadata).length === 0) {
      return comment || '';
    }

    // Embed metadata as JSON
    const metadataJson = JSON.stringify(metadata);
    return comment
      ? `${comment}\n\n[METADATA]${metadataJson}[/METADATA]`
      : `[METADATA]${metadataJson}[/METADATA]`;
  }

  /**
   * Link Jira ID to alerts by adding metadata to comments
   * For Active alerts: sets to Dismissed (Unknown)
   * For non-Active alerts: temporarily sets to Active (clears comment), then restores with metadata
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {Array<number>} alertIds - Array of alert IDs
   * @param {string} jiraId - Jira issue ID (e.g., 'SEC-123')
   * @param {Function} onProgress - Progress callback (current, total)
   * @returns {Promise<Array>} Array of update results
   */
  async linkJiraToAlerts(
    projectIdOrName,
    repositoryId,
    alertIds,
    jiraId,
    onProgress = null
  ) {
    const results = [];
    const total = alertIds.length;

    logger.info('Linking Jira ID to alerts', {
      project: projectIdOrName,
      repository: repositoryId,
      alertIds,
      jiraId,
    });

    for (const alertId of alertIds) {
      try {
        // Get current alert to check state and preserve existing comment
        const alert = await this.getAlert(
          projectIdOrName,
          repositoryId,
          alertId
        );

        // Parse existing metadata to preserve custom fields
        const existingMetadata = this.parseAlertMetadata(alert);

        // Extract user comment (remove metadata tags if present)
        let userComment = alert.dismissal?.message || '';
        const metadataMatch = userComment.match(/\[METADATA\].*?\[\/METADATA\]/s);
        if (metadataMatch) {
          userComment = userComment.replace(metadataMatch[0], '').trim();
        }

        // Build new comment with Jira ID
        const newComment = this.buildCommentWithMetadata(
          userComment,
          jiraId,
          existingMetadata.customFields
        );

        const originalState = alert.state;
        const originalDismissalType = alert.dismissal?.dismissalType;

        // If alert is Active, set to Dismissed (Unknown)
        if (originalState === 1) {
          await this.updateAlert(projectIdOrName, repositoryId, alertId, {
            state: 2, // Dismissed
            dismissedReason: 0, // Unknown
            dismissedComment: newComment,
          });
        } else {
          // For non-Active alerts: temporarily set to Active to clear comment, then restore
          // Step 1: Set to Active (clears comment)
          await this.updateAlert(projectIdOrName, repositoryId, alertId, {
            state: 1, // Active
          });

          // Wait for change to propagate
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Step 2: Restore original state with new comment
          await this.updateAlert(projectIdOrName, repositoryId, alertId, {
            state: originalState,
            dismissedReason: originalDismissalType || 0,
            dismissedComment: newComment,
          });
        }

        results.push({ alertId, success: true });
      } catch (error) {
        logger.error('Failed to link Jira to alert', {
          alertId,
          error: error.message,
        });
        results.push({ alertId, success: false, error: error.message });
      }

      // Report progress
      if (onProgress) {
        onProgress(results.length, total);
      }
    }

    logger.info('Jira linking completed', {
      total,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });

    return results;
  }

  /**
   * Unlink Jira ID from alerts by removing metadata
   * For Active alerts: no action needed (no comment/metadata when Active)
   * For non-Active alerts: temporarily sets to Active (clears comment), then restores without metadata
   * @param {string} projectIdOrName - Project ID or name
   * @param {string} repositoryId - Repository ID
   * @param {Array<number>} alertIds - Array of alert IDs
   * @param {Function} onProgress - Progress callback (current, total)
   * @returns {Promise<Array>} Array of update results
   */
  async unlinkJiraFromAlerts(
    projectIdOrName,
    repositoryId,
    alertIds,
    onProgress = null
  ) {
    const results = [];
    const total = alertIds.length;

    logger.info('Unlinking Jira ID from alerts', {
      project: projectIdOrName,
      repository: repositoryId,
      alertIds,
    });

    for (const alertId of alertIds) {
      try {
        // Get current alert to save original state
        const alert = await this.getAlert(
          projectIdOrName,
          repositoryId,
          alertId
        );

        const originalState = alert.state;
        const originalDismissalType = alert.dismissal?.dismissalType;

        // If Active, no action needed (no comment/metadata when Active)
        if (originalState === 1) {
          results.push({ alertId, success: true, skipped: true });
          if (onProgress) {
            onProgress(results.length, total);
          }
          continue;
        }

        // For non-Active alerts: clear metadata by setting to Active then restoring
        // Step 1: Set to Active (this clears the comment)
        await this.updateAlert(projectIdOrName, repositoryId, alertId, {
          state: 1, // Active
        });

        // Wait for change to propagate
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Step 2: Restore original state (without the Jira metadata)
        if (originalState === 2 || originalState === 8) {
          // Was Dismissed, restore without comment
          await this.updateAlert(projectIdOrName, repositoryId, alertId, {
            state: originalState,
            dismissedReason: originalDismissalType || 0, // Unknown if not set
          });
        } else if (originalState === 4) {
          // Was Fixed, restore
          await this.updateAlert(projectIdOrName, repositoryId, alertId, {
            state: 4,
            dismissedReason: 1, // Fixed
          });
        }

        results.push({ alertId, success: true });
      } catch (error) {
        logger.error('Failed to unlink Jira from alert', {
          alertId,
          error: error.message,
        });
        results.push({ alertId, success: false, error: error.message });
      }

      // Report progress
      if (onProgress) {
        onProgress(results.length, total);
      }
    }

    logger.info('Jira unlinking completed', {
      total,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      skipped: results.filter((r) => r.skipped).length,
    });

    return results;
  }
}

export { State, DismissalType, getStateValue, getDismissalTypeValue };
export default AzdoService;
