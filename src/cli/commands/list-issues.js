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
 * List issues for a specific scan with filtering options
 * @param {string} scanId - Scan ID to retrieve issues for
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 * @param {string} [options.excludeStatus='Noise'] - Comma-separated statuses to exclude
 * @param {boolean} [options.grouped] - Apply grouped sorting (Application → Issue Type → Severity)
 * @param {boolean} [options.byFixgroup] - Group issues by FixGroup
 * @param {string} [options.severity] - Filter by severity
 * @param {string} [options.status] - Filter by status
 */
export async function listIssues(scanId, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    const { filterOptions, hasFilters } = buildFilterOptions(options);

    let response;
    if (hasFilters) {
      cliOutput.status(`Fetching issues for scan ${scanId} with filters...`);
      response = await service.listIssues(scanId, filterOptions);
    } else {
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
    const byFixgroupMode = options.byFixgroup ?? false;

    if (options.json) {
      cliOutput.json(issues);
    } else {
      cliOutput.success(`\nFound ${issues.length} issue(s):\n`);

      if (byFixgroupMode) {
        renderFixGroupedIssues(issues, service);
      } else if (groupedMode) {
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

/**
 * Render issues grouped by FixGroup
 * @param {Array} issues - Array of issue objects
 * @param {Object} service - AppScan service instance for fetching FixGroup details
 */
async function renderFixGroupedIssues(issues, service) {
  const grouped = issues.reduce((acc, issue) => {
    const fixGroupId = issue.FixGroupId || 'No FixGroup';
    if (!acc[fixGroupId]) {
      acc[fixGroupId] = [];
    }
    acc[fixGroupId].push(issue);
    return acc;
  }, {});

  const fixGroupIds = Object.keys(grouped).filter((id) => id !== 'No FixGroup');

  const fixGroupDetails = {};
  if (fixGroupIds.length > 0 && service) {
    try {
      const appId = issues[0]?.ApplicationId;
      if (appId) {
        const fixGroupsResponse = await service.api.v4.FixGroups_Get(
          'Application',
          appId,
          {}
        );
        if (fixGroupsResponse.Items) {
          fixGroupsResponse.Items.forEach((fg) => {
            fixGroupDetails[fg.Id] = fg;
          });
        }
      }
    } catch {
      console.error(chalk.yellow('Warning: Could not fetch FixGroup details'));
    }
  }

  console.log(chalk.bold('Issues grouped by FixGroup:'));
  console.log('');

  fixGroupIds.sort((a, b) => {
    const aDetail = fixGroupDetails[a];
    const bDetail = fixGroupDetails[b];
    if (!aDetail || !bDetail) return compare(a, b);

    const severityCompare = compareSeverity(bDetail.Severity, aDetail.Severity);
    if (severityCompare !== 0) return severityCompare;

    return (bDetail.NIssues || 0) - (aDetail.NIssues || 0);
  });

  fixGroupIds.forEach((fixGroupId) => {
    const fixGroupIssues = grouped[fixGroupId];
    const detail = fixGroupDetails[fixGroupId];

    if (detail) {
      const severityColor = severityColors[detail.Severity] || 'white';
      console.log(
        chalk[severityColor].bold(`${detail.Subject} [${detail.Severity}]`)
      );
      console.log(
        chalk.dim(
          `  FixGroup ID: ${fixGroupId} | Issues: ${fixGroupIssues.length} | Type: ${detail.IssueType || 'N/A'}`
        )
      );
    } else {
      console.log(chalk.bold(`FixGroup: ${fixGroupId}`));
      console.log(chalk.dim(`  Issues: ${fixGroupIssues.length}`));
    }

    console.log(buildListHeader());
    fixGroupIssues
      .sort((a, b) => compareSeverity(b.Severity, a.Severity))
      .forEach((issue) => {
        const color = severityColors[issue.Severity] || 'white';
        console.log(formatListIssueRow(issue, color));
      });
    console.log('');
  });

  if (grouped['No FixGroup'] && grouped['No FixGroup'].length > 0) {
    console.log(chalk.dim.bold('Issues without FixGroup:'));
    console.log(buildListHeader());
    grouped['No FixGroup'].forEach((issue) => {
      const color = severityColors[issue.Severity] || 'white';
      console.log(formatListIssueRow(issue, color));
    });
    console.log('');
  }
}

/**
 * Render issues 

/**
 * Render issues with grouped sorting by Application, Issue Type, and Severity
 * @param {Array} issues - Array of issue objects
 */
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

/**
 * Build header row for list view
 * @returns {string} Formatted header string
 */
function buildListHeader() {
  return `  ${chalk.dim('Issue Type')} | ${chalk.dim('Severity')} | ${chalk.dim(
    'Threat Class'
  )} | ${chalk.dim('Scanner')} | ${chalk.dim('Fix Group')} | ${chalk.dim(
    'Source File'
  )} | ${chalk.dim('Location')}`;
}

/**
 * Build header row for grouped view
 * @returns {string} Formatted header string
 */
function buildGroupedHeader() {
  return `  ${chalk.dim('Application ID')} | ${chalk.dim('Issue Type ID')} | ${chalk.dim(
    'Issue Type'
  )} | ${chalk.dim('Severity')} | ${chalk.dim('Threat Class')} | ${chalk.dim(
    'Scanner'
  )} | ${chalk.dim('Fix Group')} | ${chalk.dim('Source File')} | ${chalk.dim(
    'Location'
  )}`;
}

/**
 * Format a single issue row for list view
 * @param {Object} issue - Issue object
 * @param {string} color - Chalk color name for severity
 * @returns {string} Formatted row string
 */
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

/**
 * Format a single issue row for grouped view
 * @param {Object} issue - Issue object
 * @param {string} color - Chalk color name for severity
 * @returns {string} Formatted row string
 */
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

export default listIssues;
