import { QueryBuilder } from '../../src/utils/query-builder.js';

describe('QueryBuilder', () => {
  test('filterByStatus builds correct OData filter', () => {
    const qb = new QueryBuilder();
    qb.filterByStatus(['Open', 'InProgress']);
    const filter = qb.toODataFilter();
    expect(filter).toBe("(Status eq 'Open' or Status eq 'InProgress')");
  });

  test('filterBySeverity builds correct OData filter', () => {
    const qb = new QueryBuilder();
    qb.filterBySeverity(['High', 'Critical']);
    const filter = qb.toODataFilter();
    expect(filter).toBe("(Severity eq 'High' or Severity eq 'Critical')");
  });

  test('filterByName builds correct OData filter with contains', () => {
    const qb = new QueryBuilder();
    qb.filterByName('Injection');
    const filter = qb.toODataFilter();
    expect(filter).toBe("contains(Name, 'Injection')");
  });

  test('filterByDate with > operator', () => {
    const qb = new QueryBuilder();
    qb.filterByDate('>', '2025-12-01');
    const filter = qb.toODataFilter();
    expect(filter).toContain('DateCreated gt 2025-12-01');
  });

  test('filterByDate with < operator', () => {
    const qb = new QueryBuilder();
    qb.filterByDate('<', '2025-12-31');
    const filter = qb.toODataFilter();
    expect(filter).toContain('DateCreated lt 2025-12-31');
  });

  test('multiple filters combined with AND', () => {
    const qb = new QueryBuilder();
    qb.filterByStatus(['Open']);
    qb.filterBySeverity(['High']);
    const filter = qb.toODataFilter();
    expect(filter).toBe("(Status eq 'Open') and (Severity eq 'High')");
  });

  test('escapeString escapes single quotes', () => {
    const qb = new QueryBuilder();
    const escaped = qb.escapeString("O'Reilly");
    expect(escaped).toBe("O''Reilly");
  });

  test('clear removes all filters', () => {
    const qb = new QueryBuilder();
    qb.filterByStatus(['Open']);
    qb.clear();
    const filter = qb.toODataFilter();
    expect(filter).toBe('');
  });

  test('empty QueryBuilder returns empty string', () => {
    const qb = new QueryBuilder();
    const filter = qb.toODataFilter();
    expect(filter).toBe('');
  });

  test('filterByExternalId builds correct filter', () => {
    const qb = new QueryBuilder();
    qb.filterByExternalId('SEC-123');
    const filter = qb.toODataFilter();
    expect(filter).toBe("ExternalId eq 'SEC-123'");
  });

  test('filterByAppId builds correct filter', () => {
    const qb = new QueryBuilder();
    qb.filterByAppId('app-123');
    const filter = qb.toODataFilter();
    expect(filter).toBe("AppId eq 'app-123'");
  });

  test('addCustomFilter adds raw expression', () => {
    const qb = new QueryBuilder();
    qb.addCustomFilter("contains(Description, 'test')");
    const filter = qb.toODataFilter();
    expect(filter).toBe("(contains(Description, 'test'))");
  });

  test('mapOperator converts comparison operators', () => {
    const qb = new QueryBuilder();
    expect(qb.mapOperator('>')).toBe('gt');
    expect(qb.mapOperator('<')).toBe('lt');
    expect(qb.mapOperator('>=')).toBe('ge');
    expect(qb.mapOperator('<=')).toBe('le');
    expect(qb.mapOperator('==')).toBe('eq');
    expect(qb.mapOperator('=')).toBe('eq');
  });
});
