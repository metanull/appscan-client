import { create } from 'zustand';
import { filterVulnerabilities } from '../utils/vulnerability.js';

/**
 * Global Detectify application state store using Zustand
 * Manages selection, filters, navigation, and UI state for Detectify TUI
 *
 * Detectify Structure:
 * - No hierarchy like AZDO (project -> repo) or ASOC (app -> scan)
 * - All vulnerabilities are at the top level, filterable by asset/host
 */
export const useStore = create((set, get) => ({
  // Navigation state
  view: 'vulnerability-list', // 'vulnerability-list' | 'vulnerability-details'
  selectedVulnerability: null,

  // Data
  assets: [],
  vulnerabilities: [],
  vulnerabilityDetails: null,
  totalVulnerabilities: 0,

  // Cache
  vulnerabilityCache: {}, // { [uuid]: { content, timestamp } }

  // Multi-select state
  selectedVulnerabilityIds: [],

  // Filter state
  filterStatus: null, // 'active' | 'new' | 'patched' | 'regression' | 'accepted_risk' | 'false_positive' | null
  filterSeverity: null, // 'information' | 'low' | 'medium' | 'high' | 'critical' | null
  filterScanSource: null, // 'asset-monitoring' | 'deep-scan' | etc.
  filterHost: null, // host filter string
  filterAssetToken: null, // asset token filter
  searchText: null,
  sortBy: 'severity', // 'severity' | 'title' | 'status' | 'host' | 'updated'
  filterPreset: null, // 'active' | 'resolved' | 'unresolved' | 'high-severity' | etc.
  excludeResolved: true, // Exclude resolved vulnerabilities (patched, accepted_risk, false_positive) by default

  // UI state
  loading: false,
  error: null,
  showHelp: false,
  showJiraPanel: false,

  // List navigation
  listCursor: 0,

  // Actions - Navigation
  setView: (view) => set({ view, listCursor: 0 }),

  setSelectedVulnerability: (vulnerability) =>
    set({ selectedVulnerability: vulnerability }),

  goBack: () => {
    const { view } = get();
    if (view === 'vulnerability-details') {
      set({ view: 'vulnerability-list', selectedVulnerability: null });
    }
  },

  // Actions - Data
  setAssets: (assets) => set({ assets }),
  setVulnerabilities: (vulnerabilities, total) =>
    set({ vulnerabilities, totalVulnerabilities: total || vulnerabilities.length, listCursor: 0 }),
  setVulnerabilityDetails: (details) => set({ vulnerabilityDetails: details }),

  /**
   * Append/update vulnerabilities progressively without resetting cursor
   * Used during initial load to show data as it arrives
   * IMPORTANT: Creates a new array copy to trigger React re-render
   */
  updateVulnerabilitiesProgressively: (newVulnerabilities, total) =>
    set((state) => {
      // Create a new array copy to ensure Zustand/React detects the change
      const vulnerabilitiesCopy = [...newVulnerabilities];
      
      // Keep cursor at same position unless it's beyond the new list length
      const maxCursor = Math.max(0, vulnerabilitiesCopy.length - 1);
      const newCursor = Math.min(state.listCursor, maxCursor);
      
      return {
        vulnerabilities: vulnerabilitiesCopy,
        totalVulnerabilities: total || vulnerabilitiesCopy.length,
        listCursor: newCursor,
      };
    }),

  /**
   * Refresh vulnerabilities while preserving cursor position
   */
  refreshVulnerabilities: (newVulnerabilities, total) =>
    set((state) => {
      const filterOptions = {
        status: state.filterStatus,
        severity: state.filterSeverity,
        scanSource: state.filterScanSource,
        host: state.filterHost,
        searchText: state.searchText,
        sortBy: state.sortBy,
      };

      const filteredVulns = filterVulnerabilities(state.vulnerabilities, filterOptions);
      const currentUuid = filteredVulns[state.listCursor]?.uuid;

      const newFilteredVulns = filterVulnerabilities(newVulnerabilities, filterOptions);

      let newCursor = 0;
      if (currentUuid) {
        const idx = newFilteredVulns.findIndex((v) => v.uuid === currentUuid);
        if (idx !== -1) {
          newCursor = idx;
        } else {
          newCursor = Math.min(state.listCursor, Math.max(0, newFilteredVulns.length - 1));
        }
      }

      return {
        vulnerabilities: newVulnerabilities,
        totalVulnerabilities: total || newVulnerabilities.length,
        listCursor: newCursor,
      };
    }),

  // Actions - Filters
  setFilterStatus: (status) =>
    set({ filterStatus: status, listCursor: 0, filterPreset: null }),
  setFilterSeverity: (severity) =>
    set({ filterSeverity: severity, listCursor: 0, filterPreset: null }),
  setFilterScanSource: (scanSource) =>
    set({ filterScanSource: scanSource, listCursor: 0, filterPreset: null }),
  setFilterHost: (host) =>
    set({ filterHost: host, listCursor: 0, filterPreset: null }),
  setFilterAssetToken: (assetToken) =>
    set({ filterAssetToken: assetToken, listCursor: 0, filterPreset: null }),
  setSearchText: (text) => set({ searchText: text, listCursor: 0 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setExcludeResolved: (exclude) => set({ excludeResolved: exclude }),

  setFilterPreset: (preset) => {
    const presets = {
      active: { filterStatus: 'active', filterSeverity: null },
      new: { filterStatus: 'new', filterSeverity: null },
      unresolved: { filterStatus: null, filterSeverity: null }, // active + new + regression
      resolved: { filterStatus: null, filterSeverity: null }, // accepted_risk + false_positive + patched
      'high-severity': { filterStatus: null, filterSeverity: 'high' },
      critical: { filterStatus: null, filterSeverity: 'critical' },
    };

    if (preset && presets[preset]) {
      set({ ...presets[preset], filterPreset: preset, listCursor: 0 });
    } else {
      set({ filterPreset: null });
    }
  },

  clearFilters: () =>
    set({
      filterStatus: null,
      filterSeverity: null,
      filterScanSource: null,
      filterHost: null,
      filterAssetToken: null,
      searchText: null,
      filterPreset: null,
      listCursor: 0,
    }),

  // Actions - Multi-select
  toggleVulnerabilitySelection: (uuid) =>
    set((state) => {
      const ids = state.selectedVulnerabilityIds;
      if (ids.includes(uuid)) {
        return { selectedVulnerabilityIds: ids.filter((id) => id !== uuid) };
      }
      return { selectedVulnerabilityIds: [...ids, uuid] };
    }),

  selectAllVulnerabilities: () =>
    set((state) => {
      const filterOptions = {
        status: state.filterStatus,
        severity: state.filterSeverity,
        scanSource: state.filterScanSource,
        host: state.filterHost,
        searchText: state.searchText,
        sortBy: state.sortBy,
      };
      const filtered = filterVulnerabilities(state.vulnerabilities, filterOptions);
      return { selectedVulnerabilityIds: filtered.map((v) => v.uuid) };
    }),

  clearSelection: () => set({ selectedVulnerabilityIds: [] }),

  // Actions - UI state
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
  setShowHelp: (show) => set({ showHelp: show }),
  toggleJiraPanel: () => set((state) => ({ showJiraPanel: !state.showJiraPanel })),
  setShowJiraPanel: (show) => set({ showJiraPanel: show }),

  // Actions - List navigation
  setListCursor: (cursor) => set({ listCursor: cursor }),
  moveCursor: (delta) =>
    set((state) => {
      const filterOptions = {
        status: state.filterStatus,
        severity: state.filterSeverity,
        scanSource: state.filterScanSource,
        host: state.filterHost,
        searchText: state.searchText,
        sortBy: state.sortBy,
      };
      const filtered = filterVulnerabilities(state.vulnerabilities, filterOptions);
      const maxIndex = Math.max(0, filtered.length - 1);
      const newCursor = Math.max(0, Math.min(maxIndex, state.listCursor + delta));
      return { listCursor: newCursor };
    }),

  // Actions - Cache
  cacheVulnerabilityDetails: (uuid, details) =>
    set((state) => ({
      vulnerabilityCache: {
        ...state.vulnerabilityCache,
        [uuid]: { content: details, timestamp: Date.now() },
      },
    })),

  getCachedVulnerabilityDetails: (uuid) => {
    const cached = get().vulnerabilityCache[uuid];
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.content;
    }
    return null;
  },

  clearCache: () => set({ vulnerabilityCache: {} }),
}));

export default useStore;
