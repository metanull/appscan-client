import { Api, HttpClient } from '../generated/Api.js';
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
      const httpClient = new HttpClient({
        baseURL: this.config.getBaseUrl(),
      });
      this.api = new Api(httpClient);

      const response = await this.api.v4.Account_ApiKeyLogin({
        KeyId: this.config.getApiKey(),
        KeySecret: this.config.getApiSecret(),
      });

      if (!response || !response.Token) {
        throw new Error(
          'Authentication response did not contain a valid token'
        );
      }

      this.token = response.Token;

      // Update API instance with authorization token
      const authenticatedHttpClient = new HttpClient({
        baseURL: this.config.getBaseUrl(),
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      this.api = new Api(authenticatedHttpClient);

      return this.token;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async listApplications() {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Apps_Get({});
      return response;
    } catch (error) {
      throw new Error(`Failed to list applications: ${error.message}`);
    }
  }

  async listScans(appId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Scans_Get({ AppId: appId });
      return response;
    } catch (error) {
      throw new Error(`Failed to list scans: ${error.message}`);
    }
  }

  async listScanExecutions(scanId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Scans_GetExecutions(scanId, {});
      return response;
    } catch (error) {
      throw new Error(`Failed to list scan executions: ${error.message}`);
    }
  }

  async listIssues(scanId, excludeStatus = 'Noise') {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Issues_Get('Scan', scanId, {});

      // Filter issues by status if excludeStatus is provided
      if (excludeStatus && response.Items) {
        const statusesToExclude = excludeStatus
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        if (statusesToExclude.length > 0) {
          response.Items = response.Items.filter(
            (issue) => !statusesToExclude.includes(issue.Status)
          );
          // Update count if present
          if (response.Count !== undefined) {
            response.Count = response.Items.length;
          }
        }
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to list issues: ${error.message}`);
    }
  }

  async getApplicationDetails(appId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Apps_Get({ Id: appId });
      return response;
    } catch (error) {
      throw new Error(`Failed to get application details: ${error.message}`);
    }
  }

  async getScanDetails(scanId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.v4.Scans_Get({ ScanId: scanId });
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
