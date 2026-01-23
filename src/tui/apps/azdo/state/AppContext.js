import { create } from 'zustand';
import { filterIssues } from '../utils/issue.js';

/**
 * Global Azure DevOps application state store using Zustand
 * Manages selection, filters, navigation, and UI state for Azure DevOps TUI
 *
 * Terminology mapping:
 * - Application → Project (Azure DevOps project)
 * - Scan → Repository (Azure DevOps repository)
 * - Issue → Alert (Azure DevOps security alert)
 */
export const useStore = create((set, get) => ({
  // Navigation state
  view: 'project-selection', // 'project-selection' | 'repository-selection' | 'alert-list' | 'alert-details'
  selectedProject: null,
  selectedRepository: null,
  selectedAlert: null,

  // Data
  projects: [],
  repositories: [],
  alerts: [],
  alertDetails: null,

  // Cache
  alertCache: {}, // { [alertId]: { content, timestamp } }

  // Multi-select state
  selectedAlertIds: [],

  // Filter state
  filterStatus: null, // 'Open' | 'InProgress' | 'Passed' | 'Noise' | 'Fixed' | null
  filterState: null, // 1=Active, 2=Dismissed, 4=Fixed, etc.
  filterSeverity: null, // 0=Low, 1=Medium, 2=High, 3=Critical, etc.
  filterAlertType: null, // 0=Unknown, 1=Dependency, 2=Secret, 3=Code, 4=License
  filterJira: null, // 'with' | 'without' | null
  searchText: null,
  sortBy: 'severity', // 'severity' | 'name' | 'state' | 'type'
  repositorySearchText: null,
  repositoryFilterType: null,
  hideEmptyRepositories: true,
  filterPreset: null, // 'active' | 'inactive' | 'dismissed-unknown' | 'fixed-or-known' | 'unassigned' | 'assigned' | 'low' | 'medium' | 'high'
  excludeFalsePositive: false,

  // UI state
  loading: false,
  error: null,
  showHelp: false,
  showJiraPanel: false,

  // List navigation
  listCursor: 0,
  projectSelectionCursor: 0,
  repositorySelectionCursor: 0,

  // Actions - Navigation
  setView: (view) => set({ view, listCursor: 0 }),

  setSelectedProject: (project) =>
    set({
      selectedProject: project,
      selectedRepository: null,
      selectedAlert: null,
      repositories: [],
      alerts: [],
      selectedAlertIds: [],
      projectSelectionCursor: get().listCursor,
    }),

  setSelectedRepository: (repository) =>
    set({
      selectedRepository: repository,
      selectedAlert: null,
      alerts: [],
      selectedAlertIds: [],
      repositorySelectionCursor: get().listCursor,
    }),

  setSelectedAlert: (alert) => set({ selectedAlert: alert }),

  goBack: () => {
    const { view, projectSelectionCursor, repositorySelectionCursor } = get();
    if (view === 'alert-details') {
      set({ view: 'alert-list', selectedAlert: null });
    } else if (view === 'alert-list') {
      set({
        view: 'repository-selection',
        selectedRepository: null,
        alerts: [],
        selectedAlertIds: [],
        listCursor: repositorySelectionCursor,
      });
    } else if (view === 'repository-selection') {
      set({
        view: 'project-selection',
        selectedProject: null,
        repositories: [],
        listCursor: projectSelectionCursor,
      });
    }
  },

  // Actions - Data
  setProjects: (projects) => set({ projects }),
  setRepositories: (repositories) => set({ repositories }),
  setAlerts: (alerts) => set({ alerts, listCursor: 0 }),
  setAlertDetails: (alertDetails) => set({ alertDetails }),

  /**
   * Refresh alerts while preserving cursor position
   * Finds the previously selected alert by ID and positions cursor accordingly
   * If the alert is no longer in the list, cursor stays at current position (clamped to bounds)
   * Uses internal filter state to correctly position cursor in filtered results
   * @param {Array} newAlerts - New alerts array from server
   */
  refreshAlerts: (newAlerts) =>
    set((state) => {
      // Build filter options from current state
      const filterOptions = {
        status: state.filterStatus,
        state: state.filterState,
        severity: state.filterSeverity,
        alertType: state.filterAlertType,
        jira: state.filterJira,
        searchText: state.searchText,
        sortBy: state.sortBy,
      };

      // Get current alert ID from filtered list at current cursor
      const filteredAlerts = filterIssues(state.alerts, filterOptions);
      const currentAlertId = filteredAlerts[state.listCursor]?.alertId;

      // Find the same alert in the new filtered list
      const newFilteredAlerts = filterIssues(newAlerts, filterOptions);

      let newCursor = 0;
      if (currentAlertId) {
        const idx = newFilteredAlerts.findIndex(
          (a) => a.alertId === currentAlertId
        );
        if (idx !== -1) {
          newCursor = idx;
        } else {
          // Alert no longer in filtered list, clamp to valid range
          newCursor = Math.min(
            state.listCursor,
            Math.max(0, newFilteredAlerts.length - 1)
          );
        }
      }

      return { alerts: newAlerts, listCursor: newCursor };
    }),

  /**
   * Update a single alert with detailed data (e.g., from getAlert with expand option)
   * Merges new data with existing alert data
   * @param {number} alertId - Alert ID to update
   * @param {Object} alertData - New alert data to merge
   */
  updateAlert: (alertId, alertData) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.alertId === alertId ? { ...a, ...alertData } : a
      ),
    })),

  /**
   * Update a single project with detailed data (e.g., from getProject)
   * Merges new data with existing project data
   * @param {string} projectId - Project ID to update
   * @param {Object} projectData - New project data to merge
   */
  updateProject: (projectId, projectData) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...projectData } : p
      ),
      selectedProject:
        state.selectedProject?.id === projectId
          ? { ...state.selectedProject, ...projectData }
          : state.selectedProject,
    })),

  /**
   * Update a single repository with detailed data (e.g., from getRepository)
   * Merges new data with existing repository data
   * @param {string} repositoryId - Repository ID to update
   * @param {Object} repositoryData - New repository data to merge
   */
  updateRepository: (repositoryId, repositoryData) =>
    set((state) => ({
      repositories: state.repositories.map((r) =>
        r.id === repositoryId ? { ...r, ...repositoryData } : r
      ),
      selectedRepository:
        state.selectedRepository?.id === repositoryId
          ? { ...state.selectedRepository, ...repositoryData }
          : state.selectedRepository,
    })),

  // Actions - Cache
  setAlertCache: (alertId, content) =>
    set((state) => ({
      alertCache: {
        ...state.alertCache,
        [alertId]: { content, timestamp: Date.now() },
      },
    })),

  invalidateCacheForAlert: (alertId) =>
    set((state) => {
      const newAlertCache = { ...state.alertCache };
      delete newAlertCache[alertId];
      return { alertCache: newAlertCache };
    }),

  clearAllCaches: () => set({ alertCache: {} }),

  // Actions - Multi-select
  toggleAlertSelection: (alertId) => {
    const { selectedAlertIds } = get();
    const isSelected = selectedAlertIds.includes(alertId);
    set({
      selectedAlertIds: isSelected
        ? selectedAlertIds.filter((id) => id !== alertId)
        : [...selectedAlertIds, alertId],
    });
  },

  selectAllAlerts: () => {
    const filteredAlerts = get().getFilteredAlerts();
    set({ selectedAlertIds: filteredAlerts.map((a) => a.alertId) });
  },

  selectNone: () => set({ selectedAlertIds: [] }),

  invertSelection: () => {
    const filteredAlerts = get().getFilteredAlerts();
    const { selectedAlertIds } = get();
    const allIds = filteredAlerts.map((a) => a.alertId);
    const newSelection = allIds.filter((id) => !selectedAlertIds.includes(id));
    set({ selectedAlertIds: newSelection });
  },

  clearSelection: () => set({ selectedAlertIds: [] }),

  // Actions - Filters
  setFilterStatus: (status) =>
    set({ filterStatus: status, selectedAlertIds: [] }),
  setFilterState: (state) => set({ filterState: state, selectedAlertIds: [] }),
  setFilterSeverity: (severity) =>
    set({ filterSeverity: severity, selectedAlertIds: [] }),
  setFilterAlertType: (alertType) =>
    set({ filterAlertType: alertType, selectedAlertIds: [] }),
  setFilterJira: (jira) => set({ filterJira: jira, selectedAlertIds: [] }),
  setSearchText: (text) => set({ searchText: text, selectedAlertIds: [] }),
  setSortBy: (sortBy) => set({ sortBy }),
  setRepositorySearchText: (text) => set({ repositorySearchText: text }),
  setRepositoryFilterType: (type) => set({ repositoryFilterType: type }),
  setHideEmptyRepositories: (hide) => set({ hideEmptyRepositories: hide }),
  setFilterPreset: (preset) => set({ filterPreset: preset }),
  setExcludeFalsePositive: (exclude) => set({ excludeFalsePositive: exclude }),

  clearFilters: () =>
    set({
      filterStatus: null,
      filterState: null,
      filterSeverity: null,
      filterAlertType: null,
      filterJira: null,
      searchText: null,
      repositorySearchText: null,
      repositoryFilterType: null,
      selectedAlertIds: [],
      filterPreset: null,
      excludeFalsePositive: false,
    }),

  // Check if any filters are active
  hasActiveFilters: () => {
    const {
      filterStatus,
      filterState,
      filterSeverity,
      filterAlertType,
      filterJira,
      searchText,
    } = get();
    return !!(
      filterStatus ||
      filterState ||
      filterSeverity ||
      filterAlertType ||
      filterJira ||
      searchText
    );
  },

  // Actions - UI
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
  setShowHelp: (show) => set({ showHelp: show }),
  toggleJiraPanel: () =>
    set((state) => ({ showJiraPanel: !state.showJiraPanel })),

  // Actions - List navigation
  setCursor: (cursor) => set({ listCursor: cursor }),
  moveCursorUp: () =>
    set((state) => ({
      listCursor: Math.max(0, state.listCursor - 1),
    })),
  moveCursorDown: (maxIndex) =>
    set((state) => ({
      listCursor: Math.min(maxIndex, state.listCursor + 1),
    })),

  // Computed - Filtered lists
  getFilteredAlerts: () => {
    const {
      alerts,
      filterStatus,
      filterState,
      filterSeverity,
      filterAlertType,
      filterJira,
      searchText,
      sortBy,
    } = get();

    return filterIssues(alerts, {
      status: filterStatus,
      state: filterState,
      severity: filterSeverity,
      alertType: filterAlertType,
      jira: filterJira,
      searchText,
      sortBy,
    });
  },

  getFilteredRepositories: () => {
    const {
      repositories,
      repositorySearchText,
      repositoryFilterType,
      hideEmptyRepositories,
    } = get();

    let filtered = [...repositories];

    if (repositorySearchText) {
      const searchLower = repositorySearchText.toLowerCase();
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchLower)
      );
    }

    if (repositoryFilterType) {
      // Could filter by repository type if needed
    }

    if (hideEmptyRepositories) {
      // Filter out repositories with no alerts
      // This would require alert count data to be attached to repositories
      filtered = filtered.filter((r) => (r.alertCount || 0) > 0);
    }

    return filtered;
  },

  // Reset state
  reset: () =>
    set({
      view: 'project-selection',
      selectedProject: null,
      selectedRepository: null,
      selectedAlert: null,
      projects: [],
      repositories: [],
      alerts: [],
      alertDetails: null,
      alertCache: {},
      selectedAlertIds: [],
      filterStatus: null,
      filterState: null,
      filterSeverity: null,
      filterAlertType: null,
      filterJira: null,
      searchText: null,
      sortBy: 'severity',
      repositorySearchText: null,
      repositoryFilterType: null,
      hideEmptyRepositories: true,
      filterPreset: null,
      excludeFalsePositive: false,
      loading: false,
      error: null,
      showHelp: false,
      showJiraPanel: false,
      listCursor: 0,
      projectSelectionCursor: 0,
      repositorySelectionCursor: 0,
    }),
}));

export default useStore;
