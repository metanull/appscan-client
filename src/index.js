#!/usr/bin/env node
import { program } from 'commander';
import { setupCLI } from './cli/index.js';

// Detect if running in TUI mode (no args or 'triage' command)
const args = process.argv.slice(2);
const isTuiMode = args.length === 0 || args[0] === 'triage';
const tuiArgs = args[0] === 'triage' ? args.slice(1) : args;

if (isTuiMode && !args.includes('--help') && !args.includes('-h')) {
  const { startTUI } = await import('./tui/index.js');
  await startTUI(tuiArgs);
} else {
  setupCLI(program);
  program.parse(process.argv);
}
