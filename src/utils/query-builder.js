/**
 * QueryBuilder - Construct OData filter expressions for AppScan API
 */
export class QueryBuilder {
  constructor() {
    this.filters = [];
  }

  /**
   * Add a filter by status
   * @param {string[]} statuses - Array of status values
   */
  filterByStatus(statuses) {
    if (!statuses || statuses.length === 0) return this;
    const conditions = statuses.map((s) => `Status eq '${s}'`).join(' or ');
    this.filters.push(`(${conditions})`);
    return this;
  }

  /**
   * Add a filter by severity
   * @param {string[]} severities - Array of severity values
   */
  filterBySeverity(severities) {
    if (!severities || severities.length === 0) return this;
    const conditions = severities.map((s) => `Severity eq '${s}'`).join(' or ');
    this.filters.push(`(${conditions})`);
    return this;
  }

  /**
   * Add a filter by name (substring match)
   * @param {string} name - Name pattern to match
   */
  filterByName(name) {
    if (!name) return this;
    // OData contains function for substring matching
    this.filters.push(`contains(Name, '${this.escapeString(name)}')`);
    return this;
  }

  /**
   * Add a filter by issue type name
   * @param {string} issueType - Issue type pattern to match
   */
  filterByIssueType(issueType) {
    if (!issueType) return this;
    this.filters.push(`contains(IssueType, '${this.escapeString(issueType)}')`);
    return this;
  }

  /**
   * Add a filter by date
   * @param {string} operator - Comparison operator (>, <, >=, <=, ==)
   * @param {Date|string} date - Date to compare
   * @param {string} field - Date field name (default: DateCreated)
   */
  filterByDate(operator, date, field = 'DateCreated') {
    if (!operator || !date) return this;
    const dateStr = date instanceof Date ? date.toISOString() : date;
    const odataOp = this.mapOperator(operator);
    this.filters.push(`${field} ${odataOp} ${dateStr}`);
    return this;
  }

  /**
   * Add a filter by external ID
   * @param {string} externalId - External ID to match
   */
  filterByExternalId(externalId) {
    if (!externalId) return this;
    this.filters.push(`ExternalId eq '${this.escapeString(externalId)}'`);
    return this;
  }

  /**
   * Add a filter by application ID
   * @param {string} appId - Application ID
   */
  filterByAppId(appId) {
    if (!appId) return this;
    // AppId is typically a GUID string, so quote it for safety
    this.filters.push(`AppId eq '${this.escapeString(appId)}'`);
    return this;
  }

  /**
   * Add a custom OData filter expression
   * @param {string} expression - Raw OData filter expression
   */
  addCustomFilter(expression) {
    if (!expression) return this;
    this.filters.push(`(${expression})`);
    return this;
  }

  /**
   * Build the final OData filter string
   * @returns {string} OData filter expression
   */
  toODataFilter() {
    if (this.filters.length === 0) return '';
    return this.filters.join(' and ');
  }

  /**
   * Clear all filters
   */
  clear() {
    this.filters = [];
    return this;
  }

  /**
   * Map comparison operators to OData equivalents
   * @private
   */
  mapOperator(operator) {
    const map = {
      '>': 'gt',
      '<': 'lt',
      '>=': 'ge',
      '<=': 'le',
      '==': 'eq',
      '=': 'eq',
    };
    return map[operator] || 'eq';
  }

  /**
   * Escape single quotes in strings for OData
   * @private
   */
  escapeString(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
  }
}
