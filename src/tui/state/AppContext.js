import { create } from 'zustand';

/**
 * Global application state store using Zustand
 * Manages selection, filters, navigation, and UI state
 */
export const useStore = create((set, get) => ({
  // Navigation state
  view: 'app-selection', // 'app-selection' | 'scan-selection' | 'issue-list' | 'issue-details'
  selectedApp: null,
  selectedScan: null,
  selectedIssue: null,

  // Data
  applications: [],
  scans: [],
  issues: [],
  issueDetails: null,
  articleContent: null,

  // Cache
  articleCache: {}, // { [issueId]: { content, timestamp } }
  commentsCache: {}, // { [issueId]: { comments, timestamp } }

  // Multi-select state
  selectedIssueIds: [],

  // Filter state
  filterStatus: null,
  filterSeverity: null,
  filterIssueType: null,
  filterJira: null, // 'with' | 'without' | null
  searchText: null,
  sortBy: 'severity', // 'severity' | 'name' | 'status'
  scanSearchText: null,
  scanFilterType: null, // 'SAST' | 'DAST' | etc.
  hideEmptyScans: true,
  
  // Filter preset (for server-side filtering)
  filterPreset: null, // 'active' | 'inactive' | 'pending' | 'processed' | 'low' | 'medium' | 'high' | 'assigned' | 'unassigned' | null

  // UI state
  loading: false,
  error: null,
  showHelp: false,
  showJiraPanel: false,

  // List navigation
  listCursor: 0,
  appSelectionCursor: 0, // Saved cursor position for app selection list
  scanSelectionCursor: 0, // Saved cursor position for scan selection list

  // Actions - Navigation
  setView: (view) => set({ view, listCursor: 0 }),

  setSelectedApp: (app) =>
    set({
      selectedApp: app,
      selectedScan: null,
      selectedIssue: null,
      scans: [],
      issues: [],
      selectedIssueIds: [],
      appSelectionCursor: get().listCursor, // Save current cursor position
    }),

  setSelectedScan: (scan) =>
    set({
      selectedScan: scan,
      selectedIssue: null,
      issues: [],
      selectedIssueIds: [],
      scanSelectionCursor: get().listCursor, // Save current cursor position
    }),

  setSelectedIssue: (issue) => set({ selectedIssue: issue }),

  goBack: () => {
    const { view, appSelectionCursor, scanSelectionCursor } = get();
    if (view === 'issue-details') {
      set({ view: 'issue-list', selectedIssue: null, articleContent: null });
    } else if (view === 'issue-list') {
      set({
        view: 'scan-selection',
        selectedScan: null,
        issues: [],
        selectedIssueIds: [],
        listCursor: scanSelectionCursor, // Restore saved scan selection cursor
      });
    } else if (view === 'scan-selection') {
      set({
        view: 'app-selection',
        selectedApp: null,
        scans: [],
        listCursor: appSelectionCursor, // Restore saved app selection cursor
      });
    }
  },

  // Actions - Data
  setApplications: (applications) => set({ applications }),
  setScans: (scans) => set({ scans }),
  setIssues: (issues) => set({ issues, listCursor: 0 }),
  setIssueDetails: (issueDetails) => set({ issueDetails }),
  setArticleContent: (articleContent) => set({ articleContent }),

  // Actions - Cache
  setArticleCache: (issueId, content) =>
    set((state) => ({
      articleCache: {
        ...state.articleCache,
        [issueId]: { content, timestamp: Date.now() },
      },
    })),

  setCommentsCache: (issueId, comments) =>
    set((state) => ({
      commentsCache: {
        ...state.commentsCache,
        [issueId]: { comments, timestamp: Date.now() },
      },
    })),

  invalidateCacheForIssue: (issueId) =>
    set((state) => {
      const newArticleCache = { ...state.articleCache };
      const newCommentsCache = { ...state.commentsCache };
      delete newArticleCache[issueId];
      delete newCommentsCache[issueId];
      return {
        articleCache: newArticleCache,
        commentsCache: newCommentsCache,
      };
    }),

  clearAllCaches: () =>
    set({
      articleCache: {},
      commentsCache: {},
    }),

  // Actions - Multi-select
  toggleIssueSelection: (issueId) => {
    const { selectedIssueIds } = get();
    const isSelected = selectedIssueIds.includes(issueId);
    set({
      selectedIssueIds: isSelected
        ? selectedIssueIds.filter((id) => id !== issueId)
        : [...selectedIssueIds, issueId],
    });
  },

  selectAllIssues: () => {
    const filteredIssues = get().getFilteredIssues();
    set({ selectedIssueIds: filteredIssues.map((i) => i.Id) });
  },

  selectNone: () => set({ selectedIssueIds: [] }),

  invertSelection: () => {
    const filteredIssues = get().getFilteredIssues();
    const { selectedIssueIds } = get();
    const allIds = filteredIssues.map((i) => i.Id);
    const newSelection = allIds.filter((id) => !selectedIssueIds.includes(id));
    set({ selectedIssueIds: newSelection });
  },

  clearSelection: () => set({ selectedIssueIds: [] }),

  // Actions - Filters
  setFilterStatus: (status) =>
    set({ filterStatus: status, selectedIssueIds: [] }),
  setFilterSeverity: (severity) =>
    set({ filterSeverity: severity, selectedIssueIds: [] }),
  setFilterIssueType: (type) =>
    set({ filterIssueType: type, selectedIssueIds: [] }),
  setFilterJira: (jira) => set({ filterJira: jira, selectedIssueIds: [] }),
  setSearchText: (text) => set({ searchText: text, selectedIssueIds: [] }),
  setSortBy: (sortBy) => set({ sortBy }),
  setScanSearchText: (text) => set({ scanSearchText: text }),
  setScanFilterType: (type) => set({ scanFilterType: type }),
  toggleHideEmptyScans: () =>
    set((state) => ({ hideEmptyScans: !state.hideEmptyScans })),

  clearFilters: () =>
    set({
      filterStatus: null,
      filterSeverity: null,
      filterIssueType: null,
      filterJira: null,
      searchText: null,
      filterPreset: null,
      selectedIssueIds: [],
    }),

  // Apply filter presets
  applyFilterPreset: (preset) => {
    set({
      filterPreset: preset,
      filterStatus: null,
      filterSeverity: null,
      filterJira: null,
      selectedIssueIds: [],
    });
  },

  // Actions - UI
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
  toggleJiraPanel: () =>
    set((state) => ({ showJiraPanel: !state.showJiraPanel })),

  // Actions - List navigation
  setListCursor: (cursor) => set({ listCursor: cursor }),
  setAppSelectionCursor: (cursor) => set({ appSelectionCursor: cursor }),
  setScanSelectionCursor: (cursor) => set({ scanSelectionCursor: cursor }),
  moveCursorUp: () =>
    set((state) => ({
      listCursor: Math.max(0, state.listCursor - 1),
    })),
  moveCursorDown: () =>
    set((state) => {
      const { listCursor, view, applications, issues } = state;

      // Calculate filtered issues inline to avoid calling get() in state update
      let filtered = issues;
      if (state.filterStatus) {
        filtered = filtered.filter((i) => i.Status === state.filterStatus);
      }
      if (state.filterSeverity) {
        filtered = filtered.filter((i) => i.Severity === state.filterSeverity);
      }
      if (state.filterIssueType) {
        filtered = filtered.filter(
          (i) => i.IssueType === state.filterIssueType
        );
      }
      if (state.filterJira === 'with') {
        filtered = filtered.filter(
          (i) => i.ExternalId && i.ExternalId.trim() !== ''
        );
      } else if (state.filterJira === 'without') {
        filtered = filtered.filter(
          (i) => !i.ExternalId || i.ExternalId.trim() === ''
        );
      }
      if (state.searchText) {
        const searchLower = state.searchText.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            (i.IssueType && i.IssueType.toLowerCase().includes(searchLower)) ||
            (i.Location && i.Location.toLowerCase().includes(searchLower)) ||
            (i.Api && i.Api.toLowerCase().includes(searchLower))
        );
      }

      // Calculate filtered scans inline
      let filteredScans = state.scans;
      if (state.hideEmptyScans) {
        filteredScans = filteredScans.filter((scan) => {
          const issueCount = scan.LatestExecution?.NIssuesFound || 0;
          return issueCount > 0;
        });
      }
      if (state.scanFilterType) {
        filteredScans = filteredScans.filter((scan) => {
          const tech = scan.Technology || '';
          return tech
            .toUpperCase()
            .includes(state.scanFilterType.toUpperCase());
        });
      }
      if (state.scanSearchText) {
        const search = state.scanSearchText.toLowerCase();
        filteredScans = filteredScans.filter(
          (s) => s.Name && s.Name.toLowerCase().includes(search)
        );
      }

      let maxCursor = 0;
      if (view === 'issue-list') {
        maxCursor = filtered.length - 1;
      } else if (view === 'app-selection') {
        maxCursor = applications.length - 1;
      } else if (view === 'scan-selection') {
        maxCursor = filteredScans.length - 1;
      }

      return { listCursor: Math.min(maxCursor, listCursor + 1) };
    }),

  // Computed/helper functions
  getFilteredIssues: () => {
    const {
      issues,
      filterStatus,
      filterSeverity,
      filterIssueType,
      filterJira,
      searchText,
      sortBy,
    } = get();

    let filtered = [...issues];

    if (filterStatus) {
      filtered = filtered.filter((i) => i.Status === filterStatus);
    }

    if (filterSeverity) {
      filtered = filtered.filter((i) => i.Severity === filterSeverity);
    }

    if (filterIssueType) {
      filtered = filtered.filter((i) => i.IssueType === filterIssueType);
    }

    if (filterJira === 'with') {
      filtered = filtered.filter(
        (i) => i.ExternalId && i.ExternalId.trim() !== ''
      );
    } else if (filterJira === 'without') {
      filtered = filtered.filter(
        (i) => !i.ExternalId || i.ExternalId.trim() === ''
      );
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          (i.IssueType && i.IssueType.toLowerCase().includes(searchLower)) ||
          (i.Location && i.Location.toLowerCase().includes(searchLower)) ||
          (i.Api && i.Api.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    const severityOrder = {
      Critical: 0,
      High: 1,
      Medium: 2,
      Low: 3,
      Informational: 4,
    };

    if (sortBy === 'severity') {
      filtered.sort((a, b) => {
        const orderA = severityOrder[a.Severity] ?? 999;
        const orderB = severityOrder[b.Severity] ?? 999;
        return orderA - orderB;
      });
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => {
        const nameA = (a.IssueType || '').toLowerCase();
        const nameB = (b.IssueType || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'status') {
      filtered.sort((a, b) => {
        const statusA = (a.Status || '').toLowerCase();
        const statusB = (b.Status || '').toLowerCase();
        return statusA.localeCompare(statusB);
      });
    }

    return filtered;
  },

  hasActiveFilters: () => {
    const {
      filterStatus,
      filterSeverity,
      filterIssueType,
      filterJira,
      searchText,
    } = get();
    return !!(
      filterStatus ||
      filterSeverity ||
      filterIssueType ||
      filterJira ||
      searchText
    );
  },

  getFilteredScans: () => {
    const { scans, scanSearchText, scanFilterType, hideEmptyScans } = get();
    let filtered = [...scans];

    // Filter by issue count
    if (hideEmptyScans) {
      filtered = filtered.filter((scan) => {
        const issueCount = scan.LatestExecution?.NIssuesFound || 0;
        return issueCount > 0;
      });
    }

    // Filter by scan type
    if (scanFilterType) {
      filtered = filtered.filter((scan) => {
        const tech = scan.Technology || '';
        return tech.toUpperCase().includes(scanFilterType.toUpperCase());
      });
    }

    // Filter by search text
    if (scanSearchText) {
      const searchLower = scanSearchText.toLowerCase();
      filtered = filtered.filter(
        (scan) => scan.Name && scan.Name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  },
}));

export default useStore;
