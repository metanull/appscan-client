#!/usr/bin/env node

import { Command } from 'commander';
import { getPackageInfo } from '../utils/package-info.js';
import { listApplications } from './commands/list-applications.js';
import { getApplication } from './commands/get-application.js';
import { setApplication } from './commands/set-application.js';
import { listScans } from './commands/list-scans.js';
import { listScanExecutions } from './commands/list-scan-executions.js';
import { listIssues } from './commands/list-issues.js';
import { listIssuesByApp } from './commands/list-issues-by-app.js';
import { listFixGroups } from './commands/list-fixgroups.js';
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
import { getAzdoOrganization } from './commands/get-azdo-organization.js';
import { listAzdoApplications } from './commands/list-azdo-applications.js';
import { getAzdoApplication } from './commands/get-azdo-application.js';
import { listAzdoRepositories } from './commands/list-azdo-repositories.js';
import { getAzdoRepository } from './commands/get-azdo-repository.js';
import { listAzdoIssues } from './commands/list-azdo-issues.js';
import { listAzdoIssuesByApp } from './commands/list-azdo-issues-by-app.js';
import { getAzdoIssueDetail } from './commands/get-azdo-issue-detail.js';
import { updateAzdoIssue } from './commands/update-azdo-issue.js';
import { searchAzdoCode } from './commands/search-azdo-code.js';
import { listAzdoSecrets } from './commands/list-azdo-secrets.js';
import { listDetectifyIssues } from './commands/list-detectify-issues.js';
import { getDetectifyIssueDetail } from './commands/get-detectify-issue-detail.js';
import { updateDetectifyIssue } from './commands/update-detectify-issue.js';

const packageJson = getPackageInfo();

const program = new Command();

