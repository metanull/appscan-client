import { create } from 'zustand';

/**
 * Global application state store using Zustand
 * Mirrors the TUI state structure for consistency
 */
export const useWebStore = create((set, get) => ({
  // Navigation state
  view: 'app-selection', // 'app-selection' | 'scan-selection' | 'issue-list'
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
  filterPreset: null,

  // API-level filtering
  excludePassedNoise: true,

  // UI state
  loading: false,
  error: null,
  showContextPane: true,

  // Modal state
  showHelpModal: false,
  showFilterModal: false,
  showSearchModal: false,
  showLinksModal: false,
  showUpdateStatusModal: false,
  showCreateJiraModal: false,
  showLinkJiraModal: false,
  showUnlinkJiraModal: false,
  showIssueDetailsModal: true, // Default to true so details pane shows automatically

  // List navigation
  listCursor: 0,
  appSelectionCursor: 0,
  scanSelectionCursor: 0,

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
      appSelectionCursor: get().listCursor,
    }),

  setSelectedScan: (scan) =>
    set({
      selectedScan: scan,
      selectedIssue: null,
      issues: [],
      selectedIssueIds: [],
      scanSelectionCursor: get().listCursor,
    }),

  setSelectedIssue: (issue) => set({ selectedIssue: issue }),

  goBack: () => {
    const { view, appSelectionCursor, scanSelectionCursor } = get();
    if (view === 'issue-list') {
      set({
        view: 'scan-selection',
        selectedScan: null,
        issues: [],
        selectedIssueIds: [],
        listCursor: scanSelectionCursor,
      });
    } else if (view === 'scan-selection') {
      set({
        view: 'app-selection',
        selectedApp: null,
        scans: [],
        listCursor: appSelectionCursor,
      });
    }
  },

  // Actions - Data
  setApplications: (applications) => set({ applications }),
  setScans: (scans) => set({ scans }),
  setIssues: (issues) => set({ issues }),
  setIssueDetails: (issueDetails) => set({ issueDetails }),
  setArticleContent: (articleContent) => set({ articleContent }),

  // Actions - Multi-select
  toggleIssueSelection: (issueId) => {
    const { selectedIssueIds } = get();
    const newSelection = selectedIssueIds.includes(issueId)
      ? selectedIssueIds.filter((id) => id !== issueId)
      : [...selectedIssueIds, issueId];
    set({ selectedIssueIds: newSelection });
  },

  selectAllIssues: () => {
    const { issues } = get();
    set({ selectedIssueIds: issues.map((issue) => issue.Id) });
  },

  clearSelection: () => set({ selectedIssueIds: [] }),

  // Actions - Filters
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterSeverity: (filterSeverity) => set({ filterSeverity }),
  setFilterIssueType: (filterIssueType) => set({ filterIssueType }),
  setFilterJira: (filterJira) => set({ filterJira }),
  setSearchText: (searchText) => set({ searchText }),
  setSortBy: (sortBy) => set({ sortBy }),
  setScanSearchText: (scanSearchText) => set({ scanSearchText }),
  setScanFilterType: (scanFilterType) => set({ scanFilterType }),
  setHideEmptyScans: (hideEmptyScans) => set({ hideEmptyScans }),
  setFilterPreset: (filterPreset) => set({ filterPreset }),

  clearFilters: () =>
    set({
      filterStatus: null,
      filterSeverity: null,
      filterIssueType: null,
      filterJira: null,
      searchText: null,
      filterPreset: null,
    }),

  // Actions - UI
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  toggleContextPane: () => set({ showContextPane: !get().showContextPane }),

  // Actions - Modals
  setShowHelpModal: (show) => set({ showHelpModal: show }),
  setShowFilterModal: (show) => set({ showFilterModal: show }),
  setShowSearchModal: (show) => set({ showSearchModal: show }),
  setShowLinksModal: (show) => set({ showLinksModal: show }),
  setShowUpdateStatusModal: (show) => set({ showUpdateStatusModal: show }),
  setShowCreateJiraModal: (show) => set({ showCreateJiraModal: show }),
  setShowLinkJiraModal: (show) => set({ showLinkJiraModal: show }),
  setShowUnlinkJiraModal: (show) => set({ showUnlinkJiraModal: show }),
  setShowIssueDetailsModal: (show) => set({ showIssueDetailsModal: show }),

  // Actions - Cache
  setArticleCache: (issueId, content) => {
    const { articleCache } = get();
    set({
      articleCache: {
        ...articleCache,
        [issueId]: { content, timestamp: Date.now() },
      },
    });
  },

  setCommentsCache: (issueId, comments) => {
    const { commentsCache } = get();
    set({
      commentsCache: {
        ...commentsCache,
        [issueId]: { comments, timestamp: Date.now() },
      },
    });
  },

  // Actions - List navigation
  setListCursor: (cursor) => set({ listCursor: cursor }),
}));
