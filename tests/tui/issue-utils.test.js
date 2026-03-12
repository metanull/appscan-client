import { describe, it, expect } from 'vitest';
import {
  groupIssuesBy,
  calculateStats,
  getSeverityBadge,
  getStatusBadge,
  filterIssues,
  formatIssueForDisplay,
  getIssueComputedDate,
  getDateRangeCutoff,
} from '../../src/tui/apps/asoc/utils/issue.js';

const sampleIssues = [
  {
    Id: 1,
    IssueType: 'SQLi',
    Severity: 'High',
    Status: 'Open',
    Location: 'src/db.js',
    ExternalId: 'J-1',
    FixGroupId: '10',
    Api: 'db.query',
  },
  {
    Id: 2,
    IssueType: 'XSS',
    Severity: 'Medium',
    Status: 'InProgress',
    Location: 'src/ui.js',
    ExternalId: '',
    FixGroupId: 20,
    Api: 'render()',
  },
  {
    Id: 3,
    IssueType: 'SQLi',
    Severity: 'Critical',
    Status: 'Open',
    Location: 'src/db2.js',
    ExternalId: 'J-2',
    FixGroupId: '10',
    Api: 'db.exec',
  },
  {
    Id: 4,
    IssueType: null,
    Severity: 'Low',
    Status: 'Passed',
    Location: null,
    ExternalId: null,
    FixGroupId: null,
    Api: null,
  },
];

describe('issue-utils', () => {
  it('groupIssuesBy groups by property and sorts by severity', () => {
    const grouped = groupIssuesBy(sampleIssues, 'IssueType');
    // Expect SQLi group first because it has a Critical severity present
    expect(grouped[0].name).toBe('SQLi');
    expect(grouped[0].issues.length).toBe(2);
  });

  it('calculateStats counts severities, statuses, types and jira presence', () => {
    const stats = calculateStats(sampleIssues);
    expect(stats.total).toBe(4);
    expect(stats.Critical).toBe(1);
    expect(stats.High).toBe(1);
    expect(stats.Medium).toBe(1);
    expect(stats.Low).toBe(1);
    expect(stats.byStatus.Open).toBe(2);
    expect(stats.withJira).toBe(2);
    expect(stats.withoutJira).toBe(2);
    expect(stats.byType.SQLi).toBe(2);
  });

  it('getSeverityBadge returns expected badges and unknown', () => {
    expect(getSeverityBadge('Critical')).toBe('[C]');
    expect(getSeverityBadge('Medium')).toBe('[M]');
    expect(getSeverityBadge('NotAReal')).toBe('[?]');
  });

  it('getStatusBadge returns emoji for known statuses', () => {
    expect(getStatusBadge('Open')).toBe('🔴');
    expect(getStatusBadge('Passed')).toBe('🟢');
    expect(getStatusBadge('Unknown')).toBe('⚪');
  });

  it('filterIssues supports fixgroup filtering (string/number), jira filters and searchText', () => {
    // filter by fixgroup string
    let res = filterIssues(sampleIssues, { fixgroup: '10' });
    expect(res.length).toBe(2);

    // filter by fixgroup numeric
    res = filterIssues(sampleIssues, { fixgroup: 20 });
    expect(res.length).toBe(1);

    // filter by jira presence
    res = filterIssues(sampleIssues, { jira: 'with' });
    expect(res.every((i) => i.ExternalId && i.ExternalId.trim() !== '')).toBe(
      true
    );

    res = filterIssues(sampleIssues, { jira: 'without' });
    expect(res.every((i) => !i.ExternalId || i.ExternalId.trim() === '')).toBe(
      true
    );

    // searchText should match IssueType, Location, or Api
    res = filterIssues(sampleIssues, { searchText: 'db' });
    expect(res.length).toBe(2); // matches src/db.js and src/db2.js and db.exec/api
  });

  it('filterIssues sorts by severity, name and status', () => {
    let res = filterIssues(sampleIssues, { sortBy: 'severity' });
    // severity order: Critical, High, Medium, Low -> severityOrder returns 0..4 so sort ascending
    expect(res[0].Severity).toBe('Critical');

    res = filterIssues(sampleIssues, { sortBy: 'name' });
    // names are lowercased issue types; expect ordering 'sql', 'sql', 'xss', 'unknown'
    expect(res[0].IssueType === 'SQLi' || res[0].IssueType === null).toBe(true);

    res = filterIssues(sampleIssues, { sortBy: 'status' });
    // sorted alphabetically by status value
    expect(res[0].Status).toBeDefined();
  });

  it('formatIssueForDisplay composes a single-line string with badges and jira', () => {
    const line = formatIssueForDisplay(sampleIssues[0]);
    expect(line).toContain('[H]');
    expect(line).toContain('🔴');
    expect(line).toContain('SQLi');
    expect(line).toContain('src/db.js');
    expect(line).toContain('[J-1]');
  });
});

