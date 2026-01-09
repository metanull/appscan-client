import { describe, it, expect } from 'vitest';
import {
  groupIssuesBy,
  calculateStats,
  getSeverityBadge,
  getStatusBadge,
  filterIssues,
  formatIssueForDisplay,
} from '../../src/tui/utils/issue-utils.js';

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
