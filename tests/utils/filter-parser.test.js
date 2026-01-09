import { describe, it, expect, vi } from 'vitest';
import { FilterParser } from '../../src/utils/filter-parser.js';

const makeQB = () => ({
  calls: [],
  filterByStatus(v) {
    this.calls.push(['status', v]);
  },
  filterBySeverity(v) {
    this.calls.push(['severity', v]);
  },
  filterByName(v) {
    this.calls.push(['name', v]);
  },
  filterByIssueType(v) {
    this.calls.push(['type', v]);
  },
  filterByExternalId(v) {
    this.calls.push(['external', v]);
  },
  filterByDate(op, date) {
    this.calls.push(['date', op, date]);
  },
};

describe('FilterParser', () => {
  it('ignores empty filters', () => {
    const qb = makeQB();
    const result = FilterParser.parse('', qb);
    expect(result).toBe(qb);
    expect(qb.calls.length).toBe(0);
  });

  it('parses status and severity with ORs', () => {
    const qb = makeQB();
    FilterParser.parse('status:Open|Closed;severity:High|Critical', qb);
    expect(qb.calls).toEqual([
      ['status', ['Open', 'Closed']],
      ['severity', ['High', 'Critical']],
    ]);
  });

  it('parses name and issue type and external id', () => {
    const qb = makeQB();
    FilterParser.parse('name:Injection;issuetype:SQL;external-id:ABC-1', qb);
    expect(qb.calls).toEqual([
      ['name', 'Injection'],
      ['type', 'SQL'],
      ['external', 'ABC-1'],
    ]);
  });

  it('parses date conditions with operator', () => {
    const qb = makeQB();
    FilterParser.parse('date:>2025-01-01', qb);
    expect(qb.calls).toEqual([['date', '>', '2025-01-01']]);
  });
});
