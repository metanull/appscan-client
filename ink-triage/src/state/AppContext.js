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
    const { listCursor, issues, view } = get();
    const maxCursor = view === 'issue-list' ? issues.length - 1 : 0;
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
      searchText 
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
    
    return filtered;
  },
  
  hasActiveFilters: () => {
    const { filterStatus, filterSeverity, filterIssueType, filterJira, searchText } = get();
    return !!(filterStatus || filterSeverity || filterIssueType || filterJira || searchText);
  }
}));

export default useStore;
