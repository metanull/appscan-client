import { Command } from 'commander';
import chalk from 'chalk';
import { AppScanService } from '../services/appscan-service.js';
import { JiraService } from '../services/jira-service.js';
import { Config } from '../utils/config.js';
import { QueryBuilder } from '../utils/query-builder.js';
import { FilterParser } from '../utils/filter-parser.js';
import { Formatter } from '../utils/formatter.js';
import { JiraDescriptionBuilder } from '../utils/jira-description-builder.js';
import { select, checkbox, input } from '@inquirer/prompts';
import {
  groupIssuesByType,
  displayGroupedSummary,
  formatScanDisplay,
  ISSUE_STATUSES
} from '../utils/triage-ui.js';

/**
 * Create the triage-report command with all subcommands
 */
export function createTriageReportCommand() {
  const command = new Command('triage-report')
    .description('Comprehensive triage, reporting, and Jira integration tool');

  // Query subcommand
  command
    .command('query')
    .description('Query applications, scans, vulnerabilities, and articles')
    .requiredOption('--type <type>', 'Query type: applications, scans, scan-executions, vulnerabilities, articles')
    .option('--app <appId>', 'Application ID (for scans, scan-executions, vulnerabilities)')
    .option('--scan <scanId>', 'Scan ID (for scan-executions, vulnerabilities)')
    .option('--issue <issueId>', 'Issue ID (for articles)')
    .option('--scan-type <type>', 'Filter by scan type: SAST, DAST, SCA, IAST, IAC')
    .option('--filter <expr>', 'Filter expression (e.g., "status:Open;severity:High")')
    .option('--limit <n>', 'Maximum number of results', '100')
    .option('--offset <n>', 'Number of results to skip', '0')
    .option('--json', 'Output as JSON (default: true)', true)
    .option('--table', 'Output as table')
    .option('--markdown', 'Convert articles to Markdown (for articles type)')
    .option('-c, --config <path>', 'Path to configuration file')
    .action(queryAction);

  // Status subcommand
  command
    .command('status')
    .description('Generate status report for an application or scan')
    .option('--app <appId>', 'Application ID')
    .option('--scan <scanId>', 'Scan ID')
    .option('--include-jira', 'Include Jira status information')
    .option('--json', 'Output as JSON', true)
    .option('--table', 'Output as table')
    .option('-c, --config <path>', 'Path to configuration file')
    .action(statusAction);

  // Summary subcommand
  command
    .command('summary')
    .description('Generate high-level summary for an application')
    .requiredOption('--app <appId>', 'Application ID')
    .option('--json', 'Output as JSON', true)
    .option('-c, --config <path>', 'Path to configuration file')
    .action(summaryAction);

  // Update subcommand
  command
    .command('update')
    .description('Update a single vulnerability')
    .requiredOption('--issue <issueId>', 'Issue ID')
    .requiredOption('--status <status>', 'New status: Open, InProgress, Noise, Passed, Fixed')
    .option('--comment <text>', 'Add a comment')
    .option('--external-id <id>', 'Set external ID (e.g., Jira key)')
    .option('--json', 'Output as JSON', true)
    .option('-c, --config <path>', 'Path to configuration file')
    .action(updateAction);

  // Bulk update subcommand
  command
    .command('bulk-update')
    .description('Update multiple specific vulnerabilities')
    .requiredOption('--issues <ids>', 'Comma-separated issue IDs')
    .requiredOption('--status <status>', 'New status: Open, InProgress, Noise, Passed, Fixed')
    .option('--comment <text>', 'Add a comment')
    .option('--external-id <id>', 'Set external ID (e.g., Jira key)')
    .option('--json', 'Output as JSON', true)
    .option('-c, --config <path>', 'Path to configuration file')
    .action(bulkUpdateAction);

  // Bulk update filter subcommand
  command
    .command('bulk-update-filter')
    .description('Update vulnerabilities matching a filter')
    .requiredOption('--app <appId>', 'Application ID')
    .requiredOption('--filter <expr>', 'Filter expression')
    .requiredOption('--status <status>', 'New status: Open, InProgress, Noise, Passed, Fixed')
    .option('--comment <text>', 'Add a comment')
    .option('--external-id <id>', 'Set external ID (e.g., Jira key)')
    .option('--json', 'Output as JSON', true)
    .option('-c, --config <path>', 'Path to configuration file')
    .action(bulkUpdateFilterAction);

  // Create Jira subcommand
  command
    .command('create-jira')
    .description('Create Jira issues for vulnerabilities')
    .requiredOption('--issues <ids>', 'Comma-separated issue IDs')
    .requiredOption('--project <key>', 'Jira project key')
    .option('--group-by <strategy>', 'Grouping strategy: type, severity, none', 'type')
    .option('--issue-type <type>', 'Jira issue type', 'Bug')
    .option('--labels <labels>', 'Comma-separated labels', 'appscan,security')
    .option('--dry-run', 'Show what would be created without creating')
    .option('--json', 'Output as JSON', true)
    .option('-c, --config <path>', 'Path to configuration file')
    .action(createJiraAction);

  // Find Jira subcommand
  command
    .command('find-jira')
    .description('Find Jira issues linked to AppScan vulnerability')
    .requiredOption('--issue <issueId>', 'Issue ID')
    .option('--json', 'Output as JSON', true)
    .option('-c, --config <path>', 'Path to configuration file')
    .action(findJiraAction);

  // Link Jira subcommand
  command
    .command('link-jira')
    .description('Manually link Jira issue to AppScan vulnerability')
    .requiredOption('--issue <issueId>', 'Issue ID')
    .requiredOption('--jira-key <key>', 'Jira issue key (e.g., SEC-123)')
    .option('--json', 'Output as JSON', true)
    .option('-c, --config <path>', 'Path to configuration file')
    .action(linkJiraAction);

  // Interactive subcommand
  command
    .command('interactive')
    .description('Interactive guided triage workflow')
    .option('--app <appId>', 'Pre-select application')
    .option('--scan-type <type>', 'Filter by scan type: SAST, DAST, SCA, IAST, IAC')
    .option('-c, --config <path>', 'Path to configuration file')
    .action(interactiveAction);

  return command;
}

