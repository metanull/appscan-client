#!/usr/bin/env node

import { Command } from 'commander';
import { getPackageInfo } from '../utils/package-info.js';
import { listApplications } from './commands/list-applications.js';
import { getApplication } from './commands/get-application.js';
import { listScans } from './commands/list-scans.js';
import { listScanExecutions } from './commands/list-scan-executions.js';
import { listIssues } from './commands/list-issues.js';
import { listIssuesByApp } from './commands/list-issues-by-app.js';
import { getIssueDetails } from './commands/get-issue-details.js';
import { authBearer } from './commands/auth-bearer.js';
import { generateReport } from './commands/generate-report.js';
import { generateAndDownloadReport } from './commands/generate-and-download-report.js';
import { generateMarkdownReport } from './commands/generate-markdown-report.js';
import { getArticle } from './commands/get-article.js';
import { getArticleMarkdown } from './commands/get-article-markdown.js';
import { generateAllReports } from './commands/all-reports.js';
import { generateYearlySummary } from './commands/yearly-summary.js';
import { updateIssueStatus } from './commands/update-issue-status.js';
import { getIssueComments } from './commands/get-issue-comments.js';
import { createJiraIssue } from './commands/create-jira-issue.js';
import { setup } from './commands/setup.js';
import { connectionCheck } from './commands/connection-check.js';

const packageJson = getPackageInfo();

const program = new Command();

program
  .name('appscan')
  .description('CLI tool for interacting with HCL AppScan Cloud API')
  .version(packageJson.version);

program
  .command('setup')
  .description('Interactive setup wizard to configure .env file')
  .option('-f, --force', 'Force overwrite existing .env file')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan setup
  $ appscan setup --force`
  )
  .action(setup);

program
  .command('connection-check')
  .alias('check')
  .description('Verify API credentials and test connection to AppScan')
  .option('-c, --config <path>', 'Path to configuration file')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan connection-check
  $ appscan check --config ./config.env`
  )
  .action(connectionCheck);

program
  .command('list-applications')
  .alias('apps')
  .description('List all applications')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-applications
  $ appscan apps --json
  $ appscan list-applications --config ./config.env`
  )
  .action(listApplications);

program
  .command('get-application')
  .alias('app')
  .description('Get detailed information about a specific application')
  .argument('<applicationId>', 'Application ID (UUID)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-application <app-id>
  $ appscan app <app-id> --json`
  )
  .action(getApplication);

program
  .command('list-scans')
  .alias('scans')
  .description('List scans, optionally filtered by application ID')
  .argument('[appId]', 'Application ID (optional)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-scans
  $ appscan scans <appId>
  $ appscan list-scans --json`
  )
  .action(listScans);

program
  .command('list-scan-executions')
  .alias('executions')
  .description('List executions for a specific scan')
  .argument('<scanId>', 'Scan ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-scan-executions <scanId>
  $ appscan executions <scanId> --json`
  )
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
  .option('--active', 'Filter active issues (Open, Reopened, InProgress)')
  .option('--inactive', 'Filter inactive issues (Noise, Passed, Fixed)')
  .option('--pending', 'Filter pending issues (Open, Reopened)')
  .option('--processed', 'Filter processed issues (InProgress, Fixed, Passed)')
  .option('--low', 'Filter low severity issues (Low, Informational)')
  .option('--medium', 'Filter medium severity issues')
  .option('--high', 'Filter high severity issues (High, Critical)')
  .option('--assigned', 'Filter issues with Jira link')
  .option('--unassigned', 'Filter issues without Jira link')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-issues <scanId>
  $ appscan issues <scanId> --json
  $ appscan issues <scanId> --exclude-status "Noise,Ignore"
  $ appscan issues <scanId> --grouped
  $ appscan issues <scanId> --active --high
  $ appscan issues <scanId> --pending --unassigned`
  )
  .option(
    '--columns <type>',
    'Force columns: sast, dast, sca, all (overrides auto-detection)'
  )
  .action(listIssues);

program
  .command('list-issues-by-app')
  .alias('app-issues')
  .description('List all issues for an application (across all scans)')
  .argument('<appId>', 'Application ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .option(
    '-g, --grouped',
    'Sort issues by application, scan, issue type, and severity before printing'
  )
  .option('--active', 'Filter active issues (Open, Reopened, InProgress)')
  .option('--inactive', 'Filter inactive issues (Noise, Passed, Fixed)')
  .option('--pending', 'Filter pending issues (Open, Reopened)')
  .option('--processed', 'Filter processed issues (InProgress, Fixed, Passed)')
  .option('--low', 'Filter low severity issues (Low, Informational)')
  .option('--medium', 'Filter medium severity issues')
  .option('--high', 'Filter high severity issues (High, Critical)')
  .option('--assigned', 'Filter issues with Jira link')
  .option('--unassigned', 'Filter issues without Jira link')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-issues-by-app <appId>
  $ appscan app-issues <appId> --json
  $ appscan app-issues <appId> --grouped
  $ appscan app-issues <appId> --active --high
  $ appscan app-issues <appId> --pending --unassigned`
  )
  .action(listIssuesByApp);

