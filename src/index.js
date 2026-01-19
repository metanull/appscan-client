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

// Load environment variables from the correct location (quietly)
process.env.DOTENV_CONFIG_QUIET = 'true';
dotenv.config({ path: getEnvPath() });

const args = process.argv.slice(2);

// Route based on first argument:
// - 'asoc' (no args after) → launch ASoC TUI
// - 'azdo' (no args after) → launch AzDO TUI
// - any other command → handled by CLI
// - no args → show help (old behavior removed per requirements)

const firstArg = args[0];

if (firstArg === 'asoc' && args.length === 1) {
  // Launch ASoC TUI
  const { launchTUI } = await import('./tui/tui-entry.js');
  await launchTUI({ config: null, mode: 'asoc' });
} else if (firstArg === 'azdo' && args.length === 1) {
  // Launch AzDO TUI
  const { launchAzdoTUI } = await import('./tui/tui-azdo-entry.js');
  await launchAzdoTUI({ config: null, mode: 'azdo' });
} else {
  // Launch CLI (handles --help, commands, etc.)
  const { runCLI } = await import('./cli/cli-entry.js');
  runCLI();
}
