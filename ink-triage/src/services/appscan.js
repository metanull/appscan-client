/**
 * AppScan Service Wrapper
 * This wraps the parent package's AppScanService to provide a clean interface
 * for the Ink UI.
 */

// Import from parent package
import { AppScanService as ParentAppScanService } from '../../../src/services/appscan-service.js';
import { Config } from '../../../src/utils/config.js';

export class AppScanService {
  constructor(configPath = null) {
    this.config = configPath ? Config.loadFromFile(configPath) : new Config();
    this.service = new ParentAppScanService(this.config);
    this.authenticated = false;
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
    // Note: PUT endpoint uses 'odataFilter' parameter (not '$filter' like GET)
    return await this.service.api.v4.Issues_UpdateFilteredIssues(
      'Application',
      appId,
      updateData,
      { odataFilter: `Id eq ${issueId}` }
    );
  }

  async bulkUpdateIssues(issueIds, appId, updateData) {
    await this.authenticate();
    const odataFilter = issueIds.map(id => `Id eq ${id}`).join(' or ');
    // Note: PUT endpoint uses 'odataFilter' parameter (not '$filter' like GET)
    return await this.service.api.v4.Issues_UpdateFilteredIssues(
      'Application',
      appId,
      updateData,
      { odataFilter: odataFilter }
    );
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
