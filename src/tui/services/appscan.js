/**
 * AppScan Service Wrapper for TUI
 * Provides UI-specific helpers and audit logging for write operations
 */

// Import from parent package
import { AppScanService as ParentAppScanService } from '../../../src/services/appscan-service.js';
import * as AppScanUrls from '../../../src/utils/appscan-urls.js';
import { auditService } from '../utils/audit.js';
import logger from '../../utils/logger.js';
import { Config } from '../../../src/utils/config.js';

export class AppScanService {
  /**
   * @param {string|null} configPath - Optional path to config file
   */
  constructor(configPath = null) {
    this.config = configPath ? Config.loadFromFile(configPath) : new Config();
    this.service = new ParentAppScanService(this.config);

    logger.info('TUI AppScanService initialized', {
      configValid: this.config.isValid(),
      baseUrl: this.config.getBaseUrl(),
      hasJira: this.config.isJiraValid(),
    });
  }

  // ==========================================
  // Delegated Read Methods (no modification)
  // ==========================================

  /**
   * Retrieves all applications from AppScan API
   * @returns {Promise<Array>} Array of application objects
   */
  async listApplications() {
    const response = await this.service.listApplications();
    return response.Items;
  }

  /**
   * Retrieves all scans for a specific application from AppScan API
   * @param {string} appId - Application ID
   * @returns {Promise<Array>} Array of scan objects
   */
  async listScans(appId) {
    const response = await this.service.listScans(appId);
    return response.Items;
  }

  /**
   * Retrieves issues for a specific scope (scan or application) from AppScan API
   * @param {string} scopeId - Scan or Application ID
   * @param {Object|null} filterOptions - Optional filter criteria
   * @param {string} scope - Scope type ('Scan' or 'Application')
   * @returns {Promise<Array>} Array of issue objects
   */
  async listIssues(scopeId, filterOptions = null, scope = 'Scan') {
    const response = await this.service.listIssues(
      scopeId,
      filterOptions,
      null,
      scope
    );
    return response.Items;
  }

  /**
   * Retrieves detailed information for a specific issue from AppScan API
   * @param {string} issueId - Issue ID
   * @returns {Promise<Object>} Issue details object
   */
  async getIssueDetails(issueId) {
    return this.service.getIssueDetails(issueId);
  }

  /**
   * Retrieves the security advisory article for an issue from AppScan API
   * @param {string} issueId - Issue ID
   * @returns {Promise<string>} Article content in markdown format
   */
  async getArticle(issueId) {
    return this.service.getArticle(issueId);
  }

  /**
   * Retrieves the security advisory article for an issue object from AppScan API
   * @param {Object} issue - Issue object
   * @returns {Promise<string>} Article content in markdown format
   */
  async getIssueArticle(issue) {
    return this.service.getIssueArticle(issue);
  }

  /**
   * Retrieves detailed information for a specific application from AppScan API
   * @param {string} appId - Application ID
   * @returns {Promise<Object>} Application details object
   */
  async getApplicationDetails(appId) {
    return this.service.getApplicationDetails(appId);
  }

  /**
   * Generates a URL to the focused article view for an issue in AppScan
   * @param {Object} issue - Issue object
   * @returns {Promise<string>} URL to the focused article
   */
  async getFocusedArticleUrl(issue) {
    return this.service.getFocusedArticleUrl(issue);
  }

  /**
   * Retrieves all comments for a specific issue from AppScan API
   * @param {string} issueId - Issue ID
   * @returns {Promise<Array>} Array of comment objects
   */
  async getIssueComments(issueId) {
    const response = await this.service.api.v4.Issues_GetIssueComments(
      issueId,
      {}
    );
    return response.Items;
  }

  /**
   * Get FixGroups for a scope using the parent service API safely
   * @param {string} scope - 'Application' | 'Scan' | 'ScanExecution'
   * @param {string} scopeId - Scope ID
   * @param {Object} query - Optional query parameters
   * @returns {Promise<Array>} Array of FixGroup objects
   */
  async getFixGroups(scope, scopeId, query = {}) {
    // Ensure parent service is authenticated before calling the raw API
    await this.service.ensureAuthenticated();

    try {
      const response = await this.service.api.v4.FixGroups_Get(
        scope,
        scopeId,
        query
      );
      return response.Items || [];
    } catch (err) {
      logger.error('TUI wrapper failed to load FixGroups', {
        error: err.message,
      });
      throw err;
    }
  }

