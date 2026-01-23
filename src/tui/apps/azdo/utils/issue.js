/**
 * Utility functions for Azure DevOps alert grouping and statistics
 */

export const SEVERITY_ORDER = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Note: 1,
  Warning: 1,
  Error: 4,
  Undefined: 0,
};

export const SEVERITY_COLORS = {
  Critical: 'redBright',
  High: 'red',
  Medium: 'yellow',
  Low: 'blue',
  Note: 'gray',
  Warning: 'yellow',
  Error: 'red',
  Undefined: 'gray',
};

export const ALERT_TYPE_NAMES = {
  0: 'Unknown',
  1: 'Dependency',
  2: 'Secret',
  3: 'Code',
  4: 'License',
};

export const SEVERITY_NAMES = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
  3: 'Critical',
  4: 'Note',
  5: 'Warning',
  6: 'Error',
  7: 'Undefined',
};

export const STATE_NAMES = {
  0: 'Unknown',
  1: 'Active',
  2: 'Dismissed',
  4: 'Fixed',
  8: 'AutoDismissed',
};

export const DISMISSAL_TYPE_NAMES = {
  0: 'Unknown',
  1: 'Fixed',
  2: 'AcceptedRisk',
  3: 'FalsePositive',
  4: 'AgreedToGuidance',
  5: 'ToolUpgrade',
};

/**
 * Computed status values mapping Azure DevOps state+dismissalType to ASOC-like status
 */
export const COMPUTED_STATUS = {
  Open: 'Open',
  InProgress: 'InProgress',
  Passed: 'Passed',
  Noise: 'Noise',
  Fixed: 'Fixed',
};

export const COMPUTED_STATUS_COLORS = {
  Open: 'red',
  InProgress: 'yellow',
  Passed: 'green',
  Noise: 'gray',
  Fixed: 'green',
};

/**
 * Compute ASOC-equivalent status from Azure DevOps state and dismissalType
 * Mapping:
 * - Active + null => "Open"
 * - Dismissed + Unknown (0) => "InProgress"
 * - Dismissed + AcceptedRisk (2) => "Passed"
 * - Dismissed + FalsePositive (3) => "Noise"
 * - Dismissed + Fixed (1) or ToolUpgrade (5) or AgreedToGuidance (4) => "Fixed"
 * - Fixed + null => "Fixed"
 * - Anything else => ""
 * @param {Object} alert - Alert object with state and dismissal properties
 * @returns {string} Computed status name
 */
export function getComputedStatus(alert) {
  const state = alert.state;
  const dismissalType = alert.dismissal?.dismissalType;

  // State 1 = Active
  if (state === 1) {
    return COMPUTED_STATUS.Open;
  }

  // State 2 = Dismissed
  if (state === 2) {
    if (dismissalType === 0) {
      return COMPUTED_STATUS.InProgress;
    }
    if (dismissalType === 2) {
      return COMPUTED_STATUS.Passed;
    }
    if (dismissalType === 3) {
      return COMPUTED_STATUS.Noise;
    }
    if (dismissalType === 1 || dismissalType === 4 || dismissalType === 5) {
      return COMPUTED_STATUS.Fixed;
    }
  }

  // State 4 = Fixed
  if (state === 4) {
    return COMPUTED_STATUS.Fixed;
  }

  return '';
}

/**
 * Get human-readable alert type name
 * @param {number} alertType - Alert type enum value
 * @returns {string} Alert type name
 */
export function getAlertTypeName(alertType) {
  return ALERT_TYPE_NAMES[alertType] || 'Unknown';
}

/**
 * Get human-readable severity name
 * @param {number} severity - Severity enum value
 * @returns {string} Severity name
 */
export function getSeverityName(severity) {
  return SEVERITY_NAMES[severity] || 'Undefined';
}

/**
 * Get human-readable state name
 * @param {number} state - State enum value
 * @returns {string} State name
 */
export function getStateName(state) {
  return STATE_NAMES[state] || 'Unknown';
}

/**
 * Get human-readable dismissal type name
 * @param {number} dismissalType - Dismissal type enum value
 * @returns {string} Dismissal type name
 */
export function getDismissalTypeName(dismissalType) {
  return DISMISSAL_TYPE_NAMES[dismissalType] || 'Unknown';
}

/**
 * Validity result enum names for validation fingerprints
 */
export const VALIDITY_RESULT_NAMES = {
  0: 'None',
  1: 'Exploitable',
  2: 'NotExploitable',
  3: 'Inconclusive',
  4: 'ValidationNotSupported',
  5: 'TransientError',
};