/**
 * Query action - handle query subcommand
 */
async function queryAction(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);
    const formatter = new Formatter(config.getBaseUrl());

    await service.authenticate();

    const queryType = options.type.toLowerCase();
    let result;

    switch (queryType) {
      case 'applications':
        result = await queryApplications(service, formatter, options);
        break;
      case 'scans':
        result = await queryScans(service, formatter, options);
        break;
      case 'scan-executions':
        result = await queryScanExecutions(service, formatter, options);
        break;
      case 'vulnerabilities':
        result = await queryVulnerabilities(service, formatter, options);
        break;
      case 'articles':
        result = await queryArticles(service, formatter, options);
        break;
      default:
        throw new Error(`Unknown query type: ${options.type}`);
    }

    outputResult(result, options);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Query applications
 */
async function queryApplications(service, formatter, options) {
  const response = await service.listApplications();
  const apps = response.Items || response || [];
  
  let filtered = apps;
  
  // Apply filter if provided
  if (options.filter) {
    const filterLower = options.filter.toLowerCase();
    filtered = apps.filter(app => {
      if (filterLower.includes('name:')) {
        const nameMatch = filterLower.match(/name:([^;|]+)/);
        if (nameMatch) {
          const name = nameMatch[1].trim();
          return app.Name.toLowerCase().includes(name);
        }
      }
      return true;
    });
  }

  return {
    applications: filtered.map(app => formatter.formatApplication(app)),
    total: filtered.length
  };
}

/**
 * Query scans
 */
async function queryScans(service, formatter, options) {
  const response = await service.listScans(options.app);
  const scans = response.Items || response || [];
  
  let filtered = scans;
  
  // Filter by scan type if provided
  if (options.scanType) {
    const normalizedType = options.scanType.toUpperCase();
    filtered = scans.filter(scan => {
      const scanType = Formatter.normalizeScanType(scan.Technology);
      return scanType === normalizedType;
    });
  }
  
  // Apply additional filters
  if (options.filter) {
    const filterLower = options.filter.toLowerCase();
    filtered = filtered.filter(scan => {
      if (filterLower.includes('name:')) {
        const nameMatch = filterLower.match(/name:([^;|]+)/);
        if (nameMatch) {
          const name = nameMatch[1].trim();
          return scan.Name.toLowerCase().includes(name);
        }
      }
      return true;
    });
  }

  return {
    scans: filtered.map(scan => formatter.formatScan(scan)),
    total: filtered.length
  };
}

/**
 * Query scan executions
 */
async function queryScanExecutions(service, formatter, options) {
  if (!options.scan) {
    throw new Error('--scan option is required for scan-executions query');
  }

  const response = await service.listScanExecutions(options.scan);
  const executions = response.Items || response || [];
  
  return {
    scanId: options.scan,
    executions: executions.map(exec => formatter.formatExecution(exec)),
    total: executions.length
  };
}

/**
 * Query vulnerabilities
 */
async function queryVulnerabilities(service, formatter, options) {
  if (!options.app && !options.scan) {
    throw new Error('Either --app or --scan option is required for vulnerabilities query');
  }

  const scope = options.scan ? 'Scan' : 'Application';
  const scopeId = options.scan || options.app;

  // Build query with filters
  const queryBuilder = new QueryBuilder();
  if (options.filter) {
    FilterParser.parse(options.filter, queryBuilder);
  }

  const odataFilter = queryBuilder.toODataFilter();
  const queryParams = {};
  if (odataFilter) {
    queryParams.$filter = odataFilter;
  }

  const response = await service.api.v4.Issues_Get(scope, scopeId, queryParams);
  const issues = response.Items || [];

  return {
    vulnerabilities: issues.map(issue => formatter.formatVulnerability(issue)),
    total: issues.length,
    filtered: issues.length
  };
}

/**
 * Query articles
 */
async function queryArticles(service, formatter, options) {
  if (!options.issue) {
    throw new Error('--issue option is required for articles query');
  }

  // Get issue details to find IssueTypeId
  const issueResponse = await service.api.v4.Issues_Get('Application', '*', {
    $filter: `Id eq ${options.issue}`
  });
  
  if (!issueResponse.Items || issueResponse.Items.length === 0) {
    throw new Error(`Issue not found: ${options.issue}`);
  }

  const issue = issueResponse.Items[0];
  const issueTypeId = issue.IssueTypeId;

  if (!issueTypeId) {
    throw new Error('Issue does not have an IssueTypeId');
  }

  // Fetch article HTML
  const articleUrl = `/api/v4/Reports/Article/?issuetype=${issueTypeId}`;
  const articleHtml = await service.api.request({
    method: 'GET',
    url: articleUrl,
  });

  const baseResult = {
    issueId: options.issue,
    issueTypeId: issueTypeId,
    issueType: issue.IssueType,
    appScanUrl: `${formatter.baseUrl}/api/v4/Reports/Article/?issuetype=${issueTypeId}`,
    fullHtml: articleHtml.data
  };

  // Convert to Markdown if requested
  if (options.markdown) {
    const TurndownService = (await import('turndown')).default;
    const turndown = new TurndownService();
    return {
      ...baseResult,
      markdownVersion: turndown.turndown(articleHtml.data)
    };
  }

  return baseResult;
}

/**
 * Status action - generate status report
 */
