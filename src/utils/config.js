import dotenv from 'dotenv';
import fs from 'fs';
import { ConfigManager } from './config-manager.js';

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
    const manager = new ConfigManager({ configPath: filePath });
    const cfg = manager.getConfig();
    const instance = new Config();
    instance.apiKey = cfg.apiKey;
    instance.apiSecret = cfg.apiSecret;
    instance.baseUrl = cfg.baseUrl;
    instance.jiraHost = cfg.jiraHost;
    instance.jiraEmail = cfg.jiraEmail;
    instance.jiraApiToken = cfg.jiraApiToken;
    instance.jiraProjectKey = cfg.jiraProjectKey;
    return instance;
  }
}

export default Config;