program
  .command('auth')
  .argument('<type>', 'Authentication type (bearer)')
  .description('Authenticate and display bearer token')
  .option('-c, --config <path>', 'Path to configuration file')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan auth bearer
  $ appscan auth bearer --config ./config.env`
  )
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
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-issue-details <issueId>
  $ appscan issue-details <issueId> --format xml
  $ appscan issue-details <issueId> --output ./issue.html
  $ appscan issue-details <issueId> --locale fr-FR`
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
  .option(
    '-s, --min-severity <value>',
    'Minimum severity value (integer) to include in report (default: 3)',
    '3'
  )
  .addHelpText(
    'after',
    `
Examples:
  $ appscan generate-report applications
  $ appscan report scans <appId> --format html
  $ appscan report issues <scanId> --output ./report.md
  $ appscan report issues <scanId> --grouped --min-severity 2`
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
  .option(
    '--grouped',
    'Use grouped issues layout with remediation snippets (default)'
  )
  .option('--no-grouped', 'Disable grouped layout (not recommended)')
  .option(
    '-s, --min-severity <value>',
    'Minimum severity value (integer) to include in reports (default: 3)',
    '3'
  )
  .option('-c, --config <path>', 'Path to configuration file')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan all-reports
  $ appscan all-reports --html --outdir ./security-reports
  $ appscan all-reports --technology StaticAnalyzer,DynamicAnalyzer
  $ appscan all-reports --min-severity 2 --no-grouped`
  )
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
  .addHelpText(
    'after',
    `
Examples:
  $ appscan generate-api-report Scan <scanId>
  $ appscan api-report Application <appId> --format Pdf
  $ appscan api-report Scan <scanId> --format Csv --output ./report.csv
  $ appscan api-report ScanExecution <execId> --open-only --title "Security Report"`
  )
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
  .addHelpText(
    'after',
    `
Examples:
  $ appscan generate-markdown-api-report Scan <scanId>
  $ appscan md-report Application <appId> --output ./report.md
  $ appscan md-report Scan <scanId> --open-only --title "Vulnerabilities"`
  )
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
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-article <issueId>
  $ appscan article <issueId> --output ./article.html
  $ appscan article <issueId> --language JavaScript --nl es
  $ appscan article <issueId> --enable-training-links --mode dark`
  )
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
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-article-markdown <issueId>
  $ appscan article-md <issueId> --output ./article.md
  $ appscan article-md <issueId> --language Python --nl fr`
  )
  .action(getArticleMarkdown);

program
  .command('yearly-summary')
  .alias('summary')
  .description('Generate yearly summary of scans and vulnerabilities')
  .argument('[year]', 'Target year (defaults to current year)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan yearly-summary
  $ appscan summary 2024
  $ appscan yearly-summary 2023 --json`
  )
  .action(generateYearlySummary);

program
  .command('update-issue-status')
  .alias('update-status')
  .description('Update the status of an issue')
  .argument('<issueId>', 'Issue ID')
  .argument(
    '<status>',
    'New status (Open, InProgress, Reopened, Noise, Passed, Fixed, New)'
  )
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--comment <comment>', 'Add a comment when updating status')
  .option(
    '--external-id <externalId>',
    'Set external ID (e.g., Jira issue key)'
  )
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan update-issue-status <issueId> InProgress
  $ appscan update-status <issueId> Fixed --comment "Fixed in version 1.2.3"
  $ appscan update-status <issueId> Noise --external-id "JIRA-123"`
  )
  .action(updateIssueStatus);

program
  .command('get-issue-comments')
  .alias('comments')
  .description('Get comments for a specific issue')
  .argument('<issueId>', 'Issue ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-issue-comments <issueId>
  $ appscan comments <issueId> --json`
  )
  .action(getIssueComments);

program
  .command('create-jira-issue')
  .alias('jira')
  .description('Create Jira issue(s) from AppScan scan or issue')
  .argument('<source>', 'Source type: scan or issue')
  .argument('<sourceId>', 'Source ID (Scan ID or Issue ID)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option(
    '-p, --project <projectKey>',
    'Jira project key (overrides JIRA_PROJECT_KEY env var)'
  )
  .option(
    '-s, --min-severity <value>',
    'Minimum severity value (0-5, default: 0)',
    '0'
  )
  .option(
    '-e, --exclude-status <status>',
    'Exclude issues by status (comma-separated, default: Noise)',
    'Noise'
  )
  .option('-t, --issue-type <type>', 'Jira issue type (default: Bug)', 'Bug')
  .option(
    '-l, --labels <labels>',
    'Comma-separated labels (default: appscan,security)'
  )
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan create-jira-issue scan <scanId>
  $ appscan jira scan <scanId> --min-severity 3 --project PROJ
  $ appscan jira issue <issueId> --project PROJ --issue-type Task
  $ appscan jira scan <scanId> --min-severity 4 --labels "security,critical"`
  )
  .action(createJiraIssue);

export function runCLI(argv = process.argv) {
  program.parse(argv);

  if (!argv.slice(2).length) {
    program.outputHelp();
  }
}

// Run CLI if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI();
}