// Custom help formatting
program.configureHelp({
  sortSubcommands: true,
  
  formatHelp: (cmd, helper) => {
    const termWidth = helper.padWidth(cmd, helper);
    const itemIndentWidth = 2;
    const itemSeparatorWidth = 2;

    function formatItem(term, description) {
      if (description) {
        return `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
      }
      return term;
    }

    function formatList(textArray) {
      return textArray.join('\n').replace(/^/gm, ' '.repeat(itemIndentWidth));
    }

    let output = [];

    // Package info header
    output.push('');
    output.push(`  ${packageJson.name} v${packageJson.version}`);
    output.push(`  ${packageJson.description}`);
    output.push(`  Author: ${packageJson.author}`);
    output.push(`  License: ${packageJson.license}`);
    if (packageJson.homepage) {
      output.push(`  Homepage: ${packageJson.homepage}`);
    }
    output.push('');

    // Usage
    const usage = helper.commandUsage(cmd);
    output.push(`Usage: ${usage}`);
    output.push('');

    // Options
    const optionList = helper.visibleOptions(cmd).map((option) => {
      return formatItem(helper.optionTerm(option), helper.optionDescription(option));
    });
    if (optionList.length > 0) {
      output.push('Options:');
      output.push(formatList(optionList));
      output.push('');
    }

    // Commands - grouped by service
    if (cmd.commands && cmd.commands.length > 0) {
      const commands = helper.visibleCommands(cmd);
      
      // Define groups
      const groups = {
        'Interactive TUI': [],
        'Setup & Connection': [],
        'AppScan on Cloud (ASOC)': [],
        'Azure DevOps (AZDO)': [],
        'Detectify': [],
        'Reporting': [],
        'Other': [],
      };
      
      // Categorize commands
      for (const subCmd of commands) {
        const name = subCmd.name();
        
        if (['asoc', 'azdo', 'detectify'].includes(name)) {
          groups['Interactive TUI'].push(subCmd);
        } else if (['setup', 'connection-check'].includes(name)) {
          groups['Setup & Connection'].push(subCmd);
        } else if (name.includes('azdo')) {
          groups['Azure DevOps (AZDO)'].push(subCmd);
        } else if (name.includes('detectify')) {
          groups['Detectify'].push(subCmd);
        } else if (name.includes('report') || name.includes('summary') || name.includes('article')) {
          groups['Reporting'].push(subCmd);
        } else if (name.includes('jira') || ['auth', 'help'].includes(name)) {
          groups['Other'].push(subCmd);
        } else {
          groups['AppScan on Cloud (ASOC)'].push(subCmd);
        }
      }
      
      // Output grouped commands
      output.push('Commands:');
      output.push('');
      
      for (const [groupName, groupCommands] of Object.entries(groups)) {
        if (groupCommands.length === 0) continue;
        
        output.push(`  ${groupName}:`);
        
        const commandList = groupCommands.map((subCmd) => {
          const name = subCmd.name();
          const alias = subCmd.alias() || '';
          const args = subCmd._args.map(a => a.required ? `<${a.name()}>` : `[${a.name()}]`).join(' ');
          const desc = subCmd.description();
          
          const term = alias ? `${name}|${alias}` : name;
          const fullTerm = args ? `${term} ${args}` : term;
          return formatItem(fullTerm, desc);
        });
        output.push(formatList(commandList));
        output.push('');
      }
    }

    return output.join('\n');
  },
});

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
  .command('set-application')
  .description('Update application details and custom fields')
  .argument('<applicationId>', 'Application ID (UUID)')
  .argument('[updates]', 'JSON string with updates (optional if using flags)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .option('--name <value>', 'Update Name')
  .option('--description <value>', 'Update Description')
  .option('--type <value>', 'Update Type')
  .option('--url <value>', 'Update URL')
  .option('--technology <value>', 'Update Technology')
  .option('--developmentcontact <value>', 'Update Development Contact')
  .option('--businessowner <value>', 'Update Business Owner')
  .option('--tester <value>', 'Update Tester')
  .option(
    '--riskrating <value>',
    'Update Risk Rating (Unknown/Low/Medium/High)'
  )
  .option(
    '--businessimpact <value>',
    'Update Business Impact (Unknown/Low/Medium/High)'
  )
  .option(
    '--testingstatus <value>',
    'Update Testing Status (NotStarted/InProgress/Completed)'
  )
  .option('--devopsproject <value>', 'Update DevOpsProject custom field')
  .option('--jiraproject <value>', 'Update JiraProject custom field')
  .option('--devopsrepo <value>', 'Update DevOpsRepo custom field')
  .option('--confluencespace <value>', 'Update ConfluenceSpace custom field')
  .option('--jiraparentepic <value>', 'Update JiraParentEpic custom field')
  .addHelpText(
    'after',
    `
Examples:
  # Update using JSON
  $ appscan set-application <app-id> '{"Name":"New Name","Description":"New desc"}'
  $ appscan set-application <app-id> '{"_customFields":{"JiraProject":"AGR"}}'

  # Update using flags
  $ appscan set-application <app-id> --name "New Name" --description "New desc"
  $ appscan set-application <app-id> --jiraproject "AGR" --devopsproject "Agora"

  # Mix standard and custom fields
  $ appscan set-application <app-id> --description "Updated" --jiraproject "SEC"`
  )
  .action(setApplication);

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
  .option('--by-fixgroup', 'Group issues by FixGroup')
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
  $ appscan issues <scanId> --by-fixgroup
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
  .option('--by-fixgroup', 'Group issues by FixGroup')
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
  $ appscan app-issues <appId> --by-fixgroup
  $ appscan app-issues <appId> --active --high
  $ appscan app-issues <appId> --pending --unassigned`
  )
  .action(listIssuesByApp);

program
  .command('list-fixgroups')
  .alias('fixgroups')
  .description('List FixGroups for an application')
  .argument('<appId>', 'Application ID')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .option(
    '--status <status>',
    'Filter by status (Open, InProgress, Fixed, Passed, Noise, etc.)'
  )
  .option(
    '--severity <severity>',
    'Filter by severity (Critical, High, Medium, Low, Informational)'
  )
  .option('--filter <odata>', 'Custom OData filter expression')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-fixgroups <appId>
  $ appscan fixgroups <appId> --json
  $ appscan fixgroups <appId> --status Open
  $ appscan fixgroups <appId> --severity High
  $ appscan fixgroups <appId> --status Open --severity Critical
  $ appscan fixgroups <appId> --filter "NIssues gt 5"`
  )
  .action(listFixGroups);

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

// ========== Azure DevOps Commands ==========

program
  .command('get-azdo-organization')
  .alias('azdo-org')
  .description('Get Azure DevOps organization details')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-azdo-organization
  $ appscan azdo-org --json`
  )
  .action(getAzdoOrganization);

program
  .command('list-azdo-applications')
  .alias('azdo-apps')
  .description('List all Azure DevOps projects (applications)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-azdo-applications
  $ appscan azdo-apps --json`
  )
  .action(listAzdoApplications);

program
  .command('get-azdo-application')
  .alias('azdo-app')
  .description(
    'Get detailed information about an Azure DevOps project (application)'
  )
  .argument('<appId>', 'Project ID or name')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-azdo-application <project-id>
  $ appscan azdo-app "MyProject" --json`
  )
  .action(getAzdoApplication);

program
  .command('list-azdo-repositories')
  .alias('azdo-repos')
  .description('List repositories in an Azure DevOps project')
  .option('--appId <value>', 'Project ID or name (required)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-azdo-repositories --appId <project-id>
  $ appscan azdo-repos --appId "MyProject" --json`
  )
  .action(listAzdoRepositories);

program
  .command('get-azdo-repository')
  .alias('azdo-repo')
  .description('Get detailed information about an Azure DevOps repository')
  .option('--appId <value>', 'Project ID or name (required)')
  .option('--repositoryId <value>', 'Repository ID or name (required)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-azdo-repository --appId <project-id> --repositoryId <repo-id>
  $ appscan azdo-repo --appId "MyProject" --repositoryId "MyRepo" --json`
  )
  .action(getAzdoRepository);

program
  .command('list-azdo-issues')
  .alias('azdo-issues')
  .description('List alerts (issues) in an Azure DevOps repository')
  .option('--appId <value>', 'Project ID or name (required)')
  .option('--repositoryId <value>', 'Repository ID or name (required)')
  .option(
    '--type <value>',
    'Filter by alert type: unknown, dependency, secret, code, license'
  )
  .option(
    '--severity <value>',
    'Filter by severity: low, medium, high, critical, note, warning, error, undefined'
  )
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-azdo-issues --appId <project-id> --repositoryId <repo-id>
  $ appscan azdo-issues --appId "MyProject" --repositoryId "MyRepo" --type secret
  $ appscan azdo-issues --appId "MyProject" --repositoryId "MyRepo" --severity high --json`
  )
  .action(listAzdoIssues);

program
  .command('list-azdo-issues-by-app')
  .alias('azdo-app-issues')
  .description(
    'List alerts (issues) for all repositories in an Azure DevOps project'
  )
  .option('--appId <value>', 'Project ID or name (required)')
  .option(
    '--type <value>',
    'Filter by alert type: unknown, dependency, secret, code, license'
  )
  .option(
    '--severity <value>',
    'Filter by severity: low, medium, high, critical, note, warning, error, undefined'
  )
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-azdo-issues-by-app --appId <project-id>
  $ appscan azdo-app-issues --appId "MyProject" --type secret
  $ appscan azdo-app-issues --appId "MyProject" --severity high --json`
  )
  .action(listAzdoIssuesByApp);

program
  .command('get-azdo-issue-detail')
  .alias('azdo-issue')
  .description(
    'Get detailed information about a specific Azure DevOps alert (issue)'
  )
  .option('--appId <value>', 'Project ID or name (required)')
  .option('--repositoryId <value>', 'Repository ID or name (required)')
  .option('--issueId <value>', 'Alert ID (required)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-azdo-issue-detail --appId <project-id> --repositoryId <repo-id> --issueId 123
  $ appscan azdo-issue --appId "MyProject" --repositoryId "MyRepo" --issueId 123 --json`
  )
  .action(getAzdoIssueDetail);

program
  .command('update-azdo-issue')
  .alias('azdo-update')
  .description('Update an Azure DevOps alert (issue) status')
  .option('--appId <value>', 'Project ID or name (required)')
  .option('--repositoryId <value>', 'Repository ID or name (required)')
  .option('--issueId <value>', 'Alert ID (required)')
  .option('--status <value>', 'New state (Active, Dismissed, Fixed)')
  .option(
    '--reason <value>',
    'Dismissal reason (Fixed, AcceptedRisk, FalsePositive, AgreedToGuidance, ToolUpgrade)'
  )
  .option('--comment <value>', 'Comment for dismissal/closure')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan update-azdo-issue --appId <project-id> --repositoryId <repo-id> --issueId 123 --status Fixed
  $ appscan azdo-update --appId "MyProject" --repositoryId "MyRepo" --issueId 123 --status Dismissed --reason FalsePositive --comment "Not a real vulnerability"
  $ appscan azdo-update --appId "MyProject" --repositoryId "MyRepo" --issueId 123 --status Dismissed --reason AcceptedRisk --comment "Known issue, accepting risk"
  $ appscan azdo-update --appId "MyProject" --repositoryId "MyRepo" --issueId 123 --status Active --json`
  )
  .action(updateAzdoIssue);

program
  .command('search-azdo-code')
  .alias('azdo-search')
  .description('Search code across Azure DevOps repositories')
  .argument('<searchText>', 'The text to search for')
  .option('--appId <value>', 'Filter by project ID or name')
  .option('--repositoryId <value>', 'Filter by repository ID or name')
  .option('--path <value>', 'Filter by file path')
  .option('--branch <value>', 'Filter by branch name')
  .option('--top <value>', 'Number of results to return (default: 50)')
  .option('--skip <value>', 'Number of results to skip (for pagination)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan search-azdo-code "password"
  $ appscan azdo-search "TODO:" --appId "MyProject"
  $ appscan azdo-search "connectionString" --appId "MyProject" --repositoryId "MyRepo" --json
  $ appscan azdo-search "api_key" --top 100 --skip 50`
  )
  .action(searchAzdoCode);

program
  .command('list-azdo-secrets')
  .alias('azdo-secrets')
  .description(
    'List all secret alerts across Azure DevOps projects and repositories'
  )
  .option('--appId <value>', 'Filter by project ID or name')
  .option(
    '--repositoryId <value>',
    'Filter by repository ID (requires --appId)'
  )
  .option('--include-fixed', 'Include fixed alerts')
  .option('--include-dismissed', 'Include dismissed alerts')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-azdo-secrets
  $ appscan azdo-secrets --appId "MyProject"
  $ appscan azdo-secrets --appId "MyProject" --repositoryId "MyRepo"
  $ appscan azdo-secrets --include-fixed --include-dismissed --json`
  )
  .action(listAzdoSecrets);

// ========== Detectify Commands ==========

program
  .command('list-detectify-issues')
  .alias('detectify-issues')
  .description('List vulnerabilities from Detectify')
  .option('--status <value>', 'Filter by status (comma-separated: active,new,patched,regression,accepted_risk,false_positive)')
  .option('--severity <value>', 'Filter by severity (comma-separated: information,low,medium,high,critical)')
  .option('--host <value>', 'Filter by host (comma-separated)')
  .option('--assetToken <value>', 'Filter by asset token (comma-separated)')
  .option('--limit <number>', 'Limit number of results (default: 100)', parseInt)
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan list-detectify-issues
  $ appscan detectify-issues --status active,new
  $ appscan detectify-issues --severity high,critical
  $ appscan detectify-issues --host "example.com" --json
  $ appscan detectify-issues --limit 50`
  )
  .action(listDetectifyIssues);

program
  .command('get-detectify-issue')
  .alias('detectify-issue')
  .description('Get detailed information about a Detectify vulnerability')
  .option('--uuid <value>', 'Vulnerability UUID (required)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan get-detectify-issue --uuid <vulnerability-uuid>
  $ appscan detectify-issue --uuid <vulnerability-uuid> --json`
  )
  .action(getDetectifyIssueDetail);

program
  .command('update-detectify-issue')
  .alias('detectify-update')
  .description('Update a Detectify vulnerability status')
  .option('--uuid <value>', 'Vulnerability UUID (required)')
  .option('--status <value>', 'New status: accepted_risk, false_positive, patched/fixed, or active (to revert)')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-j, --json', 'Output as JSON')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan update-detectify-issue --uuid <uuid> --status accepted_risk
  $ appscan detectify-update --uuid <uuid> --status false_positive
  $ appscan detectify-update --uuid <uuid> --status patched
  $ appscan detectify-update --uuid <uuid> --status active  # Reverts to active state
  $ appscan detectify-update --uuid <uuid> --status accepted_risk --json`
  )
  .action(updateDetectifyIssue);

// TUI Launchers
program
  .command('asoc')
  .description('Launch interactive TUI for AppScan on Cloud')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan asoc`
  )
  .action(async () => {
    const { launchTUI } = await import('../tui/asoc-entry.js');
    await launchTUI({ config: null });
  });

program
  .command('azdo')
  .description('Launch interactive TUI for Azure DevOps')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan azdo`
  )
  .action(async () => {
    const { launchAzdoTUI } = await import('../tui/azdo-entry.js');
    await launchAzdoTUI({ config: null });
  });

program
  .command('detectify')
  .description('Launch interactive TUI for Detectify')
  .addHelpText(
    'after',
    `
Examples:
  $ appscan detectify`
  )
  .action(async () => {
    const { launchDetectifyTUI } = await import('../tui/detectify-entry.js');
    await launchDetectifyTUI({ config: null });
  });

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
