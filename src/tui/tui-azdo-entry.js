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

/**
 * Launch the Azure DevOps TUI application
 * @param {Object} options - Launch options
 * @param {string} options.config - Path to config file
 */
export async function launchAzdoTUI(options = {}) {
  // Enable TUI mode FIRST to disable console output
  logger.setTuiMode(true);

  const envPath = getEnvPath();
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  // Log effective environment detection for debugging
  logger.info('Azure DevOps TUI launch context', {
    envPath: envPath,
    envPathExists: fs.existsSync(envPath),
    orgPresent: !!process.env.AZURE_DEVOPS_ORG,
    tokenPresent: !!process.env.AZURE_DEVOPS_PAT,
  });

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
