/**
 * Config Paths Utility
 * Provides consistent paths for configuration files across development and installed package
 */

import { homedir } from 'os';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

/**
 * Get the configuration directory path
 * - In development: uses project root
 * - When installed globally: uses ~/.appscan-client
 * @returns {string} Path to config directory
 */
export function getConfigDir() {
  // Determine whether we're running from an installed package.
  // Relying on `process.argv[1]` alone can be unreliable (npx, different shells,
  // or packaged binaries). Also check the current module dirname.
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const isInstalled =
    Boolean(process.argv[1]) && process.argv[1].includes('node_modules')
      ? true
      : moduleDir.includes('node_modules');

  if (isInstalled) {
    // Global install - prefer user's home directory for config
    const configDir = join(homedir(), '.appscan-client');

    // Ensure directory exists; log on failure to aid debugging
    try {
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }
    } catch (err) {
      // Intentionally use stderr so that interactive runs surface the problem
      console.error(`Failed to create config dir ${configDir}: ${err.message}`);
    }

    return configDir;
  }

  // Development mode - use project root
  return process.cwd();
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

/**
 * Get the path to the web UI static files
 * Uses the same detection mechanism as getConfigDir to ensure consistent behavior
 * @returns {string} Full path to web UI directory
 */
export function getWebUIPath() {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const isInstalled =
    Boolean(process.argv[1]) && process.argv[1].includes('node_modules')
      ? true
      : moduleDir.includes('node_modules');

  if (isInstalled) {
    // When installed as a package, the bundled code is at node_modules/@metanull/appscan-client/dist/index.js
    // and web files are at node_modules/@metanull/appscan-client/dist/web
    // Walk up from the module directory to find dist/web
    let dir = moduleDir;
    while (true) {
      const candidate = join(dir, 'dist', 'web');
      if (existsSync(join(candidate, 'index.html'))) {
        return candidate;
      }
      const parent = dirname(dir);
      if (parent === dir) break; // reached filesystem root
      dir = parent;
    }
  }

  // Development mode - web files are at project_root/dist/web
  return join(process.cwd(), 'dist', 'web');
}
