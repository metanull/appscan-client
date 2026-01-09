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

/**
 * List all issues for a specific application with filtering options
 * @param {string} appId - Application ID to retrieve issues for
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 * @param {boolean} [options.grouped] - Apply grouped sorting
 * @param {string} [options.severity] - Filter by severity
 * @param {string} [options.status] - Filter by status
 */
export async function listIssuesByApp(appId, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    const { filterOptions, hasFilters } = buildFilterOptions(options);

    cliOutput.status(
      `Fetching issues for application ${appId}${hasFilters ? ' with filters' : ''}...`
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

/**
 * Render issues grouped by severity level
 * @param {Array} issues - Array of issue objects
 */
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

/**
 * Render issues with grouped sorting by Application, Scan, Issue Type, and Severity
 * @param {Array} issues - Array of issue objects
 */
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

/**
 * Build header row for list view
 * @returns {string} Formatted header string
 */
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

/**
 * Format a single issue row for grouped view
 * @param {Object} issue - Issue object
 * @param {string} color - Chalk color name for severity
 * @returns {string} Formatted row string
 */
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

/**
 * Compare two severity values for sorting
 * @param {string} a - First severity value
 * @param {string} b - Second severity value
 * @returns {number} Sort comparison result
 */
function compareSeverity(a, b) {
  const aScore = severityOrder[a] ?? severityOrder.Unknown;
  const bScore = severityOrder[b] ?? severityOrder.Unknown;
  return aScore - bScore;
}

/**
 * Generic string comparison for sorting
 * @param {string} a - First value
 * @param {string} b - Second value
 * @returns {number} Sort comparison result
 */
function compare(a, b) {
  const aValue = a || '';
  const bValue = b || '';
  if (aValue < bValue) return -1;
  if (aValue > bValue) return 1;
  return 0;
}

export default listIssuesByApp;
