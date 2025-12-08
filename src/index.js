#!/usr/bin/env node

import { Command } from 'commander';
import { listApplications } from './commands/list-applications.js';
import { listScans } from './commands/list-scans.js';
import { listScanExecutions } from './commands/list-scan-executions.js';
import { listIssues } from './commands/list-issues.js';
import { getIssueDetails } from './commands/get-issue-details.js';
import { authBearer } from './commands/auth-bearer.js';
import { generateReport } from './commands/generate-report.js';
import { generateAndDownloadReport } from './commands/generate-and-download-report.js';
import { generateMarkdownReport } from './commands/generate-markdown-report.js';
import { getArticle } from './commands/get-article.js';
import { getArticleMarkdown } from './commands/get-article-markdown.js';
import { generateAllReports } from './commands/all-reports.js';
import { generateYearlySummary } from './commands/yearly-summary.js';

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
  .description('List scans, optionally filtered by application ID')
  .argument('[appId]', 'Application ID (optional)')
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
  .option(
    '-e, --exclude-status <status>',
    'Exclude issues by status (comma-separated, use empty string "" for none)',
    'Noise'
  )
  .option(
    '-g, --grouped',
    'Sort issues by application, issue type, and severity before printing'
  )
  .action(listIssues);

program
  .command('auth')
  .argument('<type>', 'Authentication type (bearer)')
  .description('Authenticate and display bearer token')
  .option('-c, --config <path>', 'Path to configuration file')
  .action((type, options) => {
    if (type === 'bearer') {
      authBearer(options);
    } else {
      console.error(`Unknown authentication type: ${type}`);
      process.exit(1);
    }
  });

program
  .command('get-issue-details')
  .alias('issue-details')
  .description(
    'Get detailed information about a specific issue (returns HTML or XML document)'
  )
  .argument('<issueId>', 'Issue ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option(
    '-l, --locale <locale>',
    'Locale for issue details (default: en-US)',
    'en-US'
  )
  .option(
    '-f, --format <format>',
    'Output format: html or xml (default: html)',
    'html'
  )
  .option(
    '-o, --output <path>',
    'Output file path (if not specified, outputs to console)'
  )
  .action(getIssueDetails);

program
  .command('generate-report')
  .alias('report')
  .description('Generate a report')
  .argument('<type>', 'Report type (applications, scans, issues, executions)')
  .argument('[id]', 'Resource ID (required for scans, issues, executions)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-f, --format <format>', 'Output format (markdown, html)', 'markdown')
  .option('-o, --output <path>', 'Output file path')
  .option(
    '-e, --exclude-status <status>',
    'Exclude issues by status (comma-separated, use empty string "" for none, applies to issues reports only)',
    'Noise'
  )
  .option(
    '-g, --grouped',
    'Apply grouped sorting when generating issue reports'
  )
  .action(generateReport);

program
  .command('all-reports')
  .description('Generate issues reports for every scan')
  .option('--html', 'Produce HTML reports instead of Markdown')
  .option('--outdir <path>', 'Directory to write reports (default: ./reports)')
  .option(
    '--technology <techs>',
    'Comma-separated list of technologies to include (StaticAnalyzer, ScaAnalyzer, DynamicAnalyzer)'
  )
  .option(
    '--exclude-status <status>',
    'Statuses to filter out when listing issues (default: Noise)',
    'Noise'
  )
  .option('--grouped', 'Use grouped issues layout with remediation snippets (default)')
  .option('--no-grouped', 'Disable grouped layout (not recommended)')
  .option('-c, --config <path>', 'Path to configuration file')
  .action(generateAllReports);

program
  .command('generate-api-report')
  .alias('api-report')
  .description('Generate and download a security report from AppScan API')
  .argument('<type>', 'Report type: Scan, Application, or ScanExecution')
  .argument(
    '<id>',
    'Resource ID (Scan ID, Application ID, or ScanExecution ID)'
  )
  .option('-c, --config <path>', 'Path to configuration file')
  .option(
    '-f, --format <format>',
    'Report format: Html, Pdf, SARIF, Xml, Csv (default: Html)',
    'Html'
  )
  .option(
    '-o, --output <path>',
    'Output file path (default: report-{id}.{ext})'
  )
  .option('-t, --title <title>', 'Report title')
  .option('-n, --notes <notes>', 'Report notes')
  .option('-l, --locale <locale>', 'Report locale (default: en-US)', 'en-US')
  .option('--odata-filter <filter>', 'OData filter for issues')
  .option('--open-only', 'Include only issues with Status = Open')
  .option('-j, --json', 'Output result as JSON')
  .action(generateAndDownloadReport);

program
  .command('generate-markdown-api-report')
  .alias('md-report')
  .description('Generate HTML report from AppScan API and convert to Markdown')
  .argument('<type>', 'Report type: Scan, Application, or ScanExecution')
  .argument(
    '<id>',
    'Resource ID (Scan ID, Application ID, or ScanExecution ID)'
  )
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-o, --output <path>', 'Save markdown to file (optional)')
  .option('-t, --title <title>', 'Report title')
  .option('-n, --notes <notes>', 'Report notes')
  .option('-l, --locale <locale>', 'Report locale (default: en-US)', 'en-US')
  .option('--odata-filter <filter>', 'OData filter for issues')
  .option('--open-only', 'Include only issues with Status = Open')
  .action(generateMarkdownReport);

program
  .command('get-article')
  .alias('article')
  .description('Get remediation article for an issue (HTML format)')
  .argument('<issueId>', 'Issue ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-o, --output <path>', 'Save article to file (optional)')
  .option('--language <language>', 'Article language')
  .option('--api <api>', 'API name')
  .option('--cve-id <cveId>', 'CVE ID')
  .option('--nl <nl>', 'Natural language', 'en')
  .option('--mode <mode>', 'Display mode: light or dark', 'light')
  .option('--enable-training-links', 'Enable training links')
  .option('--debug', 'Show debug information')
  .action(getArticle);

program
  .command('get-article-markdown')
  .alias('article-md')
  .description('Get remediation article for an issue and convert to Markdown')
  .argument('<issueId>', 'Issue ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-o, --output <path>', 'Save markdown to file (optional)')
  .option('--language <language>', 'Article language')
  .option('--api <api>', 'API name')
  .option('--cve-id <cveId>', 'CVE ID')
  .option('--nl <nl>', 'Natural language', 'en')
  .option('--mode <mode>', 'Display mode: light or dark', 'light')
  .option('--enable-training-links', 'Enable training links')
  .action(getArticleMarkdown);

program
  .command('yearly-summary')
  .alias('summary')
  .description('Generate yearly summary of scans and vulnerabilities')
  .argument('[year]', 'Target year (defaults to current year)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .action(generateYearlySummary);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
