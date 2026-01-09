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

  async listApplications() {
    const response = await this.service.listApplications();
    return response.Items;
  }

  async listScans(appId) {
    const response = await this.service.listScans(appId);
    return response.Items;
  }

  async listIssues(scopeId, filterOptions = null, scope = 'Scan') {
    const response = await this.service.listIssues(
      scopeId,
      filterOptions,
      null,
      scope
    );
    return response.Items;
  }

  async getIssueDetails(issueId) {
    return this.service.getIssueDetails(issueId);
  }

  async getArticle(issueId) {
    return this.service.getArticle(issueId);
  }

  async getIssueArticle(issue) {
    return this.service.getIssueArticle(issue);
  }

  async getApplicationDetails(appId) {
    return this.service.getApplicationDetails(appId);
  }

  async getFocusedArticleUrl(issue) {
    return this.service.getFocusedArticleUrl(issue);
  }

  async getIssueComments(issueId) {
    const response = await this.service.api.v4.Issues_GetIssueComments(
      issueId,
      {}
    );
    return response.Items;
  }

  // ==========================================
  // Write Methods with Audit Logging
  // ==========================================

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

  async updateIssueStatus(issueId, status, comment) {
    const issue = await this.service.api.v4.Issues_GetIssue(issueId, {});
    const updateData = {
      Status: status,
      Comment: comment || '',
    };
    return this.updateIssue(issueId, issue.ApplicationId, updateData);
  }

  async bulkUpdateIssuesChunked(
    issueIds,
    appId,
    updateData,
    chunkSize = 20,
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

  async updateAllIssuesInScan(scanId, updateData) {
    return this.service.updateAllIssuesInScan(
      scanId,
      updateData.Status,
      updateData.Comment,
      updateData.ExternalId
    );
  }

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

  getIssueUrl(appId, issueId) {
    return AppScanUrls.getIssueUrl(this.config.getBaseUrl(), appId, issueId);
  }

  getApplicationUrl(appId) {
    return AppScanUrls.getApplicationUrl(this.config.getBaseUrl(), appId);
  }

  getScanUrl(appId, scanId) {
    return AppScanUrls.getScanUrl(this.config.getBaseUrl(), appId, scanId);
  }

  getJiraUrl(issue) {
    if (!issue || !issue.ExternalId) {
      return null;
    }
    return AppScanUrls.getJiraUrl(this.config.jiraHost, issue.ExternalId);
  }

  // ==========================================
  // Config Access
  // ==========================================

  getConfig() {
    return this.config;
  }

  getBaseUrl() {
    return this.config.getBaseUrl();
  }
}

export default AppScanService;
