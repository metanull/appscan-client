/**
 * Detectify TUI entry point
 * Launches the Ink-based terminal UI for Detectify
 */

import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import fs from 'fs';
import { App } from './apps/detectify/main.js';
import { KeyboardProvider } from './shared/utils/KeyboardManager.js';
import { ErrorBoundary } from './shared/components/ErrorBoundary.js';
import logger from '../utils/logger.js';
import { getEnvPath } from '../utils/config-paths.js';
import chalk from 'chalk';

/**
 * Launch the Detectify TUI application
 * @param {Object} options - Launch options
 * @param {string} options.config - Path to config file
 */
export async function launchDetectifyTUI(options = {}) {
  // Enable TUI mode FIRST to disable console output
  logger.setTuiMode(false); // Temporarily disable for error messages

  const envPath = getEnvPath();
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  // Check for required environment variables
  if (!process.env.DETECTIFY_API_KEY) {
    const errorMsg = [
      chalk.red('\n❌ Missing required environment variables!\n'),
      chalk.yellow('Required variables:'),
      chalk.white('  - DETECTIFY_API_KEY\n'),
      chalk.cyan(
        'Please set DETECTIFY_API_KEY in your .env file or environment:'
      ),
      chalk.white('  ' + chalk.yellow('DETECTIFY_API_KEY=your-api-key') + '\n'),
    ].join('\n');
    logger.error(
      'Missing required Detectify environment variables',
      null,
      {
        DETECTIFY_API_KEY: !!process.env.DETECTIFY_API_KEY,
      },
      { fileOnly: true }
    );
    process.stderr.write(errorMsg);
    process.exit(1);
  }

  // Log effective environment detection for debugging
  logger.info('Detectify TUI launch context', {
    envPath: envPath,
    envPathExists: fs.existsSync(envPath),
    apiKeyPresent: !!process.env.DETECTIFY_API_KEY,
    baseUrl: process.env.DETECTIFY_BASE_URL || 'https://api.detectify.com',
  });

  logger.setTuiMode(true); // Enable TUI mode now
  logger.info('Starting Detectify Ink TUI application');
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