/**
 * Colors for validity result display
 */
export const VALIDITY_RESULT_COLORS = {
  0: 'gray', // None
  1: 'red', // Exploitable
  2: 'green', // NotExploitable
  3: 'yellow', // Inconclusive
  4: 'gray', // ValidationNotSupported
  5: 'yellow', // TransientError
};

/**
 * Get human-readable validity result name
 * @param {number} validityResult - Validity result enum value
 * @returns {string} Validity result name
 */
export function getValidityResultName(validityResult) {
  return VALIDITY_RESULT_NAMES[validityResult] || 'Unknown';
}

/**
 * Get color for validity result display
 * @param {number} validityResult - Validity result enum value
 * @returns {string} Color name
 */
export function getValidityResultColor(validityResult) {
  return VALIDITY_RESULT_COLORS[validityResult] || 'white';
}

/**
 * Get distinct file paths from alert physical locations
 * @param {Object} alert - Alert object
 * @returns {string[]} Array of distinct file paths
 */
export function getDistinctFilePaths(alert) {
  if (!alert?.physicalLocations || alert.physicalLocations.length === 0) {
    return [];
  }
  const distinctFiles = new Set();
  for (const loc of alert.physicalLocations) {
    if (loc.filePath) {
      distinctFiles.add(loc.filePath);
    }
  }
  return Array.from(distinctFiles);
}

/**
 * Group alerts by property and sort by severity
 * @param {Array} alerts - Alerts to group
 * @param {string} property - Property to group by (default: alertType)
 * @returns {Array<{name: string, severity: string, alerts: Array}>} Grouped alerts
 */
export function groupAlertsBy(alerts, property = 'alertType') {
  const grouped = {};

  alerts.forEach((alert) => {
    let key = alert[property];
    if (property === 'alertType') {
      key = getAlertTypeName(alert[property]);
    } else if (property === 'severity') {
      key = getSeverityName(alert[property]);
    } else if (property === 'state') {
      key = getStateName(alert[property]);
    }

    const keyStr = String(key || 'Unknown');

    if (!grouped[keyStr]) {
      grouped[keyStr] = {
        name: keyStr,
        severity: getSeverityName(alert.severity),
        alerts: [],
      };
    }
    grouped[keyStr].alerts.push(alert);
  });

  return Object.values(grouped).sort((a, b) => {
    return (
      (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0)
    );
  });
}

/**
 * Calculate comprehensive alert statistics
 * @param {Array} alerts - Alerts to analyze
 * @returns {Object} Stats including counts by severity, state, type, and Jira presence
 */
export function calculateStats(alerts) {
  const stats = {
    total: alerts.length,
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Note: 0,
    byState: {},
    byType: {},
    withJira: 0,
    withoutJira: 0,
  };

  alerts.forEach((alert) => {
    const severityName = getSeverityName(alert.severity);
    if (stats[severityName] !== undefined) {
      stats[severityName]++;
    }

    const stateName = getStateName(alert.state);
    stats.byState[stateName] = (stats.byState[stateName] || 0) + 1;

    const typeName = getAlertTypeName(alert.alertType);
    stats.byType[typeName] = (stats.byType[typeName] || 0) + 1;

    // Check if alert has Jira ID in metadata
    const metadata = parseAlertMetadata(alert);
    if (metadata.jiraId) {
      stats.withJira++;
    } else {
      stats.withoutJira++;
    }
  });

  return stats;
}

/**
 * Get severity badge for display
 * @param {number|string} severity - Severity level (enum value or name)
 * @returns {string} Badge like [C], [H], [M], [L], [N]
 */
export function getSeverityBadge(severity) {
  const severityName =
    typeof severity === 'number' ? getSeverityName(severity) : severity;

  const badges = {
    Critical: '[C]',
    High: '[H]',
    Medium: '[M]',
    Low: '[L]',
    Note: '[N]',
    Warning: '[W]',
    Error: '[E]',
    Undefined: '[?]',
  };
  return badges[severityName] || '[?]';
}

/**
 * Get state badge for display
 * @param {number|string} state - State (enum value or name)
 * @returns {string} Emoji representing state
 */
export function getStateBadge(state) {
  const stateName = typeof state === 'number' ? getStateName(state) : state;

  const badges = {
    Active: '🔴',
    Dismissed: '⚫',
    Fixed: '✅',
    AutoDismissed: '🔵',
    Unknown: '⚪',
  };
  return badges[stateName] || '⚪';
}

