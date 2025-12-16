import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_JSON = '.appscantriage.json';
const DEFAULT_ENV = '.env';

export class ConfigManager {
  constructor(options = {}) {
    this.configPath = options.configPath || this.findConfigFile();
  }

  findConfigFile() {
    const locations = [
      process.cwd(),
      process.env.USERPROFILE || process.env.HOME,
      path.resolve(__dirname, '../..')
    ].filter(Boolean);

    for (const base of locations) {
      const candidate = path.resolve(base, DEFAULT_JSON);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    for (const base of locations) {
      const candidate = path.resolve(base, DEFAULT_ENV);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  loadEnv(envFile) {
    const opts = envFile ? { path: envFile } : undefined;
    process.env.DOTENV_CONFIG_QUIET = 'true';
    dotenv.config(opts);
  }

  loadJson(filePath) {
    const jsonPath = path.resolve(filePath);
    const content = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(content);
  }

  getConfig() {
    const config = {
      apiKey: process.env.APPSCAN_API_KEY || null,
      apiSecret: process.env.APPSCAN_API_SECRET || null,
      baseUrl: process.env.APPSCAN_BASE_URL || 'https://cloud.appscan.com',
      jiraHost: process.env.JIRA_HOST || null,
      jiraEmail: process.env.JIRA_EMAIL || null,
      jiraApiToken: process.env.JIRA_API_TOKEN || null,
      jiraProjectKey: process.env.JIRA_PROJECT_KEY || null
    };

    if (!this.configPath) {
      return config;
    }

    const normalizedPath = path.resolve(this.configPath);
    if (normalizedPath.endsWith('.env')) {
      this.loadEnv(normalizedPath);
      return {
        ...config,
        apiKey: process.env.APPSCAN_API_KEY || config.apiKey,
        apiSecret: process.env.APPSCAN_API_SECRET || config.apiSecret,
        baseUrl: process.env.APPSCAN_BASE_URL || config.baseUrl,
        jiraHost: process.env.JIRA_HOST || config.jiraHost,
        jiraEmail: process.env.JIRA_EMAIL || config.jiraEmail,
        jiraApiToken: process.env.JIRA_API_TOKEN || config.jiraApiToken,
        jiraProjectKey: process.env.JIRA_PROJECT_KEY || config.jiraProjectKey
      };
    }

    if (fs.existsSync(normalizedPath)) {
      try {
        const fileConfig = this.loadJson(normalizedPath);
        return {
          ...config,
          apiKey: fileConfig.apiKey || config.apiKey,
          apiSecret: fileConfig.apiSecret || config.apiSecret,
          baseUrl: fileConfig.baseUrl || config.baseUrl,
          jiraHost: fileConfig.jiraHost || config.jiraHost,
          jiraEmail: fileConfig.jiraEmail || config.jiraEmail,
          jiraApiToken: fileConfig.jiraApiToken || config.jiraApiToken,
          jiraProjectKey: fileConfig.jiraProjectKey || config.jiraProjectKey
        };
      } catch (error) {
        throw new Error(`Failed to parse config file: ${error.message}`);
      }
    }

    return config;
  }

  isConfigured() {
    const cfg = this.getConfig();
    return Boolean(cfg.apiKey && cfg.apiSecret);
  }

  needsSetup() {
    return !this.isConfigured();
  }

  getAppScanConfig() {
    const cfg = this.getConfig();
    return {
      apiKey: cfg.apiKey,
      apiSecret: cfg.apiSecret,
      baseUrl: cfg.baseUrl
    };
  }

  getJiraConfig() {
    const cfg = this.getConfig();
    return {
      host: cfg.jiraHost,
      email: cfg.jiraEmail,
      apiToken: cfg.jiraApiToken,
      projectKey: cfg.jiraProjectKey
    };
  }
}

export default ConfigManager;
