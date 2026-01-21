/**
 * Azure DevOps TUI entry point
 * Launches the Ink-based terminal UI for Azure DevOps
 */

import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import fs from 'fs';
import { App } from './apps/azdo/main.js';
import { KeyboardProvider } from './shared/utils/KeyboardManager.js';
import { ErrorBoundary } from './shared/components/ErrorBoundary.js';
import logger from '../utils/logger.js';
import { getEnvPath } from '../utils/config-paths.js';
import chalk from 'chalk';

/**
 * Launch the Azure DevOps TUI application
 * @param {Object} options - Launch options
 * @param {string} options.config - Path to config file
 */
export async function launchAzdoTUI(options = {}) {
  // Enable TUI mode FIRST to disable console output
  logger.setTuiMode(false); // Temporarily disable for error messages

  const envPath = getEnvPath();
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  // Check for required environment variables
  if (!process.env.AZURE_DEVOPS_ORG || !process.env.AZURE_DEVOPS_PAT) {
    console.error(chalk.red('\n❌ Missing required environment variables!\n'));
    console.error(chalk.yellow('Required variables:'));
    console.error(chalk.white('  - AZURE_DEVOPS_ORG'));
    console.error(chalk.white('  - AZURE_DEVOPS_PAT\n'));
    console.error(chalk.cyan('Please run the setup wizard first:'));
    console.error(chalk.white('  ' + chalk.yellow('appscan setup') + '\n'));
    process.exit(1);
  }

  // Log effective environment detection for debugging
  logger.info('Azure DevOps TUI launch context', {
    envPath: envPath,
    envPathExists: fs.existsSync(envPath),
    orgPresent: !!process.env.AZURE_DEVOPS_ORG,
    tokenPresent: !!process.env.AZURE_DEVOPS_PAT,
  });

  logger.setTuiMode(true); // Enable TUI mode now
  logger.info('Starting Azure DevOps Ink TUI application');
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
