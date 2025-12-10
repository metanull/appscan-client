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
 * Group issues by a specific property
 */
export function groupIssuesBy(issues, property = 'IssueType') {
  const grouped = {};

  issues.forEach(issue => {
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

  // Sort groups by severity
  return Object.values(grouped).sort((a, b) => {
    return (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0);
  });
}

/**
 * Calculate issue statistics
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

  issues.forEach(issue => {
    // Count by severity
    const severity = issue.Severity || 'Unknown';
    if (stats[severity] !== undefined) {
      stats[severity]++;
    }

    // Count by status
    const status = issue.Status || 'Unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    // Count by type
    const type = issue.IssueType || 'Unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Count Jira presence
    if (issue.ExternalId && issue.ExternalId.trim() !== '') {
      stats.withJira++;
    } else {
      stats.withoutJira++;
    }
  });

  return stats;
}

/**
 * Get severity badge text
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
 * Get status badge text
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
 * Format issue for display
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
