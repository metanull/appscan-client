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
  
  // UI state
  loading: false,
  error: null,
  showHelp: false,
  showJiraPanel: false,
  
  // List navigation
  listCursor: 0,
  
  // Actions - Navigation
  setView: (view) => set({ view, listCursor: 0 }),
  
  setSelectedApp: (app) => set({ 
    selectedApp: app, 
    selectedScan: null,
    selectedIssue: null,
    scans: [],
    issues: [],
    selectedIssueIds: []
  }),
  
  setSelectedScan: (scan) => set({ 
    selectedScan: scan,
    selectedIssue: null,
    issues: [],
    selectedIssueIds: []
  }),
  
  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  
  goBack: () => {
    const { view } = get();
    if (view === 'issue-details') {
      set({ view: 'issue-list', selectedIssue: null, articleContent: null });
    } else if (view === 'issue-list') {
      set({ view: 'scan-selection', selectedScan: null, issues: [], selectedIssueIds: [] });
    } else if (view === 'scan-selection') {
      set({ view: 'app-selection', selectedApp: null, scans: [] });
    }
  },
  
  // Actions - Data
  setApplications: (applications) => set({ applications }),
  setScans: (scans) => set({ scans }),
  setIssues: (issues) => set({ issues, listCursor: 0 }),
  setIssueDetails: (issueDetails) => set({ issueDetails }),
  setArticleContent: (articleContent) => set({ articleContent }),
  
  // Actions - Multi-select
  toggleIssueSelection: (issueId) => {
    const { selectedIssueIds } = get();
    const isSelected = selectedIssueIds.includes(issueId);
    set({
      selectedIssueIds: isSelected
        ? selectedIssueIds.filter(id => id !== issueId)
        : [...selectedIssueIds, issueId]
    });
  },
  
  selectAllIssues: () => {
    const { issues } = get();
    set({ selectedIssueIds: issues.map(i => i.Id) });
  },
  
  clearSelection: () => set({ selectedIssueIds: [] }),
  
  // Actions - Filters
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterSeverity: (severity) => set({ filterSeverity: severity }),
  setFilterIssueType: (type) => set({ filterIssueType: type }),
  setFilterJira: (jira) => set({ filterJira: jira }),
  setSearchText: (text) => set({ searchText: text }),
  setSortBy: (sortBy) => set({ sortBy }),
  setScanSearchText: (text) => set({ scanSearchText: text }),
  setScanFilterType: (type) => set({ scanFilterType: type }),
  toggleHideEmptyScans: () => set((state) => ({ hideEmptyScans: !state.hideEmptyScans })),
  
  clearFilters: () => set({
    filterStatus: null,
    filterSeverity: null,
    filterIssueType: null,
    filterJira: null,
    searchText: null
  }),
  
  // Actions - UI
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
  toggleJiraPanel: () => set((state) => ({ showJiraPanel: !state.showJiraPanel })),
  
  // Actions - List navigation
  setListCursor: (cursor) => set({ listCursor: cursor }),
  moveCursorUp: () => set((state) => ({ 
    listCursor: Math.max(0, state.listCursor - 1) 
  })),
  moveCursorDown: () => {
    const { listCursor, view, applications } = get();
    const filteredIssues = get().getFilteredIssues();
    const filteredScans = get().getFilteredScans();
    
    let maxCursor = 0;
    if (view === 'issue-list') {
      maxCursor = filteredIssues.length - 1;
    } else if (view === 'app-selection') {
      maxCursor = applications.length - 1;
    } else if (view === 'scan-selection') {
      maxCursor = filteredScans.length - 1;
    }
    
    set({ listCursor: Math.min(maxCursor, listCursor + 1) });
  },
  
  // Computed/helper functions
  getFilteredIssues: () => {
    const { 
      issues, 
      filterStatus, 
      filterSeverity, 
      filterIssueType, 
      filterJira,
      searchText,
      sortBy
    } = get();
    
    let filtered = [...issues];
    
    if (filterStatus) {
      filtered = filtered.filter(i => i.Status === filterStatus);
    }
    
    if (filterSeverity) {
      filtered = filtered.filter(i => i.Severity === filterSeverity);
    }
    
    if (filterIssueType) {
      filtered = filtered.filter(i => i.IssueType === filterIssueType);
    }
    
    if (filterJira === 'with') {
      filtered = filtered.filter(i => i.ExternalId && i.ExternalId.trim() !== '');
    } else if (filterJira === 'without') {
      filtered = filtered.filter(i => !i.ExternalId || i.ExternalId.trim() === '');
    }
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(i =>
        (i.IssueType && i.IssueType.toLowerCase().includes(searchLower)) ||
        (i.Location && i.Location.toLowerCase().includes(searchLower)) ||
        (i.Api && i.Api.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3, 'Informational': 4 };
    
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
    const { filterStatus, filterSeverity, filterIssueType, filterJira, searchText } = get();
    return !!(filterStatus || filterSeverity || filterIssueType || filterJira || searchText);
  },
  
  getFilteredScans: () => {
    const { scans, scanSearchText, scanFilterType, hideEmptyScans } = get();
    let filtered = [...scans];
    
    // Filter by issue count
    if (hideEmptyScans) {
      filtered = filtered.filter(scan => {
        const issueCount = scan.LatestExecution?.NIssuesFound || 0;
        return issueCount > 0;
      });
    }
    
    // Filter by scan type
    if (scanFilterType) {
      filtered = filtered.filter(scan => {
        const tech = scan.Technology || '';
        return tech.toUpperCase().includes(scanFilterType.toUpperCase());
      });
    }
    
    // Filter by search text
    if (scanSearchText) {
      const searchLower = scanSearchText.toLowerCase();
      filtered = filtered.filter(scan => 
        (scan.Name && scan.Name.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }
}));

export default useStore;
