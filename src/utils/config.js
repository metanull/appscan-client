import dotenv from 'dotenv';
import fs from 'fs';
import { getEnvPath } from './config-paths.js';

// NOTE: dotenv is intentionally not executed at module import time to avoid
// loading environment variables before the application has a chance to
// determine the correct .env path (e.g., TUI may call dotenv with a specific
// path before constructing Config). Load dotenv in the constructor instead.

export class Config {
  constructor() {
    // Ensure environment variables are loaded when a Config instance is created
    try {
      process.env.DOTENV_CONFIG_QUIET = 'true';
      // Load from the correct path (user's home directory for installed packages)
      dotenv.config({ path: getEnvPath() });
    } catch {
      // ignore dotenv failures
    }
    this.apiKey = process.env.APPSCAN_API_KEY || null;
    this.apiSecret = process.env.APPSCAN_API_SECRET || null;
    this.baseUrl = process.env.APPSCAN_BASE_URL || 'https://cloud.appscan.com';
    this.jiraHost = process.env.JIRA_HOST || null;
    this.jiraEmail = process.env.JIRA_EMAIL || null;
    this.jiraApiToken = process.env.JIRA_API_TOKEN || null;
    this.jiraProjectKey = process.env.JIRA_PROJECT_KEY || null;
    this.azureDevOpsOrg = process.env.AZURE_DEVOPS_ORG || null;
    this.azureDevOpsBaseUrl =
      process.env.AZURE_DEVOPS_BASE_URL || 'https://dev.azure.com';
    this.confluenceHost = process.env.CONFLUENCE_HOST || null;
    this.bulkUpdateChunkSize = parseInt(
      process.env.BULK_UPDATE_CHUNK_SIZE || '10',
      10
    );
  }

  isValid() {
    return !!(this.apiKey && this.apiSecret);
  }

  isJiraValid() {
    return !!(this.jiraHost && this.jiraEmail && this.jiraApiToken);
  }

  isAzdoValid() {
    const pat =
      process.env.AZDO_PAT ||
      process.env.AZDO_PERSONAL_ACCESS_TOKEN ||
      process.env.AZURE_DEVOPS_PAT;
    return !!(this.azureDevOpsOrg && pat);
  }

  getApiKey() {
    return this.apiKey;
  }

  getApiSecret() {
    return this.apiSecret;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  getJiraHost() {
    return this.jiraHost;
  }

  getJiraEmail() {
    return this.jiraEmail;
  }

  getJiraApiToken() {
    return this.jiraApiToken;
  }

  getJiraProjectKey() {
    return this.jiraProjectKey;
  }

  getAzureDevOpsOrg() {
    return this.azureDevOpsOrg;
  }

  getAzureDevOpsBaseUrl() {
    return this.azureDevOpsBaseUrl;
  }

  getConfluenceHost() {
    return this.confluenceHost;
  }

  getBulkUpdateChunkSize() {
    return this.bulkUpdateChunkSize;
  }

  static loadFromFile(filePath) {
    if (fs.existsSync(filePath)) {
      try {
        const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const instance = new Config();
        instance.apiKey = config.apiKey || instance.apiKey;
        instance.apiSecret = config.apiSecret || instance.apiSecret;
        instance.baseUrl = config.baseUrl || instance.baseUrl;
        instance.jiraHost = config.jiraHost || instance.jiraHost;
        instance.jiraEmail = config.jiraEmail || instance.jiraEmail;
        instance.jiraApiToken = config.jiraApiToken || instance.jiraApiToken;
        instance.jiraProjectKey =
          config.jiraProjectKey || instance.jiraProjectKey;
        instance.azureDevOpsOrg =
          config.azureDevOpsOrg || instance.azureDevOpsOrg;
        instance.azureDevOpsBaseUrl =
          config.azureDevOpsBaseUrl || instance.azureDevOpsBaseUrl;
        instance.confluenceHost =
          config.confluenceHost || instance.confluenceHost;
        instance.bulkUpdateChunkSize =
          config.bulkUpdateChunkSize || instance.bulkUpdateChunkSize;
        return instance;
      } catch (error) {
        throw new Error(`Failed to parse config file: ${error.message}`);
      }
    }
    return new Config();
  }
}

export default Config;
