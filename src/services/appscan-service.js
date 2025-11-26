import { Api } from '../generated/Api.js';
import { Config } from '../utils/config.js';

export class AppScanService {
  constructor(config) {
    this.config = config || new Config();
    this.api = null;
    this.token = null;
  }

  async authenticate() {
    if (!this.config.isValid()) {
      throw new Error(
        'API credentials not configured. Please set APPSCAN_API_KEY and APPSCAN_API_SECRET environment variables.'
      );
    }

    try {
      this.api = new Api({
        baseURL: this.config.getBaseUrl(),
      });

      const response = await this.api.api.accountApiKeyLogin({
        KeyId: this.config.getApiKey(),
        KeySecret: this.config.getApiSecret(),
      });

      if (!response || !response.Token) {
        throw new Error('Authentication response did not contain a valid token');
      }

      this.token = response.Token;

      // Update API instance with authorization token
      this.api = new Api({
        baseURL: this.config.getBaseUrl(),
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return this.token;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async listApplications() {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.api.appsAppsList();
      return response;
    } catch (error) {
      throw new Error(`Failed to list applications: ${error.message}`);
    }
  }

  async listScans(appId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.api.scansList({ AppId: appId });
      return response;
    } catch (error) {
      throw new Error(`Failed to list scans: ${error.message}`);
    }
  }

  async listScanExecutions(scanId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.api.scansExecutionsList(scanId);
      return response;
    } catch (error) {
      throw new Error(`Failed to list scan executions: ${error.message}`);
    }
  }

  async listIssues(scanId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.api.issuesList({ ScanId: scanId });
      return response;
    } catch (error) {
      throw new Error(`Failed to list issues: ${error.message}`);
    }
  }

  async getApplicationDetails(appId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.api.appsDetail(appId);
      return response;
    } catch (error) {
      throw new Error(`Failed to get application details: ${error.message}`);
    }
  }

  async getScanDetails(scanId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.api.scansDetail(scanId);
      return response;
    } catch (error) {
      throw new Error(`Failed to get scan details: ${error.message}`);
    }
  }

  async ensureAuthenticated() {
    if (!this.token) {
      await this.authenticate();
    }
  }
}

export default AppScanService;
