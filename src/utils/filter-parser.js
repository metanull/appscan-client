import { QueryBuilder } from './query-builder.js';

/**
 * FilterParser - Parse user-friendly filter expressions into QueryBuilder
 * Supports syntax like: "status:Open;severity:High|Critical;name:Injection"
 */
export class FilterParser {
  /**
   * Parse filter string and apply to QueryBuilder
   * @param {string} filterStr - Filter expression string
   * @param {QueryBuilder} queryBuilder - QueryBuilder instance
   * @returns {QueryBuilder} Modified query builder
   */
  static parse(filterStr, queryBuilder = new QueryBuilder()) {
    if (!filterStr || !filterStr.trim()) {
      return queryBuilder;
    }

    // Split by semicolon for AND conditions
    const andConditions = filterStr
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const condition of andConditions) {
      this.parseCondition(condition, queryBuilder);
    }

    return queryBuilder;
  }

  /**
   * Parse a single condition (may contain OR via pipe)
   * @private
   */
  static parseCondition(condition, queryBuilder) {
    if (!condition.includes(':')) {
      // Invalid format, skip
      return;
    }

    const [key, valueExpr] = condition.split(':', 2).map((s) => s.trim());

    // Split by pipe for OR conditions
    const values = valueExpr
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);

    switch (key.toLowerCase()) {
      case 'status':
        queryBuilder.filterByStatus(values);
        break;
      case 'severity':
        queryBuilder.filterBySeverity(values);
        break;
      case 'name':
        // For name, only use first value (substring match)
        queryBuilder.filterByName(values[0]);
        break;
      case 'issuetype':
      case 'issue-type':
      case 'type':
        queryBuilder.filterByIssueType(values[0]);
        break;
      case 'externalid':
      case 'external-id':
        queryBuilder.filterByExternalId(values[0]);
        break;
      case 'date':
        // Format: date:>2025-12-01 or date:<2025-12-01
        this.parseDateCondition(valueExpr, queryBuilder);
        break;
      default:
        // Unknown filter key, ignore
        break;
    }
  }

  /**
   * Parse date condition with operator
   * @private
   */
  static parseDateCondition(expr, queryBuilder) {
    // Match operator and date
    const match = expr.match(/^([><=]+)(.+)$/);
    if (match) {
      const [, operator, dateStr] = match;
      queryBuilder.filterByDate(operator, dateStr.trim());
    }
  }
}
