import chalk from 'chalk';
import { AppScanService } from '../../services/appscan-service.js';
import { JiraService } from '../../services/jira-service.js';
import { Config } from '../../utils/config.js';
import * as AppScanUrls from '../../utils/appscan-urls.js';

const severityOrder = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Informational: 1,
  Unknown: 0,
};

export async function createJiraIssue(source, sourceId, options) {
  try {
    // Check if jira.js is available
    try {
      await import('jira.js');
    } catch {
      throw new Error(
        'jira.js package is not installed. To use Jira integration features, install it with:\n' +
          '  npm install -g jira.js@^5.2.2\n' +
          'Or if using as a library, add it to your dependencies.'
      );
    }

    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();

    // Validate configurations
    if (!config.isValid()) {
      throw new Error(
        'AppScan API credentials not configured. Please set APPSCAN_API_KEY and APPSCAN_API_SECRET environment variables.'
      );
    }

    if (!config.isJiraValid()) {
      throw new Error(
        'Jira credentials not configured. Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.'
      );
    }

    const appScanService = new AppScanService(config);
    const jiraService = new JiraService(config);

    console.error(chalk.blue('Authenticating with AppScan...'));
    await appScanService.authenticate();

    console.error(chalk.blue('Initializing Jira client...'));
    jiraService.initialize();

    // Get the project key from config or options
    const projectKey = options.project || config.getJiraProjectKey();
    if (!projectKey) {
      throw new Error(
        'Jira project key not specified. Use --project option or set JIRA_PROJECT_KEY environment variable.'
      );
    }

    // Validate Jira project
    console.error(chalk.blue(`Validating Jira project: ${projectKey}...`));
    await jiraService.getProject(projectKey);

    // Parse minimum severity
    const minSeverityValue = parseInt(options.minSeverity || '0', 10);

    let issues = [];
    let scanInfo = null;

    if (source === 'scan') {
      // Get issues from scan
      console.error(chalk.blue(`Fetching issues from scan ${sourceId}...`));
      const excludeStatus = options.excludeStatus || 'Noise';
      const response = await appScanService.listIssues(sourceId, excludeStatus);
      issues = response.Items || [];

      // Get scan details for context
      const scanDetails = await appScanService.getScanDetails(sourceId);
      scanInfo = scanDetails.Items?.[0] || { Id: sourceId };
    } else if (source === 'issue') {
      // Get single issue
      console.error(chalk.blue(`Fetching issue ${sourceId}...`));
      const issue = await appScanService.api.v4.Issues_GetIssue(sourceId, {});
      if (!issue) {
        throw new Error(`Issue not found: ${sourceId}`);
      }
      issues = [issue];
    } else {
      throw new Error(`Invalid source: ${source}. Must be 'scan' or 'issue'`);
    }

    // Filter by severity
    const filteredIssues = issues.filter((issue) => {
      const severityValue = severityOrder[issue.Severity] || 0;
      return severityValue >= minSeverityValue;
    });

    if (filteredIssues.length === 0) {
      console.error(
        chalk.yellow(
          `No issues found matching the criteria (min severity: ${minSeverityValue})`
        )
      );
      return;
    }

    console.error(
      chalk.green(
        `\nFound ${filteredIssues.length} issue(s) matching the criteria`
      )
    );

    const createdJiraIssues = [];

    // Create Jira issue(s)
    for (const issue of filteredIssues) {
      const summary = `[AppScan] ${issue.IssueType || 'Security Issue'} - ${issue.Severity || 'Unknown'} Severity`;

      let description = `AppScan Security Issue\n\n`;
      description += `Issue ID: ${issue.Id}\n`;
      description += `Severity: ${issue.Severity || 'Unknown'}\n`;
      description += `Issue Type: ${issue.IssueType || 'N/A'}\n`;
      description += `Status: ${issue.Status || 'N/A'}\n`;
      description += `Scanner: ${issue.Scanner || 'N/A'}\n`;

      if (issue.Location) {
        description += `Location: ${issue.Location}\n`;
      }

      if (issue.SourceFileUri) {
        description += `Source File: ${issue.SourceFileUri}\n`;
      }

      if (issue.ThreatClassId) {
        description += `Threat Class: ${issue.ThreatClassId}\n`;
      }

      if (scanInfo) {
        description += `\nScan ID: ${scanInfo.Id}\n`;
        if (scanInfo.Name) {
          description += `Scan Name: ${scanInfo.Name}\n`;
        }
      }

      description += `\nAppScan Cloud URL: ${config.getBaseUrl()}/issues/${issue.Id}`;

      const issueType = options.issueType || 'Bug';
      const labels = options.labels
        ? options.labels.split(',').map((l) => l.trim())
        : ['appscan', 'security'];

      // Note: Priority field is not set as different Jira instances have different priority schemes
      // Users can set priority manually in Jira if needed

      console.error(
        chalk.blue(`Creating Jira issue for AppScan issue ${issue.Id}...`)
      );

      const jiraIssue = await jiraService.createIssue(
        projectKey,
        summary,
        description,
        issueType,
        {
          labels: labels,
        }
      );

      createdJiraIssues.push({
        appScanIssueId: issue.Id,
        jiraIssueKey: jiraIssue.key,
        jiraIssueId: jiraIssue.id,
      });

      console.error(
        chalk.green(
          `  ✓ Created Jira issue: ${jiraIssue.key} (${AppScanUrls.getJiraUrl(config.getJiraHost(), jiraIssue.key)})`
        )
      );
    }

    if (options.json) {
      console.log(JSON.stringify(createdJiraIssues, null, 2));
    } else {
      console.error(
        chalk.green(
          `\n✓ Successfully created ${createdJiraIssues.length} Jira issue(s)`
        )
      );
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

export default createJiraIssue;
