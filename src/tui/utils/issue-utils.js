/**
 * Utility functions for issue grouping and statistics
 */

export const SEVERITY_ORDER = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Informational: 1,
  Unknown: 0,
};

export const SEVERITY_COLORS = {
  Critical: 'redBright',
  High: 'red',
  Medium: 'yellow',
  Low: 'blue',
  Informational: 'gray',
};

/**
 * Group issues by property and sort by severity
 * @param {Array} issues - Issues to group
 * @param {string} property - Property to group by (default: IssueType)
 * @returns {Array<{name: string, severity: string, issues: Array}>} Grouped issues
 */
export function groupIssuesBy(issues, property = 'IssueType') {
  const grouped = {};

  issues.forEach((issue) => {
    const key = issue[property] || 'Unknown';
    if (!grouped[key]) {
      grouped[key] = {
        name: key,
        severity: issue.Severity || 'Unknown',
        issues: [],
      };
    }
    grouped[key].issues.push(issue);
  });

  return Object.values(grouped).sort((a, b) => {
    return (
      (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0)
    );
  });
}

/**
 * Calculate comprehensive issue statistics
 * @param {Array} issues - Issues to analyze
 * @returns {Object} Stats including counts by severity, status, type, and Jira presence
 */
export function calculateStats(issues) {
  const stats = {
    total: issues.length,
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Informational: 0,
    byStatus: {},
    byType: {},
    withJira: 0,
    withoutJira: 0,
  };

  issues.forEach((issue) => {
    const severity = issue.Severity || 'Unknown';
    if (stats[severity] !== undefined) {
      stats[severity]++;
    }

    const status = issue.Status || 'Unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    const type = issue.IssueType || 'Unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    if (issue.ExternalId && issue.ExternalId.trim() !== '') {
      stats.withJira++;
    } else {
      stats.withoutJira++;
    }
  });

  return stats;
}

/**
 * Get severity badge for display
 * @param {string} severity - Severity level
 * @returns {string} Badge like [C], [H], [M], [L], [I]
 */
export function getSeverityBadge(severity) {
  const badges = {
    Critical: '[C]',
    High: '[H]',
    Medium: '[M]',
    Low: '[L]',
    Informational: '[I]',
  };
  return badges[severity] || '[?]';
}

/**
 * Filter and sort issues based on criteria
 * @param {Array} issues - List of issues
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered and sorted issues
 */
export function filterIssues(issues, filters = {}) {
  const {
    status,
    severity,
    issueType,
    jira,
    fixgroup,
    searchText,
    sortBy = 'severity',
  } = filters;

  let filtered = [...issues];

  if (status) {
    filtered = filtered.filter((i) => i.Status === status);
  }

  if (severity) {
    filtered = filtered.filter((i) => i.Severity === severity);
  }

  if (issueType) {
    filtered = filtered.filter((i) => i.IssueType === issueType);
  }

  if (fixgroup) {
    // Normalize comparison to strings to handle numeric/string id mismatches
    filtered = filtered.filter(
      (i) => String(i.FixGroupId) === String(fixgroup)
    );
  }

  if (jira === 'with') {
    filtered = filtered.filter(
      (i) => i.ExternalId && i.ExternalId.trim() !== ''
    );
  } else if (jira === 'without') {
    filtered = filtered.filter(
      (i) => !i.ExternalId || i.ExternalId.trim() === ''
    );
  }

  if (searchText) {
    const searchLower = searchText.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        (i.IssueType && i.IssueType.toLowerCase().includes(searchLower)) ||
        (i.Location && i.Location.toLowerCase().includes(searchLower)) ||
        (i.Api && i.Api.toLowerCase().includes(searchLower))
    );
  }

  const severityOrder = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
    Informational: 4,
  };

  if (sortBy === 'severity') {
    filtered.sort((a, b) => {
      const orderA = severityOrder[a.Severity] ?? 999;
      const orderB = severityOrder[b.Severity] ?? 999;
      return orderA - orderB;
    });
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => {
      const nameA = (a.IssueType || '').toLowerCase();
      const nameB = (b.IssueType || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  } else if (sortBy === 'status') {
    filtered.sort((a, b) => {
      const statusA = (a.Status || '').toLowerCase();
      const statusB = (b.Status || '').toLowerCase();
      return statusA.localeCompare(statusB);
    });
  }

  return filtered;
}

/**
 * Get status emoji badge
 * @param {string} status - Issue status
 * @returns {string} Emoji representing status
 */
export function getStatusBadge(status) {
  const badges = {
    Open: '🔴',
    InProgress: '🟡',
    Reopened: '🟠',
    Noise: '⚫',
    Passed: '🟢',
    Fixed: '✅',
  };
  return badges[status] || '⚪';
}

/**
 * Format issue as single line with badges
 * @param {Object} issue - Issue object
 * @returns {string} Formatted string with severity, status, type, location, Jira
 */
export function formatIssueForDisplay(issue) {
  const severity = getSeverityBadge(issue.Severity);
  const status = getStatusBadge(issue.Status);
  const type = issue.IssueType || 'Unknown';
  const location = issue.Location || issue.Api || issue.SourceFile || 'N/A';
  const jira = issue.ExternalId ? `[${issue.ExternalId}]` : '';

  return `${severity} ${status} ${type} - ${location} ${jira}`.trim();
}

export default {
  groupIssuesBy,
  calculateStats,
  getSeverityBadge,
  getStatusBadge,
  formatIssueForDisplay,
  SEVERITY_ORDER,
  SEVERITY_COLORS,
};
