import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../../src/tui/apps/asoc/state/AppContext.js';

// Helper to reset the store to known state before each test
beforeEach(() => {
  useStore.setState({
    issues: [],
    articleCache: {},
    commentsCache: {},
    selectedIssueIds: [],
    listCursor: 0,
    filterStatus: null,
    filterSeverity: null,
    filterIssueType: null,
    filterJira: null,
    filterFixGroup: null,
    searchText: null,
    sortBy: 'severity',
    filterDateRange: null,
    lastSyncDate: null,
  });
});

describe('AppContext store - cache and filtering helpers', () => {
  it('setArticleCache and setCommentsCache store entries with timestamp and content', () => {
    useStore.getState().setArticleCache('1', 'content');
    useStore.getState().setCommentsCache('2', [{ id: 'c' }]);

    const s = useStore.getState();
    expect(s.articleCache['1'].content).toBe('content');
    expect(typeof s.articleCache['1'].timestamp).toBe('number');

    expect(s.commentsCache['2'].comments).toEqual([{ id: 'c' }]);
    expect(typeof s.commentsCache['2'].timestamp).toBe('number');
  });

  it('invalidateCacheForIssue removes entries and clearAllCaches clears everything', () => {
    useStore.getState().setArticleCache('1', 'c');
    useStore.getState().setCommentsCache('1', [{ id: 1 }]);

    expect(useStore.getState().articleCache['1']).toBeDefined();
    expect(useStore.getState().commentsCache['1']).toBeDefined();

    useStore.getState().invalidateCacheForIssue('1');

    expect(useStore.getState().articleCache['1']).toBeUndefined();
    expect(useStore.getState().commentsCache['1']).toBeUndefined();

    // clearAllCaches
    useStore.getState().setArticleCache('2', 'c2');
    useStore.getState().setCommentsCache('2', [{ id: 2 }]);
    useStore.getState().clearAllCaches();
    expect(Object.keys(useStore.getState().articleCache).length).toBe(0);
    expect(Object.keys(useStore.getState().commentsCache).length).toBe(0);
  });

  it('getFilteredIssues respects fixGroup numeric/string, jira filters and searchText', () => {
    const issues = [
      {
        Id: '1',
        IssueType: 'A',
        Severity: 'High',
        ExternalId: 'J-1',
        FixGroupId: '10',
        Location: 'server',
      },
      {
        Id: '2',
        IssueType: 'B',
        Severity: 'Low',
        ExternalId: '',
        FixGroupId: 20,
        Location: 'client',
      },
      {
        Id: '3',
        IssueType: 'A',
        Severity: 'Critical',
        ExternalId: 'J-2',
        FixGroupId: '10',
        Location: 'db',
      },
    ];

    useStore.getState().setIssues(issues);

    // fixGroup string
    useStore.getState().setFilterFixGroup('10');
    let res = useStore.getState().getFilteredIssues();
    expect(res.length).toBe(2);

    // fixGroup numeric
    useStore.getState().setFilterFixGroup(20);
    res = useStore.getState().getFilteredIssues();
    expect(res.length).toBe(1);

    // jira filters
    useStore.getState().setFilterFixGroup(null);
    useStore.getState().setFilterJira('with');
    res = useStore.getState().getFilteredIssues();
    expect(res.length).toBe(2);

    useStore.getState().setFilterJira('without');
    res = useStore.getState().getFilteredIssues();
    expect(res.length).toBe(1);

    // searchText matching Location
    useStore.getState().setFilterJira(null);
    useStore.getState().setSearchText('db');
    res = useStore.getState().getFilteredIssues();
    expect(res.length).toBe(1);
  });

  it('selectAllIssues selects all currently filtered issue ids and toggleIssueSelection toggles correctly', () => {
    const issues = [
      { Id: '1', IssueType: 'A', Severity: 'High' },
      { Id: '2', IssueType: 'B', Severity: 'Low' },
    ];
    useStore.getState().setIssues(issues);

    // Select all
    useStore.getState().selectAllIssues();
    expect(useStore.getState().selectedIssueIds).toEqual(['1', '2']);

    // toggle removes
    useStore.getState().toggleIssueSelection('1');
    expect(useStore.getState().selectedIssueIds).toEqual(['2']);

    // toggle adds back
    useStore.getState().toggleIssueSelection('1');
    expect(useStore.getState().selectedIssueIds.sort()).toEqual(['1', '2']);
  });

  it('setFilterDateRange stores the value and clearFilters resets it', () => {
    useStore.getState().setFilterDateRange('24h');
    expect(useStore.getState().filterDateRange).toBe('24h');

    useStore.getState().clearFilters();
    expect(useStore.getState().filterDateRange).toBeNull();
  });

  it('setLastSyncDate persists the timestamp', () => {
    const ts = new Date().toISOString();
    useStore.getState().setLastSyncDate(ts);
    expect(useStore.getState().lastSyncDate).toBe(ts);
  });

  it('hasActiveFilters returns true when filterDateRange is set', () => {
    expect(useStore.getState().hasActiveFilters()).toBe(false);
    useStore.getState().setFilterDateRange('1w');
    expect(useStore.getState().hasActiveFilters()).toBe(true);
    useStore.getState().clearFilters();
    expect(useStore.getState().hasActiveFilters()).toBe(false);
  });

  it('getFilteredIssues applies dateRange filter', () => {
    const now = new Date();
    const hoursAgo = (h) =>
      new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
    const issues = [
      { Id: '1', Severity: 'High', LastUpdated: hoursAgo(1) },
      { Id: '2', Severity: 'Low', LastUpdated: hoursAgo(48) },
    ];
    useStore.getState().setIssues(issues);
    useStore.getState().setFilterDateRange('24h');
    const filtered = useStore.getState().getFilteredIssues();
    expect(filtered.map((i) => i.Id)).toEqual(['1']);
  });
});