async function statusAction(options) {
  try {
    if (!options.app && !options.scan) {
      throw new Error('Either --app or --scan option is required');
    }

    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);
    const formatter = new Formatter(config.getBaseUrl());

    await service.authenticate();

    const scope = options.scan ? 'Scan' : 'Application';
    const scopeId = options.scan || options.app;

    // Fetch all issues
    const response = await service.api.v4.Issues_Get(scope, scopeId, {});
    const issues = response.Items || [];

    // Calculate statistics
    const report = {
      total: issues.length,
      byStatus: {},
      bySeverity: {},
      bySeverityAndStatus: {}
    };

    // Count by status
    for (const issue of issues) {
      const status = issue.Status || 'Unknown';
      report.byStatus[status] = (report.byStatus[status] || 0) + 1;
    }

    // Count by severity
    for (const issue of issues) {
      const severity = issue.Severity || 'Unknown';
      report.bySeverity[severity] = (report.bySeverity[severity] || 0) + 1;
    }

    // Count by severity and status
    const severities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
    const statuses = ['Open', 'InProgress', 'Noise', 'Passed', 'Fixed'];
    
    for (const severity of severities) {
      report.bySeverityAndStatus[severity] = {};
      for (const status of statuses) {
        const count = issues.filter(i => i.Severity === severity && i.Status === status).length;
        report.bySeverityAndStatus[severity][status] = count;
      }
    }

    // Add Jira info if requested
    if (options.includeJira && config.isJiraValid()) {
      const jiraService = new JiraService(config);
      jiraService.initialize();
      
      const issuesWithJira = issues.filter(i => i.ExternalId);
      report.vulnerabilitiesWithJira = issuesWithJira.length;
      report.jiraStatuses = {};

      // Would need to fetch Jira status for each, but that's expensive
      // For now, just count issues with Jira links
    }

    const result = {
      entityType: options.scan ? 'scan' : 'application',
      entityId: scopeId,
      report: report,
      vulnerabilities: issues.slice(0, 20).map(issue => ({
        id: issue.Id,
        issueType: issue.IssueType,
        severity: issue.Severity,
        status: issue.Status,
        jiraKey: issue.ExternalId || null,
        remediationUrl: issue.IssueTypeId 
          ? `${formatter.baseUrl}/api/v4/Reports/Article/?issuetype=${issue.IssueTypeId}`
          : null
      }))
    };

    outputResult(result, options);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Summary action - generate application summary
 */
async function summaryAction(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    await service.authenticate();

    // Get application details
    const apps = await service.listApplications();
    const app = apps.find(a => a.Id === options.app);
    
    if (!app) {
      throw new Error(`Application not found: ${options.app}`);
    }

    // Get scans for this app
    const scans = await service.listScans(options.app);

    const result = {
      app: {
        id: app.Id,
        name: app.Name,
        totalIssues: app.TotalIssues || 0,
        openIssues: app.OpenIssues || 0,
        // Add other counts as available from API
      },
      scans: scans.map(scan => ({
        id: scan.Id,
        name: scan.Name,
        scanType: Formatter.normalizeScanType(scan.Technology),
        totalIssues: scan.LatestExecution?.NIssuesFound || 0
      }))
    };

    outputResult(result, options);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Update action - update single vulnerability
 */
async function updateAction(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    await service.authenticate();

    // Validate status
    const validStatuses = ['Open', 'InProgress', 'Noise', 'Passed', 'Fixed'];
    if (!validStatuses.includes(options.status)) {
      throw new Error(`Invalid status: ${options.status}. Valid: ${validStatuses.join(', ')}`);
    }

    // Get issue to find its application
    const issueResponse = await service.api.v4.Issues_Get('Application', '*', {
      $filter: `Id eq ${options.issue}`
    });
    
    if (!issueResponse.Items || issueResponse.Items.length === 0) {
      throw new Error(`Issue not found: ${options.issue}`);
    }

    const issue = issueResponse.Items[0];
    const appId = issue.ApplicationId;

    // Build update payload
    const updateData = { Status: options.status };
    if (options.comment) updateData.Comment = options.comment;
    if (options.externalId) updateData.ExternalId = options.externalId;

    // Update via filtered update API
    await service.api.v4.Issues_UpdateFilteredIssues(
      'Application',
      appId,
      updateData,
      { $filter: `Id eq ${options.issue}` }
    );

    const result = {
      success: true,
      message: 'Issue updated successfully',
      issueId: options.issue,
      newStatus: options.status,
      commentAdded: !!options.comment,
      externalIdSet: !!options.externalId
    };

    outputResult(result, options);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Bulk update action - update multiple specific vulnerabilities
 */
async function bulkUpdateAction(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    await service.authenticate();

    // Validate status
    const validStatuses = ['Open', 'InProgress', 'Noise', 'Passed', 'Fixed'];
    if (!validStatuses.includes(options.status)) {
      throw new Error(`Invalid status: ${options.status}. Valid: ${validStatuses.join(', ')}`);
    }

    // Parse issue IDs
    const issueIds = options.issues.split(',').map(id => id.trim()).filter(Boolean);
    
    if (issueIds.length === 0) {
      throw new Error('No issue IDs provided');
    }

    // Fetch all issues to group by application
    const issuesByApp = {};
    
    for (const issueId of issueIds) {
      const issueResponse = await service.api.v4.Issues_Get('Application', '*', {
        $filter: `Id eq ${issueId}`
      });
      
      if (issueResponse.Items && issueResponse.Items.length > 0) {
        const issue = issueResponse.Items[0];
        const appId = issue.ApplicationId;
        
        if (!issuesByApp[appId]) {
          issuesByApp[appId] = [];
        }
        issuesByApp[appId].push(issueId);
      }
    }

    // Update each application's issues
    const results = [];
    const updateData = { Status: options.status };
    if (options.comment) updateData.Comment = options.comment;
    if (options.externalId) updateData.ExternalId = options.externalId;

    for (const [appId, appIssueIds] of Object.entries(issuesByApp)) {
      const odataFilter = appIssueIds.map(id => `Id eq ${id}`).join(' or ');
      
      await service.api.v4.Issues_UpdateFilteredIssues(
        'Application',
        appId,
        updateData,
        { $filter: odataFilter }
      );

      results.push({
        applicationId: appId,
        issuesUpdated: appIssueIds.length,
        status: 'success'
      });
    }

    const result = {
      success: true,
      totalRequests: results.length,
      results: results,
      totalIssuesUpdated: issueIds.length
    };

    outputResult(result, options);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Bulk update filter action - update vulnerabilities matching filter
 */
async function bulkUpdateFilterAction(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    await service.authenticate();

    // Validate status
    const validStatuses = ['Open', 'InProgress', 'Noise', 'Passed', 'Fixed'];
    if (!validStatuses.includes(options.status)) {
      throw new Error(`Invalid status: ${options.status}. Valid: ${validStatuses.join(', ')}`);
    }

    // Build filter
    const queryBuilder = new QueryBuilder();
    FilterParser.parse(options.filter, queryBuilder);
    const odataFilter = queryBuilder.toODataFilter();

    if (!odataFilter) {
      throw new Error('No valid filter provided');
    }

    // Build update payload
    const updateData = { Status: options.status };
    if (options.comment) updateData.Comment = options.comment;
    if (options.externalId) updateData.ExternalId = options.externalId;

    // Update via filtered update API
    const result = await service.api.v4.Issues_UpdateFilteredIssues(
      'Application',
      options.app,
      updateData,
      { $filter: odataFilter }
    );

    const response = {
      success: true,
      applicationId: options.app,
      issuesUpdated: result.UpdatedIssues || 0,
      filter: options.filter
    };

    outputResult(response, options);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Create Jira action - create Jira issues for vulnerabilities
 */
async function createJiraAction(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);
    const jiraService = new JiraService(config);

    await service.authenticate();
    jiraService.initialize();

    // Parse issue IDs
    const issueIds = options.issues.split(',').map(id => id.trim()).filter(Boolean);
    
    if (issueIds.length === 0) {
      throw new Error('No issue IDs provided');
    }

    // Fetch all issues
    const issues = [];
    for (const issueId of issueIds) {
      const issueResponse = await service.api.v4.Issues_Get('Application', '*', {
        $filter: `Id eq ${issueId}`
      });
      
      if (issueResponse.Items && issueResponse.Items.length > 0) {
        issues.push(issueResponse.Items[0]);
      }
    }

    if (issues.length === 0) {
      throw new Error('No issues found');
    }

    // Group issues based on strategy
    const groups = groupIssuesForJira(issues, options.groupBy);

    const jiraIssuesCreated = [];
    const labels = options.labels ? options.labels.split(',').map(l => l.trim()) : [];

    for (const group of groups) {
      // Build Jira description
      const builder = new JiraDescriptionBuilder(group.issues, config.getBaseUrl());
      const description = builder
        .addSummary(null, null)
        .addIssuesByType()
        .addIssueIds()
        .build();

      // Create summary
      const summary = `[Security] ${group.name} - ${group.issues.length} occurrence(s)`;

      if (options.dryRun) {
        console.log(chalk.cyan('\nWould create Jira issue:'));
        console.log(chalk.white(`  Summary: ${summary}`));
        console.log(chalk.white(`  Description length: ${description.length} bytes`));
        console.log(chalk.white(`  Issues: ${group.issues.map(i => i.Id).join(', ')}`));
        continue;
      }

      // Create Jira issue
      const jiraIssue = await jiraService.client.issues.createIssue({
        fields: {
          project: { key: options.project },
          summary: summary,
          description: jiraService.convertToADF(description),
          issuetype: { name: options.issueType },
          labels: labels
        }
      });

      const jiraKey = jiraIssue.key;
      const jiraUrl = `${config.getJiraHost()}/browse/${jiraKey}`;

      // Update AppScan issues with Jira link
      for (const issue of group.issues) {
        const appId = issue.ApplicationId;
        await service.api.v4.Issues_UpdateFilteredIssues(
          'Application',
          appId,
          { ExternalId: jiraKey },
          { $filter: `Id eq ${issue.Id}` }
        );
      }

      jiraIssuesCreated.push({
        appScanIssues: group.issues.map(i => i.Id),
        jiraKey: jiraKey,
        jiraUrl: jiraUrl,
        summary: summary
      });
    }

    const result = {
      success: true,
      jiraIssuesCreated: jiraIssuesCreated,
      totalIssuesCreated: jiraIssuesCreated.length
    };

    outputResult(result, options);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Find Jira action - find Jira issues linked to vulnerability
 */
async function findJiraAction(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);
    const jiraService = new JiraService(config);

    await service.authenticate();
    jiraService.initialize();

    // Get issue details
    const issueResponse = await service.api.v4.Issues_Get('Application', '*', {
      $filter: `Id eq ${options.issue}`
    });
    
    if (!issueResponse.Items || issueResponse.Items.length === 0) {
      throw new Error(`Issue not found: ${options.issue}`);
    }

    const issue = issueResponse.Items[0];
    const externalId = issue.ExternalId;

    const jiraIssues = [];

    if (externalId) {
      // Fetch Jira issue by key
      try {
        const jiraIssue = await jiraService.client.issues.getIssue({ issueIdOrKey: externalId });
        jiraIssues.push({
          key: jiraIssue.key,
          summary: jiraIssue.fields.summary,
          status: jiraIssue.fields.status.name,
          url: `${config.getJiraHost()}/browse/${jiraIssue.key}`
        });
      } catch (error) {
        // Jira issue not found or invalid key - this is not a fatal error
        console.warn(`Could not fetch Jira issue ${externalId}:`, error.message);
      }
    }

    const result = {
      appScanIssueId: options.issue,
      externalId: externalId || null,
      jiraIssues: jiraIssues
    };

    outputResult(result, options);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Link Jira action - manually link Jira issue to vulnerability
 */
async function linkJiraAction(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    await service.authenticate();

    // Get issue to find its application
    const issueResponse = await service.api.v4.Issues_Get('Application', '*', {
      $filter: `Id eq ${options.issue}`
    });
    
    if (!issueResponse.Items || issueResponse.Items.length === 0) {
      throw new Error(`Issue not found: ${options.issue}`);
    }

    const issue = issueResponse.Items[0];
    const appId = issue.ApplicationId;

    // Update with Jira key
    await service.api.v4.Issues_UpdateFilteredIssues(
      'Application',
      appId,
      { ExternalId: options.jiraKey },
      { $filter: `Id eq ${options.issue}` }
    );

    const result = {
      success: true,
      message: 'Jira issue linked successfully',
      issueId: options.issue,
      jiraKey: options.jiraKey
    };

    outputResult(result, options);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Interactive action - interactive guided triage workflow
 */
async function interactiveAction(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    await service.authenticate();

    console.log(chalk.cyan('\n=== Interactive Triage Workflow ===\n'));

    // Main workflow loop
    let continueWorkflow = true;
    while (continueWorkflow) {
      // Step 1: Select application
      let appId = options.app;
      if (!appId) {
        const response = await service.listApplications();
        const apps = response.Items || response || [];
        const appChoices = apps.map(app => ({
          name: `${app.Name} (${app.TotalIssues || 0} issues)`,
          value: app.Id,
          description: app.Description || ''
        }));

        appId = await select({
          message: 'Select an application:',
          choices: appChoices
        });
      }

      // Step 2: Select scan
      const scansResponse = await service.listScans(appId);
      const scans = scansResponse.Items || scansResponse || [];
      let filteredScans = scans;

      if (options.scanType) {
        const normalizedType = options.scanType.toUpperCase();
        filteredScans = scans.filter(scan => {
          return Formatter.normalizeScanType(scan.Technology) === normalizedType;
        });
        
        if (filteredScans.length === 0) {
          console.log(chalk.yellow(`\nNo ${options.scanType} scans found for this application.`));
          console.log(chalk.gray('Available scan types in this application:'));
          const availableTypes = [...new Set(scans.map(s => Formatter.normalizeScanType(s.Technology)))];
          availableTypes.forEach(type => {
            const count = scans.filter(s => Formatter.normalizeScanType(s.Technology) === type).length;
            console.log(chalk.gray(`  - ${type}: ${count} scan(s)`));
          });
          console.log(chalk.cyan('\n↩️  Returning to application selection...\n'));
          continue; // Go back to application selection
        }
      }

      const scanChoices = filteredScans.map(scan => {
        const stats = {
          total: scan.LatestExecution?.NIssuesFound || 0,
          High: scan.LatestExecution?.NHighIssues || 0,
          Medium: scan.LatestExecution?.NMediumIssues || 0
        };
        return formatScanDisplay(scan, stats);
      });

      let scanId;
      if (filteredScans.length === 1) {
        // Auto-select if only one scan available
        scanId = filteredScans[0].Id;
        console.log(chalk.green(`\n✓ Auto-selected scan: ${filteredScans[0].Name}`));
      } else {
        scanId = await select({
          message: 'Select a scan:',
          choices: scanChoices
        });
      }

      // Step 3: Issue browsing loop
      let continueBrowsing = true;
      let filterStatus = null;
      let filterSeverity = null;
      let filterJira = null; // 'with' | 'without' | null
      let filterIssueType = null; // Filter by specific vulnerability type
      let searchText = null;

      while (continueBrowsing) {
        // Fetch and display issues
        const issuesResponse = await service.api.v4.Issues_Get('Scan', scanId, {});
        let issues = issuesResponse.Items || [];

        if (issues.length === 0) {
          console.log(chalk.yellow('\nNo issues found for this scan.'));
          continueBrowsing = false;
          break;
        }

        // Apply filters
        if (filterStatus) {
          issues = issues.filter(i => i.Status === filterStatus);
        }
        if (filterSeverity) {
          issues = issues.filter(i => i.Severity === filterSeverity);
        }
        if (filterIssueType) {
          issues = issues.filter(i => i.IssueType === filterIssueType);
        }
        if (filterJira === 'with') {
          issues = issues.filter(i => i.ExternalId && i.ExternalId.trim() !== '');
        } else if (filterJira === 'without') {
          issues = issues.filter(i => !i.ExternalId || i.ExternalId.trim() === '');
        }
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          issues = issues.filter(i => 
            (i.IssueType && i.IssueType.toLowerCase().includes(searchLower)) ||
            (i.Location && i.Location.toLowerCase().includes(searchLower)) ||
            (i.Api && i.Api.toLowerCase().includes(searchLower))
          );
        }

        console.log(chalk.green(`\nShowing ${issues.length} issues`));
        if (filterStatus || filterSeverity || filterIssueType || filterJira || searchText) {
          const filters = [];
          if (filterStatus) filters.push(`Status: ${filterStatus}`);
          if (filterSeverity) filters.push(`Severity: ${filterSeverity}`);
          if (filterIssueType) filters.push(`Type: ${filterIssueType}`);
          if (filterJira) filters.push(`Jira: ${filterJira === 'with' ? 'Has Jira link' : 'No Jira link'}`);
          if (searchText) filters.push(`Search: "${searchText}"`);
          console.log(chalk.cyan(`Filters active: ${filters.join(', ')}`));
        }

        // Display status summary
        const statusCounts = {};
        const severityCounts = {};
        for (const issue of issues) {
          statusCounts[issue.Status] = (statusCounts[issue.Status] || 0) + 1;
          severityCounts[issue.Severity] = (severityCounts[issue.Severity] || 0) + 1;
        }
        console.log(chalk.cyan('\n📊 Status Summary:'));
        for (const [status, count] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
          const icon = status === 'Open' ? '🔴' : status === 'InProgress' ? '🟡' : status === 'Noise' ? '⚫' : '✅';
          console.log(`  ${icon} ${status}: ${count}`);
        }

        // Group and display
        const grouped = groupIssuesByType(issues);
        displayGroupedSummary(grouped);

        // Display active filters before action menu
        if (filterStatus || filterSeverity || filterIssueType || filterJira || searchText) {
          console.log(chalk.yellow('\n⚠️  Active Filters:'));
          if (filterStatus) console.log(chalk.yellow(`  • Status: ${filterStatus}`));
          if (filterSeverity) console.log(chalk.yellow(`  • Severity: ${filterSeverity}`));
          if (filterIssueType) console.log(chalk.yellow(`  • Type: ${filterIssueType}`));
          if (filterJira) console.log(chalk.yellow(`  • Jira: ${filterJira === 'with' ? 'Has Jira link' : 'No Jira link'}`));
          if (searchText) console.log(chalk.yellow(`  • Search: "${searchText}"`));
          console.log(chalk.gray('  (Some vulnerabilities may be hidden by these filters)'));
        }

        // Step 4: Select action
        const action = await select({
          message: '\nWhat would you like to do? (Use ↑↓ arrows to select, Enter to confirm)',
          choices: [
            { name: '📝 Select issues to update status', value: 'update' },
            { name: '🎫 Select issues to create Jira', value: 'jira' },
            { name: '🔍 View issue details (quick)', value: 'details' },
            { name: '📖 View issue details with article', value: 'details-with-article' },
            { name: '🔎 Filter by status', value: 'filter-status' },
            { name: '📊 Filter by severity', value: 'filter-severity' },
            { name: '🏷️  Filter by vulnerability type', value: 'filter-type' },
            { name: '🎫 Filter by Jira link', value: 'filter-jira' },
            { name: '🔍 Search by text', value: 'search' },
            { name: '🔄 Clear filters', value: 'clear-filters' },
            { name: '🔄 Refresh', value: 'refresh' },
            { name: '⬅️  Back to scan selection', value: 'back' },
            { name: '❌ Exit', value: 'exit' }
          ]
        });

        if (action === 'exit') {
          continueBrowsing = false;
          continueWorkflow = false;
          break;
        } else if (action === 'back') {
          continueBrowsing = false;
          break;
        } else if (action === 'refresh') {
          continue;
        } else if (action === 'clear-filters') {
          filterStatus = null;
          filterSeverity = null;
          filterIssueType = null;
          filterJira = null;
          searchText = null;
          console.log(chalk.green('\n✓ Filters cleared'));
          continue;
        } else if (action === 'filter-status') {
          const statusChoices = [
            { name: 'All statuses', value: null },
            ...ISSUE_STATUSES
          ];
          filterStatus = await select({
            message: 'Filter by status:',
            choices: statusChoices
          });
          continue;
        } else if (action === 'filter-severity') {
          const severityChoices = [
            { name: 'All severities', value: null },
            { name: 'Critical', value: 'Critical' },
            { name: 'High', value: 'High' },
            { name: 'Medium', value: 'Medium' },
            { name: 'Low', value: 'Low' },
            { name: 'Informational', value: 'Informational' }
          ];
          filterSeverity = await select({
            message: 'Filter by severity:',
            choices: severityChoices
          });
          continue;
        } else if (action === 'filter-type') {
          // Get unique issue types from current issues
          const issueTypes = [...new Set(issues.map(i => i.IssueType))].sort();
          const typeChoices = [
            { name: 'Show all types', value: null },
            ...issueTypes.map(type => ({
              name: `${type} (${issues.filter(i => i.IssueType === type).length} issues)`,
              value: type
            }))
          ];
          filterIssueType = await select({
            message: 'Filter by vulnerability type:',
            choices: typeChoices,
            pageSize: 20
          });
          continue;
        } else if (action === 'filter-jira') {
          const jiraChoices = [
            { name: 'Show all', value: null },
            { name: 'Only issues WITH Jira link', value: 'with' },
            { name: 'Only issues WITHOUT Jira link', value: 'without' }
          ];
          filterJira = await select({
            message: 'Filter by Jira link:',
            choices: jiraChoices
          });
          continue;
        } else if (action === 'search') {
          searchText = await input({
            message: 'Enter search text (leave empty to clear):',
            default: searchText || ''
          });
          if (!searchText) searchText = null;
          continue;
        } else if (action === 'details' || action === 'details-with-article') {
          const showArticle = action === 'details-with-article';
          
          // View issue details
          const issueChoices = issues.slice(0, 50).map(issue => ({
            name: `[${issue.Severity}] [${issue.Status}] ${issue.IssueType} - ${issue.Location || issue.Api || 'N/A'}${issue.ExternalId ? ` (Jira: ${issue.ExternalId})` : ''}`,
            value: issue.Id
          }));

          if (issueChoices.length === 0) {
            console.log(chalk.yellow('\nNo issues to display.'));
            continue;
          }

          const selectedIssueId = await select({
            message: `Select issue to view details${showArticle ? ' with article' : ''}:`,
            choices: issueChoices,
            pageSize: 15
          });

          const selectedIssue = issues.find(i => i.Id === selectedIssueId);
          if (selectedIssue) {
            console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
            console.log(chalk.bold.white(`\n📋 Issue Details\n`));
            console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
            console.log(chalk.bold('Type:'), selectedIssue.IssueType);
            console.log(chalk.bold('Severity:'), chalk[Formatter.getSeverityColor(selectedIssue.Severity)](selectedIssue.Severity));
            console.log(chalk.bold('Status:'), selectedIssue.Status);
            console.log(chalk.bold('Location:'), selectedIssue.Location || selectedIssue.Api || 'N/A');
            if (selectedIssue.SourceFile) console.log(chalk.bold('File:'), selectedIssue.SourceFile);
            if (selectedIssue.Line) console.log(chalk.bold('Line:'), selectedIssue.Line);
            if (selectedIssue.Context) console.log(chalk.bold('Context:'), selectedIssue.Context);
            if (selectedIssue.Language) console.log(chalk.bold('Language:'), selectedIssue.Language);
            if (selectedIssue.Cwe) console.log(chalk.bold('CWE:'), selectedIssue.Cwe);
            if (selectedIssue.ExternalId) {
              console.log(chalk.bold('Jira Key:'), selectedIssue.ExternalId);
              const jiraHost = config.getJiraHost();
              if (jiraHost) {
                const jiraUrl = `${jiraHost}/browse/${selectedIssue.ExternalId}`;
                console.log(chalk.bold('Jira URL:'), chalk.blue.underline(jiraUrl));
              }
            }
            if (selectedIssue.SourceFileUri) console.log(chalk.bold('Source:'), selectedIssue.SourceFileUri);
            console.log(chalk.bold('Created:'), new Date(selectedIssue.DateCreated).toLocaleDateString());
            console.log(chalk.bold('Updated:'), new Date(selectedIssue.LastUpdated).toLocaleDateString());
            
            // Fetch and display article only if requested
            if (showArticle && selectedIssue.IssueTypeId) {
              console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
              console.log(chalk.bold.white('📖 Remediation Guidance\n'));
              console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
              try {
                const articleHtml = await service.getArticle(selectedIssue.Id);
                if (articleHtml) {
                  // Step 1: Sanitize HTML - remove scripts, styles, and images
                  const sanitizeHtml = (await import('sanitize-html')).default;
                  const cleanHtml = sanitizeHtml(articleHtml, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2']),
                    allowedAttributes: {
                      'a': ['href']
                    },
                    disallowedTagsMode: 'discard',
                    // Remove img, script, style tags completely
                    exclusiveFilter: (frame) => {
                      return frame.tag === 'img' || frame.tag === 'script' || frame.tag === 'style';
                    }
                  });
                  
                  // Step 2: Convert clean HTML to Markdown
                  const TurndownService = (await import('turndown')).default;
                  const turndown = new TurndownService({
                    headingStyle: 'atx',
                    codeBlockStyle: 'fenced'
                  });
                  
                  // Custom rule to preserve URLs in a console-friendly format
                  turndown.addRule('links', {
                    filter: 'a',
                    replacement: function(content, node) {
                      const href = node.getAttribute('href');
                      if (!href) return content;
                      
                      // For console, show both text and URL
                      if (content && content !== href) {
                        return `${content} (${href})`;
                      }
                      return href;
                    }
                  });
                  
                  const articleMarkdown = turndown.turndown(cleanHtml);
                  
                  // Step 3: Render Markdown with formatting in console
                  const cliMarkdown = (await import('cli-markdown')).default;
                  const formattedArticle = cliMarkdown(articleMarkdown);
                  console.log(formattedArticle);
                } else {
                  console.log(chalk.yellow('No article content available'));
                }
              } catch (e) {
                console.log(chalk.yellow(`Article not available: ${e.message}`));
              }
            }
            console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
          }
          continue;
        }

        // Step 5: Select issues
        const issueChoices = issues.map(issue => ({
          name: `[${issue.Severity}] [${issue.Status}] ${issue.IssueType} - ${issue.Location || issue.Api || 'N/A'}${issue.ExternalId ? ` (Jira: ${issue.ExternalId})` : ''}`,
          value: issue.Id,
          checked: false
        }));

        console.log(chalk.gray('\nTip: Use Space to select, Enter to confirm, or press Enter without selecting anything to go back.\n'));

        const selectedIssueIds = await checkbox({
          message: 'Select issues (or press Enter to cancel):',
          choices: issueChoices,
          pageSize: 15
        });

        if (selectedIssueIds.length === 0) {
          console.log(chalk.cyan('\n↩️  Returning to action menu...'));
          continue;
        }

        console.log(chalk.green(`\n✓ Selected ${selectedIssueIds.length} issue(s)`));

        // Step 6: Choose what to do with selected issues
        const selectedAction = await select({
          message: 'What would you like to do with the selected issues?',
          choices: [
            { name: '📝 Update status', value: 'update' },
            { name: '🎫 Create Jira issue(s)', value: 'jira' },
            { name: '📄 View details of all selected', value: 'view-details' },
            { name: '⬅️  Back (clear selection)', value: 'back' }
          ]
        });

        if (selectedAction === 'back') {
          continue;
        }

        // Step 7: Perform action on selected issues
        if (selectedAction === 'update') {
          const statusChoice = await select({
            message: 'Select new status:',
            choices: ISSUE_STATUSES
          });

          const comment = await input({
            message: 'Add comment (optional):',
            default: ''
          });

          // Bulk update
          const selectedIssues = issues.filter(i => selectedIssueIds.includes(i.Id));
          const issuesByApp = {};
          
          for (const issue of selectedIssues) {
            const appIdForIssue = issue.ApplicationId;
            if (!issuesByApp[appIdForIssue]) {
              issuesByApp[appIdForIssue] = [];
            }
            issuesByApp[appIdForIssue].push(issue.Id);
          }

          const updateData = { Status: statusChoice };
          if (comment) updateData.Comment = comment;

          for (const [appIdForUpdate, appIssueIds] of Object.entries(issuesByApp)) {
            const odataFilter = appIssueIds.map(id => `Id eq ${id}`).join(' or ');
            await service.api.v4.Issues_UpdateFilteredIssues(
              'Application',
              appIdForUpdate,
              updateData,
              { $filter: odataFilter }
            );
          }

          console.log(chalk.green(`\n✓ Updated ${selectedIssueIds.length} issues to ${statusChoice}`));
          continue; // Continue browsing issues
        } else if (selectedAction === 'view-details') {
          // Display details for all selected issues
          const selectedIssues = issues.filter(i => selectedIssueIds.includes(i.Id));
          
          for (let idx = 0; idx < selectedIssues.length; idx++) {
            const selectedIssue = selectedIssues[idx];
            console.log(chalk.cyan(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
            console.log(chalk.bold.white(`\n📋 Issue ${idx + 1} of ${selectedIssues.length}\n`));
            console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
            console.log(chalk.bold('Type:'), selectedIssue.IssueType);
            console.log(chalk.bold('Severity:'), chalk[Formatter.getSeverityColor(selectedIssue.Severity)](selectedIssue.Severity));
            console.log(chalk.bold('Status:'), selectedIssue.Status);
            console.log(chalk.bold('Location:'), selectedIssue.Location || selectedIssue.Api || 'N/A');
            if (selectedIssue.SourceFile) console.log(chalk.bold('File:'), selectedIssue.SourceFile);
            if (selectedIssue.Line) console.log(chalk.bold('Line:'), selectedIssue.Line);
            if (selectedIssue.Context) console.log(chalk.bold('Context:'), selectedIssue.Context);
            if (selectedIssue.Language) console.log(chalk.bold('Language:'), selectedIssue.Language);
            if (selectedIssue.Cwe) console.log(chalk.bold('CWE:'), selectedIssue.Cwe);
            if (selectedIssue.ExternalId) {
              console.log(chalk.bold('Jira Key:'), selectedIssue.ExternalId);
              const jiraHost = config.getJiraHost();
              if (jiraHost) {
                const jiraUrl = `${jiraHost}/browse/${selectedIssue.ExternalId}`;
                console.log(chalk.bold('Jira URL:'), chalk.blue.underline(jiraUrl));
              }
            }
            if (selectedIssue.SourceFileUri) console.log(chalk.bold('Source:'), selectedIssue.SourceFileUri);
            console.log(chalk.bold('Created:'), new Date(selectedIssue.DateCreated).toLocaleDateString());
            console.log(chalk.bold('Updated:'), new Date(selectedIssue.LastUpdated).toLocaleDateString());
            
            // Fetch and display article (only for first issue to avoid too much output)
            if (idx === 0 && selectedIssue.IssueTypeId) {
              console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
              console.log(chalk.bold.white('📖 Remediation Guidance (for this issue type)\n'));
              console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
              try {
                const articleHtml = await service.getArticle(selectedIssue.Id);
                if (articleHtml) {
                  // Step 1: Sanitize HTML - remove scripts, styles, and images
                  const sanitizeHtml = (await import('sanitize-html')).default;
                  const cleanHtml = sanitizeHtml(articleHtml, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2']),
                    allowedAttributes: {
                      'a': ['href']
                    },
                    disallowedTagsMode: 'discard',
                    // Remove img, script, style tags completely
                    exclusiveFilter: (frame) => {
                      return frame.tag === 'img' || frame.tag === 'script' || frame.tag === 'style';
                    }
                  });
                  
                  // Step 2: Convert clean HTML to Markdown
                  const TurndownService = (await import('turndown')).default;
                  const turndown = new TurndownService({
                    headingStyle: 'atx',
                    codeBlockStyle: 'fenced'
                  });
                  
                  // Custom rule to preserve URLs in a console-friendly format
                  turndown.addRule('links', {
                    filter: 'a',
                    replacement: function(content, node) {
                      const href = node.getAttribute('href');
                      if (!href) return content;
                      
                      // For console, show both text and URL
                      if (content && content !== href) {
                        return `${content} (${href})`;
                      }
                      return href;
                    }
                  });
                  
                  const articleMarkdown = turndown.turndown(cleanHtml);
                  
                  // Step 3: Render Markdown with formatting in console
                  const cliMarkdown = (await import('cli-markdown')).default;
                  const formattedArticle = cliMarkdown(articleMarkdown);
                  console.log(formattedArticle);
                } else {
                  console.log(chalk.yellow('No article content available'));
                }
              } catch (e) {
                console.log(chalk.yellow(`Article not available: ${e.message}`));
              }
            }
          }
          console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
          console.log(chalk.green(`\n✓ Displayed details for ${selectedIssues.length} issue(s)`));
          continue;
        } else if (selectedAction === 'jira') {
          if (!config.isJiraValid()) {
            console.error(chalk.red('\nJira is not configured. Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN.'));
            continue;
          }

          const projectKey = config.getJiraProjectKey() || await input({
            message: 'Enter Jira project key:',
            validate: (value) => value.length > 0 || 'Project key is required'
          });

          const groupBy = await select({
            message: 'Group issues by:',
            choices: [
              { name: 'Type (recommended)', value: 'type' },
              { name: 'Severity', value: 'severity' },
              { name: 'None (one issue per vulnerability)', value: 'none' }
            ]
          });

          // Create Jira issues
          const jiraService = new JiraService(config);
          jiraService.initialize();

          const selectedIssues = issues.filter(i => selectedIssueIds.includes(i.Id));
          const groups = groupIssuesForJira(selectedIssues, groupBy);

          for (const group of groups) {
            const builder = new JiraDescriptionBuilder(group.issues, config.getBaseUrl());
            const description = builder
              .addSummary(null, null)
              .addIssuesByType()
              .addIssueIds()
              .build();

            const summary = `[Security] ${group.name} - ${group.issues.length} occurrence(s)`;

            const jiraIssue = await jiraService.client.issues.createIssue({
              fields: {
                project: { key: projectKey },
                summary: summary,
                description: jiraService.convertToADF(description),
                issuetype: { name: 'Bug' },
                labels: ['appscan', 'security']
              }
            });

            const jiraKey = jiraIssue.key;
            console.log(chalk.green(`\n✓ Created Jira issue: ${jiraKey}`));

            // Update AppScan issues with Jira link
            for (const issue of group.issues) {
              const appIdForJira = issue.ApplicationId;
              await service.api.v4.Issues_UpdateFilteredIssues(
                'Application',
                appIdForJira,
                { ExternalId: jiraKey },
                { $filter: `Id eq ${issue.Id}` }
              );
            }
          }

          console.log(chalk.green(`\n✓ Created ${groups.length} Jira issue(s) and linked to AppScan`));
          continue; // Continue browsing issues
        }
      }
    }

  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Helper: Group issues for Jira creation
 */
function groupIssuesForJira(issues, strategy) {
  if (strategy === 'none') {
    return issues.map(issue => ({
      name: issue.IssueType,
      issues: [issue]
    }));
  } else if (strategy === 'severity') {
    const grouped = {};
    for (const issue of issues) {
      const key = issue.Severity || 'Unknown';
      if (!grouped[key]) {
        grouped[key] = { name: key, issues: [] };
      }
      grouped[key].issues.push(issue);
    }
    return Object.values(grouped);
  } else {
    // Default: group by type
    const grouped = {};
    for (const issue of issues) {
      const key = issue.IssueType || 'Unknown';
      if (!grouped[key]) {
        grouped[key] = { name: key, issues: [] };
      }
      grouped[key].issues.push(issue);
    }
    return Object.values(grouped);
  }
}

/**
 * Helper: Output result based on format options
 */
function outputResult(result, options) {
  if (options.table && !options.json) {
    // Table format (would need specific formatting for each type)
    console.log(JSON.stringify(result, null, 2));
  } else {
    // JSON format (default)
    console.log(JSON.stringify(result, null, 2));
  }
}

export default createTriageReportCommand();
