import { FilterParser } from '../../src/utils/filter-parser.js';
import { QueryBuilder } from '../../src/utils/query-builder.js';

describe('FilterParser', () => {
  test('parse status filter', () => {
    const qb = FilterParser.parse('status:Open', new QueryBuilder());
    const filter = qb.toODataFilter();
    expect(filter).toBe("(Status eq 'Open')");
  });

  test('parse severity filter with multiple values', () => {
    const qb = FilterParser.parse('severity:High|Critical', new QueryBuilder());
    const filter = qb.toODataFilter();
    expect(filter).toBe("(Severity eq 'High' or Severity eq 'Critical')");
  });

  test('parse combined filters with semicolon', () => {
    const qb = FilterParser.parse(
      'status:Open;severity:High',
      new QueryBuilder()
    );
    const filter = qb.toODataFilter();
    expect(filter).toContain("Status eq 'Open'");
    expect(filter).toContain("Severity eq 'High'");
    expect(filter).toContain(' and ');
  });

  test('parse name filter', () => {
    const qb = FilterParser.parse('name:Injection', new QueryBuilder());
    const filter = qb.toODataFilter();
    expect(filter).toBe("contains(Name, 'Injection')");
  });

  test('parse date filter with operator', () => {
    const qb = FilterParser.parse('date:>2025-12-01', new QueryBuilder());
    const filter = qb.toODataFilter();
    expect(filter).toContain('DateCreated gt 2025-12-01');
  });

  test('parse external-id filter', () => {
    const qb = FilterParser.parse('external-id:SEC-123', new QueryBuilder());
    const filter = qb.toODataFilter();
    expect(filter).toBe("ExternalId eq 'SEC-123'");
  });

  test('parse type filter', () => {
    const qb = FilterParser.parse('type:SQL', new QueryBuilder());
    const filter = qb.toODataFilter();
    expect(filter).toBe("contains(IssueType, 'SQL')");
  });

  test('empty filter string returns empty filter', () => {
    const qb = FilterParser.parse('', new QueryBuilder());
    const filter = qb.toODataFilter();
    expect(filter).toBe('');
  });

  test('ignore invalid filter format', () => {
    const qb = FilterParser.parse('invalid filter', new QueryBuilder());
    const filter = qb.toODataFilter();
    expect(filter).toBe('');
  });

  test('complex filter with multiple conditions', () => {
    const qb = FilterParser.parse(
      'status:Open|InProgress;severity:High|Critical;name:SQL',
      new QueryBuilder()
    );
    const filter = qb.toODataFilter();
    expect(filter).toContain("Status eq 'Open' or Status eq 'InProgress'");
    expect(filter).toContain("Severity eq 'High' or Severity eq 'Critical'");
    expect(filter).toContain("contains(Name, 'SQL')");
  });
});