/**
 * Parse metadata from alert comment (Jira ID and custom fields stored as JSON)
 * @param {Object} alert - Alert object
 * @returns {Object} Parsed metadata { jiraId, customFields }
 */
export function parseAlertMetadata(alert) {
  const metadata = {
    jiraId: null,
    customFields: {},
  };

  if (!alert.dismissal || !alert.dismissal.message) {
    return metadata;
  }

  try {
    // Look for [METADATA]...[/METADATA] tags
    const match = alert.dismissal.message.match(
      /\[METADATA\](.*?)\[\/METADATA\]/s
    );
    if (match) {
      const parsed = JSON.parse(match[1]);
      if (parsed.jiraId) {
        metadata.jiraId = parsed.jiraId;
      }
      if (parsed.customFields) {
        metadata.customFields = parsed.customFields;
      }
    }
  } catch {
    // Not valid metadata, ignore
  }

  return metadata;
}

/**
 * Filter and sort alerts based on criteria
 * @param {Array} alerts - List of alerts
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered and sorted alerts
 */
export function filterIssues(alerts, filters = {}) {
  const {
    state,
    severity,
    alertType,
    jira,
    searchText,
    sortBy = 'severity',
    status,
  } = filters;

  let filtered = [...alerts];

  // Filter by computed status first (if specified)
  if (status !== undefined && status !== null) {
    filtered = filtered.filter((a) => getComputedStatus(a) === status);
  }

  if (state !== undefined && state !== null) {
    const stateValue = typeof state === 'number' ? state : parseInt(state, 10);
    filtered = filtered.filter((a) => a.state === stateValue);
  }

  if (severity !== undefined && severity !== null) {
    const severityValue =
      typeof severity === 'number' ? severity : parseInt(severity, 10);
    filtered = filtered.filter((a) => a.severity === severityValue);
  }

  if (alertType !== undefined && alertType !== null) {
    const typeValue =
      typeof alertType === 'number' ? alertType : parseInt(alertType, 10);
    filtered = filtered.filter((a) => a.alertType === typeValue);
  }

  if (jira === 'with') {
    filtered = filtered.filter((a) => {
      const metadata = parseAlertMetadata(a);
      return !!metadata.jiraId;
    });
  } else if (jira === 'without') {
    filtered = filtered.filter((a) => {
      const metadata = parseAlertMetadata(a);
      return !metadata.jiraId;
    });
  }

  if (searchText) {
    const searchLower = searchText.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(searchLower)) ||
        (a.ruleName && a.ruleName.toLowerCase().includes(searchLower)) ||
        (a.physicalLocation?.filePath &&
          a.physicalLocation.filePath.toLowerCase().includes(searchLower))
    );
  }

  const severityOrder = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
    Note: 4,
    Warning: 4,
    Error: 1,
    Undefined: 5,
  };

  if (sortBy === 'severity') {
    filtered.sort((a, b) => {
      const nameA = getSeverityName(a.severity);
      const nameB = getSeverityName(b.severity);
      const orderA = severityOrder[nameA] ?? 999;
      const orderB = severityOrder[nameB] ?? 999;
      return orderA - orderB;
    });
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => {
      const nameA = (a.title || a.ruleName || '').toLowerCase();
      const nameB = (b.title || b.ruleName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  } else if (sortBy === 'state') {
    filtered.sort((a, b) => {
      const stateA = getStateName(a.state).toLowerCase();
      const stateB = getStateName(b.state).toLowerCase();
      return stateA.localeCompare(stateB);
    });
  } else if (sortBy === 'type') {
    filtered.sort((a, b) => {
      const typeA = getAlertTypeName(a.alertType).toLowerCase();
      const typeB = getAlertTypeName(b.alertType).toLowerCase();
      return typeA.localeCompare(typeB);
    });
  }

  return filtered;
}

/**
 * Format alert as single line with badges
 * @param {Object} alert - Alert object
 * @returns {string} Formatted string with severity, state, type, title, Jira
 */
export function formatAlertForDisplay(alert) {
  const severity = getSeverityBadge(alert.severity);
  const state = getStateBadge(alert.state);
  const type = getAlertTypeName(alert.alertType);
  const title = alert.title || alert.ruleName || 'Unknown';
  const metadata = parseAlertMetadata(alert);
  const jira = metadata.jiraId ? `[${metadata.jiraId}]` : '';

  return `${severity} ${state} ${type} - ${title} ${jira}`.trim();
}
