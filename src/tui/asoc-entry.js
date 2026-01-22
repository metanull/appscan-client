/**
 * TUI entry point
 * Launches the Ink-based terminal UI
 */

import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import fs from 'fs';
import { App } from './apps/asoc/main.js';
import { KeyboardProvider } from './shared/utils/KeyboardManager.js';
import { ErrorBoundary } from './shared/components/ErrorBoundary.js';
import logger from '../utils/logger.js';
import { getEnvPath } from '../utils/config-paths.js';
import chalk from 'chalk';

/**
 * Launch the TUI application
 * @param {Object} options - Launch options
 * @param {string} options.config - Path to config file
 */
export async function launchTUI(options = {}) {
  // Enable TUI mode FIRST to disable console output
  logger.setTuiMode(false); // Temporarily disable for error messages

  const envPath = getEnvPath();
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  // Check for required environment variables
  if (!process.env.APPSCAN_API_KEY || !process.env.APPSCAN_API_SECRET) {
    const errorMsg = [
      chalk.red('\n❌ Missing required environment variables!\n'),
      chalk.yellow('Required variables:'),
      chalk.white('  - APPSCAN_API_KEY'),
      chalk.white('  - APPSCAN_API_SECRET\n'),
      chalk.cyan('Please run the setup wizard first:'),
      chalk.white('  ' + chalk.yellow('appscan setup') + '\n'),
    ].join('\n');
    logger.error(
      'Missing required AppScan environment variables',
      null,
      {
        APPSCAN_API_KEY: !!process.env.APPSCAN_API_KEY,
        APPSCAN_API_SECRET: !!process.env.APPSCAN_API_SECRET,
      },
      { fileOnly: true }
    );
    process.stderr.write(errorMsg);
    process.exit(1);
  }

  // Log effective environment detection for debugging
  logger.info('TUI launch context', {
    envPath: envPath,
    envPathExists: fs.existsSync(envPath),
    apiKeyPresent: !!process.env.APPSCAN_API_KEY,
    apiSecretPresent: !!process.env.APPSCAN_API_SECRET,
  });

  logger.setTuiMode(true); // Enable TUI mode now
  logger.info('Starting Ink TUI application');
  render(
    React.createElement(
      ErrorBoundary,
      null,
      React.createElement(
        KeyboardProvider,
        null,
        React.createElement(App, { configPath: options.config })
      )
    ),
    {
      incrementalRendering: true,
    }
  );
}