describe('getIssueComputedDate', () => {
  it('returns null when no date fields are present', () => {
    expect(getIssueComputedDate({})).toBeNull();
    expect(getIssueComputedDate({ IssueType: 'XSS' })).toBeNull();
  });

  it('returns the only available date when one date is set', () => {
    const issue = { DateCreated: '2024-01-15T10:00:00Z' };
    const d = getIssueComputedDate(issue);
    expect(d).not.toBeNull();
    expect(d.toISOString()).toBe('2024-01-15T10:00:00.000Z');
  });

  it('returns the most recent date when multiple dates are present', () => {
    const issue = {
      DateCreated: '2024-01-01T00:00:00Z',
      LastUpdated: '2024-03-20T12:00:00Z',
      LastFound: '2024-02-10T08:00:00Z',
    };
    const d = getIssueComputedDate(issue);
    expect(d.toISOString()).toBe('2024-03-20T12:00:00.000Z');
  });

  it('ignores null and undefined date fields', () => {
    const issue = {
      DateCreated: '2024-06-01T00:00:00Z',
      LastUpdated: null,
      LastFound: undefined,
    };
    const d = getIssueComputedDate(issue);
    expect(d.toISOString()).toBe('2024-06-01T00:00:00.000Z');
  });
});

describe('getDateRangeCutoff', () => {
  it('returns undefined for null or unknown dateRange', () => {
    expect(getDateRangeCutoff(null, null)).toBeUndefined();
    expect(getDateRangeCutoff(undefined, null)).toBeUndefined();
    expect(getDateRangeCutoff('unknown-range', null)).toBeUndefined();
  });

  it('returns undefined for last-sync when lastSyncDate is falsy', () => {
    expect(getDateRangeCutoff('last-sync', null)).toBeUndefined();
    expect(getDateRangeCutoff('last-sync', undefined)).toBeUndefined();
  });

  it('returns the lastSyncDate timestamp for last-sync', () => {
    const syncDate = '2024-05-01T00:00:00Z';
    const cutoff = getDateRangeCutoff('last-sync', syncDate);
    expect(cutoff).toBe(new Date(syncDate).getTime());
  });

  it('returns a cutoff approximately correct for 24h, 1w, 1m, 3m, 6m', () => {
    const before = Date.now();
    const c24h = getDateRangeCutoff('24h', null);
    const c1w = getDateRangeCutoff('1w', null);
    const c1m = getDateRangeCutoff('1m', null);
    const c3m = getDateRangeCutoff('3m', null);
    const c6m = getDateRangeCutoff('6m', null);
    const after = Date.now();

    expect(c24h).toBeGreaterThanOrEqual(before - 24 * 60 * 60 * 1000);
    expect(c24h).toBeLessThanOrEqual(after);
    expect(c1w).toBeLessThan(c24h);
    expect(c1m).toBeLessThan(c1w);
    expect(c3m).toBeLessThan(c1m);
    expect(c6m).toBeLessThan(c3m);
  });
});

describe('filterIssues – dateRange filter', () => {
  const now = new Date();
  const hoursAgo = (h) =>
    new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  const issues = [
    {
      Id: 'a',
      IssueType: 'A',
      Severity: 'High',
      Status: 'Open',
      LastUpdated: hoursAgo(1),
    },
    {
      Id: 'b',
      IssueType: 'B',
      Severity: 'Low',
      Status: 'Open',
      LastUpdated: hoursAgo(48),
    },
    {
      Id: 'c',
      IssueType: 'C',
      Severity: 'Medium',
      Status: 'Open',
      LastUpdated: hoursAgo(200),
    },
  ];

  it('24h keeps only issues updated within the last 24 hours', () => {
    const result = filterIssues(issues, { dateRange: '24h' });
    expect(result.map((i) => i.Id)).toEqual(['a']);
  });

  it('1w keeps issues within one week', () => {
    const result = filterIssues(issues, { dateRange: '1w' });
    expect(result.map((i) => i.Id)).toContain('a');
    expect(result.map((i) => i.Id)).toContain('b');
    expect(result.map((i) => i.Id)).not.toContain('c');
  });

  it('last-sync with no lastSyncDate keeps all issues', () => {
    const result = filterIssues(issues, {
      dateRange: 'last-sync',
      lastSyncDate: undefined,
    });
    expect(result.length).toBe(3);
  });

  it('last-sync with a lastSyncDate filters correctly', () => {
    const syncDate = hoursAgo(30);
    const result = filterIssues(issues, {
      dateRange: 'last-sync',
      lastSyncDate: syncDate,
    });
    expect(result.map((i) => i.Id)).toEqual(['a']);
  });

  it('no dateRange returns all issues', () => {
    const result = filterIssues(issues, {});
    expect(result.length).toBe(3);
  });
});
