/**
 * Common CLI command utilities
 * Shared patterns extracted from CLI commands to follow DRY principle
 */

import { Config } from './config.js';
import { AppScanService } from '../services/appscan-service.js';
import { JiraService } from '../services/jira-service.js';
import { AzdoService } from '../services/azdo-service.js';
import cliOutput from './cli-output.js';

/**
 * Initialize AppScanService with config
 * Standard pattern used by all CLI commands
 *
 * @param {string} configPath - Optional path to config file
 * @returns {Promise<{config: Config, service: AppScanService}>}
 */
export async function initializeAppScanService(configPath) {
  const config = configPath ? Config.loadFromFile(configPath) : new Config();
  const service = new AppScanService(config);
  await service.authenticate();
  return { config, service };
}

/**
 * Initialize both AppScan and Jira services
 * Used by commands that need Jira integration
 *
 * @param {string} configPath - Optional path to config file
 * @returns {Promise<{config: Config, service: AppScanService, jiraService: JiraService}>}
 */
export async function initializeServices(configPath) {
  const { config, service } = await initializeAppScanService(configPath);
  const jiraService = new JiraService(config);
  return { config, service, jiraService };
}

/**
 * Initialize AzdoService with config
 * Standard pattern used by all AzDO CLI commands
 *
 * @param {string} configPath - Optional path to config file
 * @returns {Promise<{config: Config, service: AzdoService}>}
 */
export async function initializeAzdoService(configPath) {
  const config = configPath ? Config.loadFromFile(configPath) : new Config();
  const service = new AzdoService(config);
  await service.connect();
  return { config, service };
}

/**
 * Standard error handler for CLI commands
 * Logs error and exits with code 1
 *
 * @param {Error} error - The error to handle
 * @param {string} context - Optional context message
 */
export function handleCommandError(error, context = 'Command failed') {
  cliOutput.error(`${context}: ${error.message}`, error);
  process.exit(1);
}

/**
 * Output data based on format option
 * Supports JSON or formatted output
 *
 * @param {any} data - Data to output
 * @param {boolean} jsonFormat - Whether to output as JSON
 * @param {Function} formatFunction - Function to format data for display
 */
export function outputData(data, jsonFormat, formatFunction = null) {
  if (jsonFormat) {
    cliOutput.json(data);
  } else if (formatFunction) {
    formatFunction(data);
  } else {
    cliOutput.result(data);
  }
}

/**
 * Parse comma-separated list option
 *
 * @param {string} value - Comma-separated string
 * @returns {string[]} Array of trimmed values
 */
export function parseCommaSeparated(value) {
  if (!value || value === '""' || value === "''") {
    return [];
  }
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Extract short path from URL for display
 * Common pattern used in multiple places
 *
 * @param {string} url - Full URL or path
 * @returns {string} Short path for display
 */
export function extractShortPath(url) {
  if (!url) return 'N/A';

  // Try to extract from query parameter
  const pathMatch = url.match(/[?&]path=([^&]+)/);
  if (pathMatch) {
    const path = decodeURIComponent(pathMatch[1]);
    const parts = path.replace(/^\//, '').split('/');
    return parts.length > 3 ? parts.slice(-3).join('/') : parts.join('/');
  }

  // Fallback to URL path
  const parts = url.split('/').filter((p) => p && !p.startsWith('?'));
  return parts.length > 3 ? parts.slice(-3).join('/') : parts.join('/');
}
