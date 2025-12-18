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

  async getIssueArticle(issue) {
    await this.authenticate();
    return await this.service.getIssueArticle(issue);
  }

  /**
   * Get focused article URL for an issue based on ApiVulnName
   *
   * This function:
   * 1. Fetches the general article HTML
   * 2. Parses it to find the specific link matching ApiVulnName
   * 3. Returns the focused article URL, or falls back to the general URL
   *
   * @param {Object} issue - The issue object containing IssueTypeId, Language, and ApiVulnName
   * @returns {Promise<string>} The focused article URL or general article URL
   */
  async getFocusedArticleUrl(issue) {
    const baseUrl = this.config.getBaseUrl();

    // Build general article URL
    const articleParams = new URLSearchParams({
      issuetype: issue.IssueTypeId,
    });

    if (issue.Language) {
      articleParams.append('language', issue.Language);
    }

    const generalArticleUrl = `${baseUrl}/api/v4/Reports/Article/?${articleParams.toString()}`;

    // If no ApiVulnName, return general URL
    if (!issue.ApiVulnName) {
      return generalArticleUrl;
    }

    try {
      await this.authenticate();

      // Fetch the general article HTML
      logger.info('Fetching article to find focused URL', {
        issueTypeId: issue.IssueTypeId,
        language: issue.Language,
        apiVulnName: issue.ApiVulnName,
      });

      const response = await this.service.api.v4.Reports_GetArticle({
        issuetype: issue.IssueTypeId,
        language: issue.Language,
      });

      if (!response || typeof response !== 'string') {
        logger.warn('Article response is not HTML string, using general URL');
        return generalArticleUrl;
      }

      // Parse HTML to find the link matching ApiVulnName
      // Look for <div id="apiLinks"> and find the <a> tag with text matching ApiVulnName
      const apiLinksMatch = response.match(
        /<div[^>]*id="apiLinks"[^>]*>([\s\S]*?)<\/div>/i
      );

      if (!apiLinksMatch) {
        logger.warn(
          'Could not find apiLinks div in article HTML, using general URL'
        );
        return generalArticleUrl;
      }

      const apiLinksContent = apiLinksMatch[1];

      // Find all <a> tags with href attributes
      const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;

      while ((match = linkRegex.exec(apiLinksContent)) !== null) {
        const href = match[1];
        const linkText = match[2].replace(/<[^>]*>/g, '').trim(); // Strip any HTML tags and trim

        // Check if link text matches ApiVulnName exactly
        if (linkText === issue.ApiVulnName) {
          // Found the matching link - construct full URL
          // href is relative like "?issuetype=...&api=..." but contains HTML entities
          // Decode HTML entities using a temporary DOM element approach
          const decodeHtmlEntities = (text) => {
            const entities = {
              '&amp;': '&',
              '&lt;': '<',
              '&gt;': '>',
              '&quot;': '"',
              '&#39;': "'",
              '&apos;': "'",
            };
            return text.replace(
              /&[#\w]+;/g,
              (entity) => entities[entity] || entity
            );
          };

          const decodedHref = decodeHtmlEntities(href);
          const focusedUrl = `${baseUrl}/api/v4/Reports/Article/${decodedHref}`;

          logger.info('Found focused article URL', {
            apiVulnName: issue.ApiVulnName,
            focusedUrl,
          });

          return focusedUrl;
        }
      }

      logger.warn(
        'Could not find matching link for ApiVulnName in article, using general URL',
        {
          apiVulnName: issue.ApiVulnName,
        }
      );

      return generalArticleUrl;
    } catch (error) {
      logger.error(
        'Error fetching focused article URL, falling back to general URL',
        {
          error: error.message,
          issueId: issue.Id,
        }
      );
      return generalArticleUrl;
    }
  }

  async getIssueComments(issueId) {
    await this.authenticate();
    const response = await this.service.api.v4.Issues_GetIssueComments(
      issueId,
      {}
    );
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

      logger.info('Issues updated successfully', {
        issueCount: issueIds.length,
      });
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

  async updateIssueStatus(issueId, status, comment) {
    await this.authenticate();

    try {
      // Get the application ID from the issue
      const issue = await this.service.api.v4.Issues_GetIssue(issueId, {});
      const appId = issue.ApplicationId;

      logger.info('Updating issue status', { issueId, status, comment });

      const updateData = {
        Status: status,
        Comment: comment || '',
      };

      const result = await this.updateIssue(issueId, appId, updateData);

      logger.info('Issue status updated successfully', { issueId, status });
      return result;
    } catch (error) {
      logger.error('Failed to update issue status', error, {
        issueId,
        status,
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
  async bulkUpdateIssuesChunked(
    issueIds,
    appId,
    updateData,
    chunkSize = 20,
    onProgress = null
  ) {
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
