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

// Load environment variables first (proxy bootstrap depends on them)
process.env.DOTENV_CONFIG_QUIET = 'true';
dotenv.config({ path: getEnvPath() });

// Bootstrap proxy support (must be after dotenv, before HTTP clients)
await import('./utils/bootstrap-proxy.js');

// All commands (including 'asoc' and 'azdo') are handled by CLI
// No args → show help
const { runCLI } = await import('./cli/cli-entry.js');
runCLI();
