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
    const errorMsg = [
      chalk.red('\n❌ Missing required environment variables!\n'),
      chalk.yellow('Required variables:'),
      chalk.white('  - AZURE_DEVOPS_ORG'),
      chalk.white('  - AZURE_DEVOPS_PAT\n'),
      chalk.cyan('Please run the setup wizard first:'),
      chalk.white('  ' + chalk.yellow('appscan setup') + '\n'),
    ].join('\n');
    logger.error('Missing required Azure DevOps environment variables', null, {
      AZURE_DEVOPS_ORG: !!process.env.AZURE_DEVOPS_ORG,
      AZURE_DEVOPS_PAT: !!process.env.AZURE_DEVOPS_PAT,
    }, { fileOnly: true });
    process.stderr.write(errorMsg);
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
