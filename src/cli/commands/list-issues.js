import chalk from 'chalk';
import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import {
  buildFilterOptions,
  severityOrder,
  severityColors,
} from '../../utils/filter-builder.js';
import cliOutput from '../../utils/cli-output.js';

export async function listIssues(scanId, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    // Build filter options using shared utility
    const { filterOptions, hasFilters } = buildFilterOptions(options);

    // Determine which approach to use
    let response;
    if (hasFilters) {
      // Use new OData filter approach
      cliOutput.status(`Fetching issues for scan ${scanId} with filters...`);
      response = await service.listIssues(scanId, filterOptions);
    } else {
      // Use legacy exclude-status approach
      const excludeStatus =
        options.excludeStatus !== undefined ? options.excludeStatus : 'Noise';
      if (excludeStatus) {
        cliOutput.status(
          `Fetching issues for scan ${scanId} (excluding status: ${excludeStatus})...`
        );
      } else {
        cliOutput.status(`Fetching issues for scan ${scanId}...`);
      }
      response = await service.listIssues(scanId, null, excludeStatus);
    }

    const issues = response.Items || [];
    const groupedMode = options.grouped ?? false;

    if (options.json) {
      cliOutput.json(issues);
    } else {
      cliOutput.success(`\nFound ${issues.length} issue(s):\n`);

      if (groupedMode) {
        renderGroupedIssues(issues);
      } else {
        renderSeverityGroupedIssues(issues);
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list issues');
  }
}

const severityLevels = [
  'Critical',
  'High',
  'Medium',
  'Low',
  'Informational',
  'Unknown',
];

function renderSeverityGroupedIssues(issues) {
  const grouped = issues.reduce((acc, issue) => {
    const severity = issue.Severity || 'Unknown';
    if (!acc[severity]) {
      acc[severity] = [];
    }
    acc[severity].push(issue);
    return acc;
  }, {});

  const header = buildListHeader();

  severityLevels.forEach((severity) => {
    const severityIssues = grouped[severity] || [];
    if (severityIssues.length === 0) {
      return;
    }

    const color = severityColors[severity] || 'white';
    console.log(chalk[color].bold(`${severity} (${severityIssues.length}):`));
    console.log(header);
    severityIssues.forEach((issue) => {
      console.log(formatListIssueRow(issue, color));
    });
    console.log('');
  });
}

function renderGroupedIssues(issues) {
  const sorted = [...issues].sort((a, b) => {
    const appCompare = compare(a.ApplicationId, b.ApplicationId);
    if (appCompare !== 0) return appCompare;

    const issueTypeIdCompare = compare(a.IssueTypeId, b.IssueTypeId);
    if (issueTypeIdCompare !== 0) return issueTypeIdCompare;

    return compareSeverity(b.Severity, a.Severity);
  });

  console.log(
    chalk.bold('Grouped issues (Application → Issue Type → Severity):')
  );
  console.log(buildGroupedHeader());
  sorted.forEach((issue) => {
    const color = severityColors[issue.Severity] || 'white';
    console.log(formatGroupedIssueRow(issue, color));
  });
  console.log('');
}

function buildListHeader() {
  return `  ${chalk.dim('Issue Type')} | ${chalk.dim('Severity')} | ${chalk.dim(
    'Threat Class'
  )} | ${chalk.dim('Scanner')} | ${chalk.dim('Fix Group')} | ${chalk.dim(
    'Source File'
  )} | ${chalk.dim('Location')}`;
}

function buildGroupedHeader() {
  return `  ${chalk.dim('Application ID')} | ${chalk.dim('Issue Type ID')} | ${chalk.dim(
    'Issue Type'
  )} | ${chalk.dim('Severity')} | ${chalk.dim('Threat Class')} | ${chalk.dim(
    'Scanner'
  )} | ${chalk.dim('Fix Group')} | ${chalk.dim('Source File')} | ${chalk.dim(
    'Location'
  )}`;
}

function formatListIssueRow(issue, color) {
  const columns = [
    issue.IssueType || 'N/A',
    issue.Severity || 'N/A',
    issue.ThreatClassId || 'N/A',
    issue.Scanner || 'N/A',
    issue.FixGroupId || 'N/A',
    issue.SourceFileUri || 'N/A',
    issue.Location || 'N/A',
  ];

  return `  ${chalk[color]('•')} ${columns.join(' | ')}`;
}

function formatGroupedIssueRow(issue, color) {
  const columns = [
    issue.ApplicationId || 'N/A',
    issue.IssueTypeId || 'N/A',
    issue.IssueType || 'N/A',
    issue.Severity || 'N/A',
    issue.ThreatClassId || 'N/A',
    issue.Scanner || 'N/A',
    issue.FixGroupId || 'N/A',
    issue.SourceFileUri || 'N/A',
    issue.Location || 'N/A',
  ];

  return `  ${chalk[color]('•')} ${columns.join(' | ')}`;
}

function compareSeverity(a, b) {
  const aScore = severityOrder[a] ?? severityOrder.Unknown;
  const bScore = severityOrder[b] ?? severityOrder.Unknown;
  return aScore - bScore;
}

function compare(a, b) {
  const aValue = a || '';
  const bValue = b || '';
  if (aValue < bValue) return -1;
  if (aValue > bValue) return 1;
  return 0;
}

export default listIssues;
