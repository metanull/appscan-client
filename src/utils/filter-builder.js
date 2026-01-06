/**
 * Filter building utilities for CLI commands
 * Extracts common filter logic from list-issues and list-issues-by-app
 */

/**
 * Build filter options from CLI command options
 * Handles status, severity, and Jira filters
 *
 * @param {Object} options - CLI command options
 * @returns {{filterOptions: Object, hasFilters: boolean}}
 */
export function buildFilterOptions(options) {
  const filterOptions = {};
  let hasFilters = false;

  // Status filters (mutually exclusive)
  if (options.active) {
    filterOptions.statusActive = true;
    hasFilters = true;
  } else if (options.inactive) {
    filterOptions.statusInactive = true;
    hasFilters = true;
  } else if (options.pending) {
    filterOptions.statusPending = true;
    hasFilters = true;
  } else if (options.processed) {
    filterOptions.statusProcessed = true;
    hasFilters = true;
  }

  // Severity filters (mutually exclusive)
  if (options.low) {
    filterOptions.severityLow = true;
    hasFilters = true;
  } else if (options.medium) {
    filterOptions.severityMedium = true;
    hasFilters = true;
  } else if (options.high) {
    filterOptions.severityHigh = true;
    hasFilters = true;
  }

  // Jira filters (mutually exclusive)
  if (options.assigned) {
    filterOptions.jiraAssigned = true;
    hasFilters = true;
  } else if (options.unassigned) {
    filterOptions.jiraUnassigned = true;
    hasFilters = true;
  }

  return { filterOptions, hasFilters };
}

/**
 * Severity constants
 * Shared across issue rendering commands
 */
export const severityOrder = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Informational: 1,
  Unknown: 0,
};

export const severityColors = {
  Critical: 'redBright',
  High: 'red',
  Medium: 'yellow',
  Low: 'cyan',
  Informational: 'gray',
  Unknown: 'gray',
};

/**
 * Get the filter description for logging
 *
 * @param {{filterOptions: Object, hasFilters: boolean}} filterResult
 * @returns {string} Description of active filters
 */
export function getFilterDescription(filterResult) {
  const { filterOptions, hasFilters } = filterResult;

  if (!hasFilters) {
    return '';
  }

  const filters = [];

  // Status filters
  if (filterOptions.statusActive) filters.push('Active');
  if (filterOptions.statusInactive) filters.push('Inactive');
  if (filterOptions.statusPending) filters.push('Pending');
  if (filterOptions.statusProcessed) filters.push('Processed');

  // Severity filters
  if (filterOptions.severityLow) filters.push('Low');
  if (filterOptions.severityMedium) filters.push('Medium');
  if (filterOptions.severityHigh) filters.push('High');

  // Jira filters
  if (filterOptions.jiraAssigned) filters.push('With Jira');
  if (filterOptions.jiraUnassigned) filters.push('Without Jira');

  return filters.length > 0 ? ` (${filters.join(', ')})` : '';
}
