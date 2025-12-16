/**
 * TUI entry point
 * Launches the Ink-based terminal UI
 */

import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { InkApp } from './ui/InkApp.js';
import { SetupWizard } from './ui/SetupWizard.js';
import { KeyboardProvider } from './utils/KeyboardManager.js';
import { ErrorBoundary } from './ui/components/ErrorBoundary.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Launch the TUI application
 * @param {Object} options - Launch options
 * @param {string} options.config - Path to config file
 * @param {boolean} options.setup - Force setup wizard
 */
export async function launchTUI(options = {}) {
  // Load .env file from project root
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  // Check if configuration exists
  const hasEnv = fs.existsSync(envPath);

  // Log effective environment detection for debugging
  logger.info('TUI launch context', {
    cwd: process.cwd(),
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
      )
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
      )
    );
  }
}
