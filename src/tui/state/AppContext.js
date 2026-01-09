import { create } from 'zustand';

/**
 * Global application state store using Zustand
 * Manages selection, filters, navigation, and UI state
 *
 * State shape:
 * @typedef {Object} AppState
 * @property {string} view - Current view: 'app-selection' | 'scan-selection' | 'issue-list' | 'issue-details'
 * @property {Object|null} selectedApp - Currently selected application
 * @property {Object|null} selectedScan - Currently selected scan
 * @property {Object|null} selectedIssue - Currently selected issue
 * @property {Array} applications - List of applications
 * @property {Array} scans - List of scans
 * @property {Array} issues - List of issues
 * @property {Object|null} issueDetails - Detailed issue information
 * @property {string|null} articleContent - Article content for issue
 * @property {Object} articleCache - Cache of article content by issue ID
 * @property {Object} commentsCache - Cache of comments by issue ID
 * @property {Array<string>} selectedIssueIds - IDs of selected issues for bulk operations
 * @property {string|null} filterStatus - Filter by issue status
 * @property {string|null} filterSeverity - Filter by severity level
 * @property {string|null} filterIssueType - Filter by issue type
 * @property {string|null} filterJira - Filter by JIRA status: 'with' | 'without' | null
 * @property {string|null} searchText - Search text for filtering issues
 * @property {string} sortBy - Sort field: 'severity' | 'name' | 'status'
 * @property {string|null} scanSearchText - Search text for filtering scans
 * @property {string|null} scanFilterType - Filter scans by type (SAST, DAST, etc.)
 * @property {boolean} hideEmptyScans - Whether to hide scans with no issues
 * @property {string|null} filterPreset - Server-side filter preset
 * @property {boolean} excludePassedNoise - Exclude Passed and Noise issues from API
 * @property {boolean} loading - Loading state
 * @property {Error|null} error - Current error
 * @property {boolean} showHelp - Help panel visibility
 * @property {boolean} showJiraPanel - JIRA panel visibility
 * @property {number} listCursor - Current cursor position in active list
 * @property {number} appSelectionCursor - Saved cursor for app selection
 * @property {number} scanSelectionCursor - Saved cursor for scan selection
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

  // API-level filtering (affects data fetched from server)
  excludePassedNoise: true, // Exclude Passed and Noise issues from API response (default: true)

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
  /**
   * Set the current view and reset cursor
   * @param {string} view - View name
   */
  setView: (view) => set({ view, listCursor: 0 }),

  /**
   * Set selected application and clear dependent state
   * @param {Object} app - Application object
   */
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

  /**
   * Set selected scan and clear dependent state
   * @param {Object} scan - Scan object
   */
  setSelectedScan: (scan) =>
    set({
      selectedScan: scan,
      selectedIssue: null,
      issues: [],
      selectedIssueIds: [],
      scanSelectionCursor: get().listCursor,
    }),

  /**
   * Set selected issue
   * @param {Object} issue - Issue object
   */
  setSelectedIssue: (issue) => set({ selectedIssue: issue }),

  /**
   * Navigate back to previous view, restoring saved cursor positions
   */
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
  /**
   * Set applications list
   * @param {Array} applications - Array of application objects
   */
  setApplications: (applications) => set({ applications }),

  /**
   * Set scans list
   * @param {Array} scans - Array of scan objects
   */
  setScans: (scans) => set({ scans }),

  /**
   * Set issues list and reset cursor
   * @param {Array} issues - Array of issue objects
   */
  setIssues: (issues) => set({ issues, listCursor: 0 }),

  /**
   * Set detailed issue information
   * @param {Object} issueDetails - Issue details object
   */
  setIssueDetails: (issueDetails) => set({ issueDetails }),

  /**
   * Set article content for current issue
   * @param {string} articleContent - Article content text
   */
  setArticleContent: (articleContent) => set({ articleContent }),

  // Actions - Cache
  /**
   * Cache article content for an issue
   * @param {string} issueId - Issue ID
   * @param {string} content - Article content
   */
  setArticleCache: (issueId, content) =>
    set((state) => ({
      articleCache: {
        ...state.articleCache,
        [issueId]: { content, timestamp: Date.now() },
      },
    })),

  /**
   * Cache comments for an issue
   * @param {string} issueId - Issue ID
   * @param {Array} comments - Array of comment objects
   */
  setCommentsCache: (issueId, comments) =>
    set((state) => ({
      commentsCache: {
        ...state.commentsCache,
        [issueId]: { comments, timestamp: Date.now() },
      },
    })),

  /**
   * Invalidate cached data for a specific issue
   * @param {string} issueId - Issue ID
   */
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

  /**
   * Clear all cached data
   */
  clearAllCaches: () =>
    set({
      articleCache: {},
      commentsCache: {},
    }),

  // Actions - Multi-select
  /**
   * Toggle selection state of an issue
   * @param {string} issueId - Issue ID to toggle
   */
  toggleIssueSelection: (issueId) => {
    const { selectedIssueIds } = get();
    const isSelected = selectedIssueIds.includes(issueId);
    set({
      selectedIssueIds: isSelected
        ? selectedIssueIds.filter((id) => id !== issueId)
        : [...selectedIssueIds, issueId],
    });
  },

  /**
   * Select all filtered issues
   */
  selectAllIssues: () => {
    const filteredIssues = get().getFilteredIssues();
    set({ selectedIssueIds: filteredIssues.map((i) => i.Id) });
  },

  /**
   * Clear all issue selections
   */
  selectNone: () => set({ selectedIssueIds: [] }),

  /**
   * Invert current issue selection
   */
  invertSelection: () => {
    const filteredIssues = get().getFilteredIssues();
    const { selectedIssueIds } = get();
    const allIds = filteredIssues.map((i) => i.Id);
    const newSelection = allIds.filter((id) => !selectedIssueIds.includes(id));
    set({ selectedIssueIds: newSelection });
  },

  /**
   * Clear issue selection (alias for selectNone)
   */
  clearSelection: () => set({ selectedIssueIds: [] }),

  // Actions - Filters
  /**
   * Set issue status filter
   * @param {string|null} status - Status to filter by
   */
  setFilterStatus: (status) =>
    set({ filterStatus: status, selectedIssueIds: [] }),

  /**
   * Set severity filter
   * @param {string|null} severity - Severity level to filter by
   */
  setFilterSeverity: (severity) =>
    set({ filterSeverity: severity, selectedIssueIds: [] }),

  /**
   * Set issue type filter
   * @param {string|null} type - Issue type to filter by
   */
  setFilterIssueType: (type) =>
    set({ filterIssueType: type, selectedIssueIds: [] }),

  /**
   * Set JIRA filter
   * @param {string|null} jira - 'with' | 'without' | null
   */
  setFilterJira: (jira) => set({ filterJira: jira, selectedIssueIds: [] }),

  /**
   * Set search text filter
   * @param {string|null} text - Search text
   */
  setSearchText: (text) => set({ searchText: text, selectedIssueIds: [] }),

  /**
   * Set sort order
   * @param {string} sortBy - Sort field: 'severity' | 'name' | 'status'
   */
  setSortBy: (sortBy) => set({ sortBy }),

  /**
   * Set scan search text
   * @param {string|null} text - Search text for scans
   */
  setScanSearchText: (text) => set({ scanSearchText: text }),

  /**
   * Set scan type filter
   * @param {string|null} type - Scan type to filter by
   */
  setScanFilterType: (type) => set({ scanFilterType: type }),

  /**
   * Toggle hiding of empty scans
   */
  toggleHideEmptyScans: () =>
    set((state) => ({ hideEmptyScans: !state.hideEmptyScans })),

  /**
   * Clear all filters
   */
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

  /**
   * Apply a server-side filter preset
   * @param {string|null} preset - Preset name
   */
  applyFilterPreset: (preset) => {
    set({
      filterPreset: preset,
      filterStatus: null,
      filterSeverity: null,
      filterJira: null,
      selectedIssueIds: [],
    });
  },

  // API-level filtering actions
  /**
   * Toggle exclusion of Passed and Noise issues
   */
  toggleExcludePassedNoise: () =>
    set((state) => ({ excludePassedNoise: !state.excludePassedNoise })),

  /**
   * Set whether to exclude Passed and Noise issues
   * @param {boolean} exclude - Whether to exclude
   */
  setExcludePassedNoise: (exclude) => set({ excludePassedNoise: exclude }),

  // Actions - UI
  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading: (loading) => set({ loading }),

  /**
   * Set error state
   * @param {Error|null} error - Error object
   */
  setError: (error) => set({ error }),

  /**
   * Toggle help panel visibility
   */
  toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),

  /**
   * Toggle JIRA panel visibility
   */
  toggleJiraPanel: () =>
    set((state) => ({ showJiraPanel: !state.showJiraPanel })),

  // Actions - List navigation
  /**
   * Set current list cursor position
   * @param {number} cursor - Cursor position
   */
  setListCursor: (cursor) => set({ listCursor: cursor }),

  /**
   * Set app selection cursor position
   * @param {number} cursor - Cursor position
   */
  setAppSelectionCursor: (cursor) => set({ appSelectionCursor: cursor }),

  /**
   * Set scan selection cursor position
   * @param {number} cursor - Cursor position
   */
  setScanSelectionCursor: (cursor) => set({ scanSelectionCursor: cursor }),

  /**
   * Move cursor up in current list
   */
  moveCursorUp: () =>
    set((state) => ({
      listCursor: Math.max(0, state.listCursor - 1),
    })),

  /**
   * Move cursor down in current list with bounds checking
   */
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
  /**
   * Get filtered and sorted issues based on current filters
   * @returns {Array} Filtered and sorted issues array
   */
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

  /**
   * Check if any filters are currently active
   * @returns {boolean} True if any filter is active
   */
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

  /**
   * Get filtered scans based on current scan filters
   * @returns {Array} Filtered scans array
   */
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