  // ==========================================
  // Write Methods with Audit Logging
  // ==========================================

  /**
   * Updates application metadata in AppScan API with audit logging
   * @param {string} appId - Application ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Update result from API
   */
  async updateApplication(appId, updateData) {
    try {
      logger.info('Updating application', {
        appId,
        fields: Object.keys(updateData),
      });
      const result = await this.service.api.v4.Apps_Update(appId, updateData);

      auditService.logAppUpdate(appId, updateData, {
        success: true,
        result,
      });

      return result;
    } catch (error) {
      auditService.logAppUpdate(appId, updateData, {
        success: false,
        error: error.message,
      });

      logger.error('Failed to update application', {
        appId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Updates a single issue in AppScan API with audit logging
   * @param {string} issueId - Issue ID
   * @param {string} appId - Application ID
   * @param {Object} updateData - Fields to update (Status, Comment, ExternalId, etc.)
   * @returns {Promise<Object>} Update result from API
   */
  async updateIssue(issueId, appId, updateData) {
    try {
      logger.info('Updating issue', {
        issueId,
        appId,
        fields: Object.keys(updateData),
      });

      const result = await this.service.api.v4.Issues_UpdateFilteredIssues(
        'Application',
        appId,
        updateData,
        { odataFilter: `Id eq ${issueId}` }
      );

      auditService.logAppScanUpdate([issueId], appId, updateData, {
        success: true,
        result,
      });

      return result;
    } catch (error) {
      auditService.logAppScanUpdate([issueId], appId, updateData, {
        success: false,
        error: error.message,
      });

      logger.error('Failed to update issue', { issueId, error: error.message });
      throw error;
    }
  }

  /**
   * Updates multiple issues in a single AppScan API call with audit logging
   * @param {Array<string>} issueIds - Array of issue IDs
   * @param {string} appId - Application ID
   * @param {Object} updateData - Fields to update (Status, Comment, ExternalId, etc.)
   * @returns {Promise<Object>} Update result from API
   */
  async bulkUpdateIssues(issueIds, appId, updateData) {
    try {
      logger.info('Bulk updating issues', { count: issueIds.length, appId });

      const odataFilter = issueIds.map((id) => `Id eq ${id}`).join(' or ');
      const result = await this.service.api.v4.Issues_UpdateFilteredIssues(
        'Application',
        appId,
        updateData,
        { odataFilter }
      );

      auditService.logAppScanUpdate(issueIds, appId, updateData, {
        success: true,
        result,
      });

      return result;
    } catch (error) {
      auditService.logAppScanUpdate(issueIds, appId, updateData, {
        success: false,
        error: error.message,
      });

      logger.error('Failed to bulk update issues', {
        count: issueIds.length,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Updates the status of a single issue in AppScan API
   * @param {string} issueId - Issue ID
   * @param {string} status - New status value
   * @param {string} comment - Optional comment explaining the status change
   * @returns {Promise<Object>} Update result from API
   */
  async updateIssueStatus(issueId, status, comment) {
    const issue = await this.service.api.v4.Issues_GetIssue(issueId, {});
    const updateData = {
      Status: status,
      Comment: comment || '',
    };
    return this.updateIssue(issueId, issue.ApplicationId, updateData);
  }

  /**
   * Updates multiple issues in chunks to provide progress feedback and handle large batches
   * @param {Array<string>} issueIds - Array of issue IDs
   * @param {string} appId - Application ID
   * @param {Object} updateData - Fields to update
   * @param {number} chunkSize - Number of issues per batch (default: 20)
   * @param {Function|null} onProgress - Callback function for progress updates (processed, total)
   * @returns {Promise<Object>} Results summary with counts and errors
   */
  async bulkUpdateIssuesChunked(
    issueIds,
    appId,
    updateData,
    chunkSize = 20, // Optimal batch size to balance API performance and progress feedback
    onProgress = null
  ) {
    logger.info('Starting chunked bulk update', {
      totalIssues: issueIds.length,
      chunkSize,
      appId,
    });

    const chunks = [];
    for (let i = 0; i < issueIds.length; i += chunkSize) {
      chunks.push(issueIds.slice(i, i + chunkSize));
    }

    const results = {
      total: issueIds.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      try {
        await this.bulkUpdateIssues(chunk, appId, updateData);
        results.successful += chunk.length;
      } catch (error) {
        results.failed += chunk.length;
        results.errors.push({
          chunk: i + 1,
          issueIds: chunk,
          error: error.message,
        });
      }

      results.processed += chunk.length;

      if (onProgress) {
        onProgress(results.processed, results.total);
      }
    }

    logger.info('Chunked bulk update completed', results);
    return results;
  }

  /**
   * Updates all issues within a scan scope using AppScan API
   * @param {string} scanId - Scan ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Update result from API
   */
  async updateAllIssuesInScan(scanId, updateData) {
    return this.service.updateAllIssuesInScan(
      scanId,
      updateData.Status,
      updateData.Comment,
      updateData.ExternalId
    );
  }

  /**
   * Updates all issues within an application scope using AppScan API
   * @param {string} appId - Application ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Update result from API
   */
  async updateAllIssuesInApplication(appId, updateData) {
    return this.service.updateAllIssuesInApplication(
      appId,
      updateData.Status,
      updateData.Comment,
      updateData.ExternalId
    );
  }

  // ==========================================
  // UI Helper Methods
  // ==========================================

  /**
   * Get issue counts for an application
   * @param {Object} app - Application object
   * @returns {{ inProgress: number, active: number, total: number }} Issue counts
   */
  getAppIssueCounts(app) {
    if (!app) {
      return { inProgress: 0, active: 0, total: 0 };
    }

    const inProgress = Number(app.IssuesInProgress) || 0;
    const active = Number(app.OpenIssues) || 0;
    const total = Number(app.TotalIssues) || 0;

    return { inProgress, active, total };
  }

  /**
   * Get severity breakdown for a scan
   * @param {Object} scan - Scan object
   * @returns {{ critical: number, high: number, medium: number, low: number, info: number, total: number }} Severity counts
   */
  getScanIssueCounts(scan) {
    if (!scan) {
      return { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 };
    }

    const execution = scan.LatestExecution || {};
    const critical = Number(execution.NCriticalIssues) || 0;
    const high = Number(execution.NHighIssues) || 0;
    const medium = Number(execution.NMediumIssues) || 0;
    const low = Number(execution.NLowIssues) || 0;
    const info = Number(execution.NInfoIssues) || 0;
    const total =
      Number(execution.NIssuesFound) || critical + high + medium + low + info;

    return { critical, high, medium, low, info, total };
  }

  /**
   * Get the number of scans for an application
   * @param {Object} app - Application object
   * @returns {number} Number of scans
   */
  getAppScanCount(app) {
    if (!app) {
      return 0;
    }

    return (
      Number(app.ScanCount) ||
      Number(app.NumberOfScans) ||
      Number(app.TotalScans) ||
      0
    );
  }

  // ==========================================
  // URL Helper Methods
  // ==========================================

  /**
   * Generates URL to view an issue in AppScan web interface
   * @param {string} appId - Application ID
   * @param {string} issueId - Issue ID
   * @returns {string} URL to the issue
   */
  getIssueUrl(appId, issueId) {
    return AppScanUrls.getIssueUrl(this.config.getBaseUrl(), appId, issueId);
  }

  /**
   * Generates URL to view an application in AppScan web interface
   * @param {string} appId - Application ID
   * @returns {string} URL to the application
   */
  getApplicationUrl(appId) {
    return AppScanUrls.getApplicationUrl(this.config.getBaseUrl(), appId);
  }

  /**
   * Generates URL to view a scan in AppScan web interface
   * @param {string} appId - Application ID
   * @param {string} scanId - Scan ID
   * @returns {string} URL to the scan
   */
  getScanUrl(appId, scanId) {
    return AppScanUrls.getScanUrl(this.config.getBaseUrl(), appId, scanId);
  }

  /**
   * Generates URL to view a Jira issue from an AppScan issue
   * @param {Object} issue - AppScan issue object with ExternalId field
   * @returns {string|null} URL to the Jira issue, or null if no ExternalId
   */
  getJiraUrl(issue) {
    if (!issue || !issue.ExternalId) {
      return null;
    }
    return AppScanUrls.getJiraUrl(this.config.jiraHost, issue.ExternalId);
  }

  // ==========================================
  // Config Access
  // ==========================================

  /**
   * Gets the configuration object
   * @returns {Config} Configuration instance
   */
  getConfig() {
    return this.config;
  }

  /**
   * Gets the base URL for AppScan API
   * @returns {string} Base URL
   */
  getBaseUrl() {
    return this.config.getBaseUrl();
  }
}

export default AppScanService;
