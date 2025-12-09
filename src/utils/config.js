import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables silently (suppress dotenv tips/messages)
process.env.DOTENV_CONFIG_QUIET = 'true';
dotenv.config();

export class Config {
  constructor() {
    this.apiKey = process.env.APPSCAN_API_KEY || null;
    this.apiSecret = process.env.APPSCAN_API_SECRET || null;
    this.baseUrl = process.env.APPSCAN_BASE_URL || 'https://cloud.appscan.com';
    this.jiraHost = process.env.JIRA_HOST || null;
    this.jiraEmail = process.env.JIRA_EMAIL || null;
    this.jiraApiToken = process.env.JIRA_API_TOKEN || null;
    this.jiraProjectKey = process.env.JIRA_PROJECT_KEY || null;
  }

  isValid() {
    return !!(this.apiKey && this.apiSecret);
  }

  isJiraValid() {
    return !!(this.jiraHost && this.jiraEmail && this.jiraApiToken);
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
        instance.jiraProjectKey = config.jiraProjectKey || instance.jiraProjectKey;
        return instance;
      } catch (error) {
        throw new Error(`Failed to parse config file: ${error.message}`);
      }
    }
    return new Config();
  }
}

export default Config;
