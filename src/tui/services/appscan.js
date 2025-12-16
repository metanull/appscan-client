/**
 * AppScan Service Wrapper
 * This wraps the parent package's AppScanService to provide a clean interface
 * for the Ink UI and adds audit logging for all write operations.
 */

// Import from parent package
import { AppScanService as ParentAppScanService } from '../../../src/services/appscan-service.js';
import { auditService } from '../utils/audit.js';
import logger from '../utils/logger.js';
import { Config } from '../../../src/utils/config.js';

export class AppScanService {
  constructor(configPath = null) {
    this.config = configPath ? Config.loadFromFile(configPath) : new Config();
    this.service = new ParentAppScanService(this.config);
    this.authenticated = false;
    // Emit helpful diagnostic info when running the TUI
    logger.info('TUI AppScanService initialized', {
      configValid: this.config.isValid(),
      baseUrl: this.config.getBaseUrl(),
      hasJira: this.config.isJiraValid(),
    });
  }

  async authenticate() {
    if (!this.authenticated) {
      await this.service.authenticate();
      this.authenticated = true;
    }
  }

  async listApplications() {
    await this.authenticate();
    const response = await this.service.listApplications();
    return response.Items || response || [];
  }

  async listScans(appId) {
    await this.authenticate();
    const response = await this.service.listScans(appId);
    return response.Items || response || [];
  }

  async listIssues(scanId) {
    await this.authenticate();
    const response = await this.service.api.v4.Issues_Get('Scan', scanId, {});
    return response.Items || [];
  }

  async getIssueDetails(issueId) {
    await this.authenticate();
    return await this.service.getIssueDetails(issueId);
  }

  async getArticle(issueId) {
    await this.authenticate();
    return await this.service.getArticle(issueId);
  }

  async getIssueComments(issueId) {
    await this.authenticate();
    const response = await this.service.api.v4.Issues_GetIssueComments(issueId, {});
    return response.Items || [];
  }

  async updateIssue(issueId, appId, updateData) {
    await this.authenticate();

    try {
      logger.info('Updating AppScan issue', { issueId, appId, updateData });

      // Note: PUT endpoint uses 'odataFilter' parameter (not '$filter' like GET)
      const result = await this.service.api.v4.Issues_UpdateFilteredIssues(
        'Application',
        appId,
        updateData,
        { odataFilter: `Id eq ${issueId}` }
      );

      // Audit the update
      auditService.logAppScanUpdate([issueId], appId, updateData, {
        success: true,
        result,
      });

      logger.info('Issue updated successfully', { issueId });
      return result;
    } catch (error) {
      logger.error('Failed to update issue', error, { issueId, appId });

      auditService.logAppScanUpdate([issueId], appId, updateData, {
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  async bulkUpdateIssues(issueIds, appId, updateData) {
    await this.authenticate();

    try {
      logger.info('Bulk updating AppScan issues', {
        issueCount: issueIds.length,
        appId,
        updateData,
      });

      const odataFilter = issueIds.map((id) => `Id eq ${id}`).join(' or ');
      // Note: PUT endpoint uses 'odataFilter' parameter (not '$filter' like GET)
      const result = await this.service.api.v4.Issues_UpdateFilteredIssues(
        'Application',
        appId,
        updateData,
        { odataFilter: odataFilter }
      );

      // Audit the bulk update
      auditService.logAppScanUpdate(issueIds, appId, updateData, {
        success: true,
        result,
      });

      logger.info('Issues updated successfully', { issueCount: issueIds.length });
      return result;
    } catch (error) {
      logger.error('Failed to bulk update issues', error, {
        issueCount: issueIds.length,
        appId,
      });

      auditService.logAppScanUpdate(issueIds, appId, updateData, {
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Bulk update issues in chunks to avoid HTTP 414 errors
   * @param {Array} issueIds - Array of issue IDs to update
   * @param {string} appId - Application ID
   * @param {object} updateData - Update data
   * @param {number} chunkSize - Number of issues per batch (default: 20)
   * @param {Function} onProgress - Progress callback (current, total)
   * @returns {object} Summary of results
   */
  async bulkUpdateIssuesChunked(issueIds, appId, updateData, chunkSize = 20, onProgress = null) {
    await this.authenticate();

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
        logger.error(`Failed to update chunk ${i + 1}/${chunks.length}`, error);
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
    await this.authenticate();
    return await this.service.api.v4.Issues_UpdateFilteredIssues(
      'Scan',
      scanId,
      updateData,
      {} // No filter = update all issues in scan
    );
  }

  async updateAllIssuesInApplication(appId, updateData) {
    await this.authenticate();
    return await this.service.api.v4.Issues_UpdateFilteredIssues(
      'Application',
      appId,
      updateData,
      {} // No filter = update all issues in application
    );
  }

  getConfig() {
    return this.config;
  }

  getBaseUrl() {
    return this.config.getBaseUrl();
  }
}

export default AppScanService;
