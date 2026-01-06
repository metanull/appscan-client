import chalk from 'chalk';
import { initializeAppScanService, handleCommandError } from '../../utils/cli-common.js';
import { buildFilterOptions, severityOrder, severityColors } from '../../utils/filter-builder.js';

export async function listIssuesByApp(appId, options) {
  try {
    const { service } = await initializeAppScanService(options.config);

    // Build filter options using shared utility
    const { filterOptions, hasFilters } = buildFilterOptions(options);

    // Fetch issues using Application scope
    console.error(
      chalk.blue(
        `Fetching issues for application ${appId}${hasFilters ? ' with filters' : ''}...`
      )
    );

    const response = await service.listIssues(
      appId,
      hasFilters ? filterOptions : null,
      null,
      'Application'
    );

    const issues = response.Items || [];
    const groupedMode = options.grouped ?? false;

    if (options.json) {
      console.log(JSON.stringify(issues, null, 2));
    } else {
      console.error(chalk.green(`\nFound ${issues.length} issue(s):\n`));

      if (groupedMode) {
        renderGroupedIssues(issues);
      } else {
        renderSeverityGroupedIssues(issues);
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list application issues');
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
    if (severityIssues.length > 0) {
      const color = severityColors[severity] || 'white';
      console.log(
        chalk[color].bold(`\n${severity} (${severityIssues.length}):`)
      );
      console.log(header);
      severityIssues.forEach((issue) => {
        console.log(formatListIssueRow(issue, color));
      });
    }
  });
}

function renderGroupedIssues(issues) {
  const sorted = [...issues].sort((a, b) => {
    const cmp1 = compare(a.ApplicationId, b.ApplicationId);
    if (cmp1 !== 0) return cmp1;
    const cmp2 = compare(a.IssueTypeId, b.IssueTypeId);
    if (cmp2 !== 0) return cmp2;
    return compareSeverity(a.Severity, b.Severity);
  });

  console.log(
    chalk.bold('Grouped issues (Application → Scan → Issue Type → Severity):')
  );
  console.log(buildGroupedHeader());
  sorted.forEach((issue) => {
    const color = severityColors[issue.Severity] || 'white';
    console.log(formatGroupedIssueRow(issue, color));
  });
  console.log('');
}

function buildListHeader() {
  return `  ${chalk.dim('Scan')} | ${chalk.dim('Issue Type')} | ${chalk.dim(
    'Severity'
  )} | ${chalk.dim('Threat Class')} | ${chalk.dim('Scanner')} | ${chalk.dim(
    'Fix Group'
  )} | ${chalk.dim('Source File')} | ${chalk.dim('Location')}`;
}

function buildGroupedHeader() {
  return `  ${chalk.dim('Application ID')} | ${chalk.dim('Scan Name')} | ${chalk.dim(
    'Issue Type ID'
  )} | ${chalk.dim('Issue Type')} | ${chalk.dim('Severity')} | ${chalk.dim(
    'Threat Class'
  )} | ${chalk.dim('Scanner')} | ${chalk.dim('Fix Group')} | ${chalk.dim(
    'Source File'
  )} | ${chalk.dim('Location')}`;
}

function formatListIssueRow(issue, color) {
  const columns = [
    issue.ScanName || 'N/A',
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
    issue.ScanName || 'N/A',
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

export default listIssuesByApp;
