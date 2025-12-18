/**
 * Config Paths Utility
 * Provides consistent paths for configuration files across development and installed package
 */

import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Get the configuration directory path
 * - In development: uses project root
 * - When installed globally: uses ~/.appscan-client
 * @returns {string} Path to config directory
 */
export function getConfigDir() {
  // Check if we're running from installed package (node_modules)
  const isInstalled = process.argv[1]?.includes('node_modules');

  if (isInstalled) {
    // Global install - use user's home directory
    const configDir = join(homedir(), '.appscan-client');

    // Ensure directory exists
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    return configDir;
  } else {
    // Development mode - use project root
    return process.cwd();
  }
}

/**
 * Get the path to the .env file
 * @returns {string} Full path to .env file
 */
export function getEnvPath() {
  return join(getConfigDir(), '.env');
}

/**
 * Get the path to the logs directory
 * @returns {string} Full path to logs directory
 */
export function getLogsDir() {
  const logsDir = join(getConfigDir(), 'logs');

  // Ensure directory exists
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  return logsDir;
}

/**
 * Get the path to the comment templates file
 * @returns {string} Full path to comment-templates.txt file
 */
export function getCommentTemplatesPath() {
  return join(getConfigDir(), 'comment-templates.txt');
}

/**
 * Check if running from an installed package
 * @returns {boolean} True if running from installed package
 */
export function isInstalledPackage() {
  return process.argv[1]?.includes('node_modules');
}
