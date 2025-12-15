/**
 * Main entry point for Ink-based TUI
 * AppScan Vulnerability Triage UI
 */

import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
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

// Load .env file from parent directory before anything else
const envPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const cli = meow(
  `
  Usage
    $ appscan-triage-ui [options]

  Options
    --config, -c  Path to configuration file
    --setup, -s   Run setup wizard
    --help        Show help

  Examples
    $ appscan-triage-ui
    $ appscan-triage-ui --config /path/to/.appscantriage.json
    $ appscan-triage-ui --setup
`,
  {
    importMeta: import.meta,
    flags: {
      config: {
        type: 'string',
        shortFlag: 'c',
      },
      setup: {
        type: 'boolean',
        shortFlag: 's',
        default: false,
      },
    },
  }
);

// Check if configuration exists
// The .env file should be in the appscan-client root directory
// When running 'npm start' from ink-triage/, cwd is ink-triage
const hasEnv = fs.existsSync(envPath);

// Force setup wizard if --setup flag or no .env file exists
if (cli.flags.setup || !hasEnv) {
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
        React.createElement(InkApp, { configPath: cli.flags.config })
      )
    )
  );
}
