/**
 * TUI entry point
 * Launches the Ink-based terminal UI
 */

import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import fs from 'fs';
import { InkApp } from './ui/InkApp.js';
import { SetupWizard } from './ui/SetupWizard.js';
import { KeyboardProvider } from './utils/KeyboardManager.js';
import { ErrorBoundary } from './ui/components/ErrorBoundary.js';
import logger from '../utils/logger.js';
import { getEnvPath } from '../utils/config-paths.js';

/**
 * Launch the TUI application
 * @param {Object} options - Launch options
 * @param {string} options.config - Path to config file
 * @param {boolean} options.setup - Force setup wizard
 */
export async function launchTUI(options = {}) {
  // Enable TUI mode FIRST to disable console output
  logger.setTuiMode(true);

  // Load .env file from correct location (user home for installed packages)
  const envPath = getEnvPath();
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  // Check if configuration exists
  const hasEnv = fs.existsSync(envPath);

  // Log effective environment detection for debugging
  logger.info('TUI launch context', {
    envPath: envPath,
    envPathExists: hasEnv,
    apiKeyPresent: !!process.env.APPSCAN_API_KEY,
    apiSecretPresent: !!process.env.APPSCAN_API_SECRET,
  });

  // Force setup wizard if --setup flag or no .env file exists
  if (options.setup || !hasEnv) {
    logger.info('Starting setup wizard');
    const { waitUntilExit } = render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(SetupWizard, {
          onComplete: () => {
            logger.info('Setup completed');
            process.exit(0); // Exit and let user restart
          },
          onCancel: () => {
            logger.info('Setup cancelled');
            process.exit(0);
          },
        })
      ),
      {
        incrementalRendering: true,
      }
    );

    await waitUntilExit();
  } else {
    logger.info('Starting Ink TUI application');
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(
          KeyboardProvider,
          null,
          React.createElement(InkApp, { configPath: options.config })
        )
      ),
      {
        incrementalRendering: true,
      }
    );
  }
}
