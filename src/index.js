#!/usr/bin/env node

/**
 * Unified entry point for AppScan CLI and TUI
 * Routes to CLI (commander) or TUI (ink) based on arguments
 */

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { getEnvPath } from './utils/config-paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct location
dotenv.config({ path: getEnvPath() });

const args = process.argv.slice(2);

// Determine if we should launch TUI or CLI
// No args or 'triage' command → launches TUI
// Other commands → handled by CLI
const shouldLaunchTUI =
  args.length === 0 ||
  args[0] === 'triage' ||
  (args[0] === '--help' && args.length === 1) ||
  (args[0] === '-h' && args.length === 1);

if (shouldLaunchTUI && args[0] !== '--help' && args[0] !== '-h') {
  // Launch TUI
  const { launchTUI } = await import('./tui/tui-entry.js');

  // Pass config option if provided
  const configIndex =
    args.indexOf('--config') !== -1
      ? args.indexOf('--config')
      : args.indexOf('-c');
  const config =
    configIndex !== -1 && args[configIndex + 1] ? args[configIndex + 1] : null;

  await launchTUI({ config });
} else {
  // Launch CLI
  const { runCLI } = await import('./cli/cli-entry.js');
  runCLI();
}
