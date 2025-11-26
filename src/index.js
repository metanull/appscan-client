#!/usr/bin/env node

import { Command } from 'commander';
import { listApplications } from './commands/list-applications.js';
import { listScans } from './commands/list-scans.js';
import { listScanExecutions } from './commands/list-scan-executions.js';
import { listIssues } from './commands/list-issues.js';
import { generateReport } from './commands/generate-report.js';

const program = new Command();

program
  .name('appscan')
  .description('CLI tool for interacting with HCL AppScan Cloud API')
  .version('1.0.0');

program
  .command('list-applications')
  .alias('apps')
  .description('List all applications')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .action(listApplications);

program
  .command('list-scans')
  .alias('scans')
  .description('List scans for a specific application')
  .argument('<appId>', 'Application ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .action(listScans);

program
  .command('list-scan-executions')
  .alias('executions')
  .description('List executions for a specific scan')
  .argument('<scanId>', 'Scan ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .action(listScanExecutions);

program
  .command('list-issues')
  .alias('issues')
  .description('List issues for a specific scan')
  .argument('<scanId>', 'Scan ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .option('-e, --exclude-status <status>', 'Exclude issues by status (comma-separated, use empty string "" for none)', 'Noise')
  .action(listIssues);

program
  .command('generate-report')
  .alias('report')
  .description('Generate a report')
  .argument('<type>', 'Report type (applications, scans, issues, executions)')
  .argument('[id]', 'Resource ID (required for scans, issues, executions)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-f, --format <format>', 'Output format (markdown, html)', 'markdown')
  .option('-o, --output <path>', 'Output file path')
  .option('-e, --exclude-status <status>', 'Exclude issues by status (comma-separated, use empty string "" for none, applies to issues reports only)', 'Noise')
  .action(generateReport);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
