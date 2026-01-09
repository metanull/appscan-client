import { describe, it, expect } from 'vitest';
import { QueryBuilder } from '../../src/utils/query-builder.js';

describe('QueryBuilder', () => {
  it('builds status and severity filters', () => {
    const qb = new QueryBuilder();
    qb.filterByStatus(['Open', 'Closed']).filterBySeverity(['High']);
    expect(qb.toODataFilter()).toContain("Status eq 'Open'");
    expect(qb.toODataFilter()).toContain("Severity eq 'High'");
  });

  it('escapes single quotes and handles name filters', () => {
    const qb = new QueryBuilder();
    qb.filterByName("O'Brien");
    expect(qb.toODataFilter()).toContain("contains(Name, 'O''Brien')");
  });

  it('maps date operators and external id', () => {
    const qb = new QueryBuilder();
    qb.filterByDate('>', '2025-01-01').filterByExternalId('EXT-1');
    expect(qb.toODataFilter()).toContain('DateCreated gt 2025-01-01');
    expect(qb.toODataFilter()).toContain("ExternalId eq 'EXT-1'");
  });

  it('clear and addCustomFilter work', () => {
    const qb = new QueryBuilder();
    qb.addCustomFilter("a eq b");
    expect(qb.toODataFilter()).toContain('(a eq b)');
    qb.clear();
    expect(qb.toODataFilter()).toBe('');
  });
});
