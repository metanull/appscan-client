/**
 * InkApp Component
 * Main application component with 3-pane layout and keyboard handling
 */

import React, { useEffect, useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import useStore from '../state/AppContext.js';
import { Toolbar } from './Toolbar.js';
import { LeftNav } from './LeftNav.js';
import { VulnList } from './VulnList.js';
import { DetailsPanel } from './DetailsPanel.js';
import { IssueDetailsView } from './IssueDetailsView.js';
import { CommandBar } from './CommandBar.js';
import { HelpPanel } from './HelpPanel.js';
import { FilterModal } from './FilterModal.js';
import { UpdateStatusModal } from './UpdateStatusModal.js';
import { SearchModal } from './SearchModal.js';
import { CreateJiraModal } from './CreateJiraModal.js';
import { LinksPanel } from './LinksPanel.js';
import { AppScanService } from '../services/appscan.js';
import { JiraService } from '../services/jira.js';
import { processArticle } from '../utils/article-processor.js';
import { groupIssuesBy } from '../utils/issue-utils.js';
import { SetupWizard } from './SetupWizard.js';

export const InkApp = ({ configPath }) => {
  const { exit } = useApp();
  const [appScanService] = useState(() => new AppScanService(configPath));
  const [jiraService] = useState(() => new JiraService(appScanService.getConfig()));
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateJiraModal, setShowCreateJiraModal] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showLinksPanel, setShowLinksPanel] = useState(false);
  
  const view = useStore((state) => state.view);
  const setView = useStore((state) => state.setView);
  const applications = useStore((state) => state.applications);
  const setApplications = useStore((state) => state.setApplications);
  const setScans = useStore((state) => state.setScans);
  const issues = useStore((state) => state.issues);
  const setIssues = useStore((state) => state.setIssues);
  const setSelectedApp = useStore((state) => state.setSelectedApp);
  const setSelectedScan = useStore((state) => state.setSelectedScan);
  const selectedScan = useStore((state) => state.selectedScan);
  const setSelectedIssue = useStore((state) => state.setSelectedIssue);
  const goBack = useStore((state) => state.goBack);
  const listCursor = useStore((state) => state.listCursor);
  const setListCursor = useStore((state) => state.setListCursor);
  const moveCursorUp = useStore((state) => state.moveCursorUp);
  const moveCursorDown = useStore((state) => state.moveCursorDown);
  const getFilteredIssues = useStore((state) => state.getFilteredIssues);
  const filteredIssues = getFilteredIssues();
  const toggleIssueSelection = useStore((state) => state.toggleIssueSelection);
  const selectAllIssues = useStore((state) => state.selectAllIssues);
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);
  const showHelp = useStore((state) => state.showHelp);
  const toggleHelp = useStore((state) => state.toggleHelp);
  const setIssueDetails = useStore((state) => state.setIssueDetails);
  const setArticleContent = useStore((state) => state.setArticleContent);
  const selectedIssueIds = useStore((state) => state.selectedIssueIds);
  const clearFilters = useStore((state) => state.clearFilters);
  const setFilterStatus = useStore((state) => state.setFilterStatus);
  const setFilterSeverity = useStore((state) => state.setFilterSeverity);
  const setFilterIssueType = useStore((state) => state.setFilterIssueType);
  const setFilterJira = useStore((state) => state.setFilterJira);
  const setSearchText = useStore((state) => state.setSearchText);
  const searchText = useStore((state) => state.searchText);
  const error = useStore((state) => state.error);
  const loading = useStore((state) => state.loading);
  const sortBy = useStore((state) => state.sortBy);
  const setSortBy = useStore((state) => state.setSortBy);
  const setScanSearchText = useStore((state) => state.setScanSearchText);
  const setScanFilterType = useStore((state) => state.setScanFilterType);
  const toggleHideEmptyScans = useStore((state) => state.toggleHideEmptyScans);
  const getFilteredScans = useStore((state) => state.getFilteredScans);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // Load applications on mount
  useEffect(() => {
    const loadApps = async () => {
      try {
        setLoading(true);
        const apps = await appScanService.listApplications();
        setApplications(apps);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    loadApps();
  }, [appScanService, setLoading, setApplications, setError]);

  // Keyboard handling
  useInput((input, key) => {
    // Help panel - consume all inputs
    if (showHelp) {
      toggleHelp();
      return;
    }

    // Modal handling
    if (showFilterModal || showUpdateModal || showSearchModal || showCreateJiraModal || showSetup || showLinksPanel) {
      // Modals handle their own inputs
      return;
    }

    // Global shortcuts
    if (input === 'q') {
      exit();
      return;
    }

    if (input === 'S') {
      // Capital S to open setup wizard
      setShowSetup(true);
      return;
    }

    if (input === '?') {
      toggleHelp();
      return;
    }

    if (input === 'l') {
      // Open links panel
      setShowLinksPanel(true);
      return;
    }

    // Navigation
    if (key.upArrow || input === 'k') {
      moveCursorUp();
      return;
    }

    if (key.downArrow || input === 'j') {
      moveCursorDown();
      return;
    }

    // Backspace navigation - try multiple ways to detect it
    if (key.backspace || input === 'b' || input === '\u007F' || input === '\b') {
      goBack();
      return;
    }

    if (key.delete) {
      if (view === 'issue-list') {
        const hasFilters = useStore.getState().hasActiveFilters();
        if (hasFilters) {
          clearFilters();
          // Force refresh by updating multiple state values
          const currentCursor = useStore.getState().listCursor;
          setListCursor(currentCursor === 0 ? 1 : 0);
          setTimeout(() => setListCursor(0), 10);
          return;
        }
      }
      return;
    }

    // View-specific shortcuts
    if (view === 'app-selection') {
      if (key.return) {
        handleSelectApp();
      }
    } else if (view === 'scan-selection') {
      if (key.return) {
        handleSelectScan();
      } else if (input === '/') {
        setShowSearchModal(true);
      } else if (input === 't') {
        // Cycle through scan type filters
        const types = [null, 'SAST', 'DAST', 'SCA', 'IAST'];
        const current = useStore.getState().scanFilterType;
        const currentIndex = types.indexOf(current);
        const nextIndex = (currentIndex + 1) % types.length;
        setScanFilterType(types[nextIndex]);
        setListCursor(0);
      } else if (input === 'h') {
        // Toggle hide empty scans
        toggleHideEmptyScans();
        setListCursor(0);
      }
    } else if (view === 'issue-list') {
      if (key.return) {
        handleViewIssueDetails();
      } else if (input === ' ') {
        // Toggle selection
        if (filteredIssues.length > 0) {
          const issue = filteredIssues[listCursor];
          toggleIssueSelection(issue.Id);
        }
      } else if (key.ctrl && input === 'a') {
        selectAllIssues();
      } else if (input === 'u') {
        handleOpenUpdateModal();
      } else if (input === 'c') {
        if (selectedIssueIds.length > 0) {
          handleOpenCreateJiraModal();
        }
      } else if (input === 'f') {
        setShowFilterModal(true);
      } else if (input === '/') {
        setShowSearchModal(true);
      } else if (input === 'r') {
        handleRefresh();
      } else if (input === 's') {
        // Cycle through sort options
        const sortOptions = ['severity', 'name', 'status'];
        const currentIndex = sortOptions.indexOf(sortBy);
        const nextIndex = (currentIndex + 1) % sortOptions.length;
        setSortBy(sortOptions[nextIndex]);
        setListCursor(0); // Reset cursor when sorting changes
      } else if (input >= '1' && input <= '9') {
        // Quick filter by group number
        const groupIndex = parseInt(input) - 1;
        const groups = groupIssuesBy(issues, 'IssueType');
        if (groupIndex < groups.length) {
          const groupName = groups[groupIndex].name;
          setFilterIssueType(groupName);
          // Force immediate state update by touching multiple state values
          setListCursor(0);
          // Trigger re-render by updating view state
          const currentView = useStore.getState().view;
          setView(currentView);
        }
      }
    } else if (view === 'issue-details') {
      // Backspace handled above
    }
  });

  const handleSelectApp = async () => {
    if (applications.length === 0) return;
    
    const app = applications[listCursor];
    setSelectedApp(app);
    
    try {
      setLoading(true);
      const scanList = await appScanService.listScans(app.Id);
      setScans(scanList);
      setView('scan-selection');
      setListCursor(0);
      setLoading(false);

      // Auto-select if only one scan
      if (scanList.length === 1) {
        setTimeout(() => {
          handleSelectScan(scanList[0]);
        }, 100);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSelectScan = async (scan = null) => {
    const filteredScans = getFilteredScans();
    const selectedScanItem = scan || (filteredScans.length > 0 ? filteredScans[listCursor] : null);
    if (!selectedScanItem) return;

    setSelectedScan(selectedScanItem);

    try {
      setLoading(true);
      const issueList = await appScanService.listIssues(selectedScanItem.Id);
      setIssues(issueList);
      setView('issue-list');
      setListCursor(0);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleViewIssueDetails = async () => {
    if (filteredIssues.length === 0) return;

    const issue = filteredIssues[listCursor];
    setSelectedIssue(issue);
    
    try {
      setLoading(true);
      const details = await appScanService.getIssueDetails(issue.Id);
      setIssueDetails(details);

      // Fetch article
      if (issue.IssueTypeId) {
        const articleHtml = await appScanService.getArticle(issue.Id);
        if (articleHtml) {
          const processed = processArticle(articleHtml);
          setArticleContent(processed);
        }
      }

      setView('issue-details');
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleOpenUpdateModal = () => {
    if (selectedIssueIds.length > 0) {
      setShowUpdateModal(true);
    } else {
      setError('Please select one or more issues first (use Space to select)');
    }
  };

  const handleUpdateStatus = async (status, comment) => {
    if (selectedIssueIds.length === 0) {
      setError('No issues selected');
      return;
    }

    const issueIdsToUpdate = selectedIssueIds;

    try {
      setLoading(true);
      const updateData = { Status: status };
      if (comment) updateData.Comment = comment;

      // Group by application ID
      const issuesByApp = {};
      for (const issueId of issueIdsToUpdate) {
        const issue = issues.find(i => i.Id === issueId);
        if (issue) {
          const appId = issue.ApplicationId;
          if (!issuesByApp[appId]) {
            issuesByApp[appId] = [];
          }
          issuesByApp[appId].push(issueId);
        }
      }

      // Update each group
      for (const [appId, ids] of Object.entries(issuesByApp)) {
        await appScanService.bulkUpdateIssues(ids, appId, updateData);
      }

      // Refresh issues
      await handleRefresh();
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleOpenCreateJiraModal = () => {
    if (!jiraService.isConfigured()) {
      setError('Jira is not configured. Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN.');
      return;
    }
    setShowCreateJiraModal(true);
  };

  const handleCreateJira = async (projectKey, groupBy, selectedIssues) => {
    // Group issues
    const groups = groupIssuesForJira(selectedIssues, groupBy);
    const errors = [];
    const successes = [];

    for (const group of groups) {
      try {
        const summary = `[Security] ${group.name} - ${group.issues.length} occurrence(s)`;
        const jiraIssue = await jiraService.createJiraIssue(
          projectKey,
          summary,
          group.issues,
          appScanService.getBaseUrl()
        );

        const jiraKey = jiraIssue.key;
        successes.push(jiraKey);

        // Update AppScan issues with Jira link
        for (const issue of group.issues) {
          try {
            const appId = issue.ApplicationId;
            await appScanService.updateIssue(issue.Id, appId, { ExternalId: jiraKey });
          } catch (updateError) {
            errors.push(`Failed to link issue ${issue.Id} to ${jiraKey}: ${updateError.message}`);
          }
        }
      } catch (createError) {
        errors.push(`Failed to create Jira for ${group.name}: ${createError.message}`);
      }
    }

    // Report results
    if (errors.length > 0) {
      setError(`Created ${successes.length} Jira issue(s), but encountered ${errors.length} error(s): ${errors.join('; ')}`);
    } else if (successes.length > 0) {
      // Success message will be shown by modal
    }

    // Refresh issues
    await handleRefresh();
  };

  const handleRefresh = async () => {
    if (selectedScan) {
      try {
        setLoading(true);
        const issueList = await appScanService.listIssues(selectedScan.Id);
        setIssues(issueList);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    }
  };

  const handleFilterSelect = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setFilterStatus(value);
        break;
      case 'severity':
        setFilterSeverity(value);
        break;
      case 'type':
        setFilterIssueType(value);
        break;
      case 'jira':
        setFilterJira(value);
        break;
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      <Toolbar />
      
      <Box flexGrow={1}>
        {view === 'issue-details' ? (
          <IssueDetailsView />
        ) : (
          <>
            <LeftNav />
            {view === 'issue-list' && <VulnList />}
            {view === 'issue-list' && <DetailsPanel />}
          </>
        )}
      </Box>

      <CommandBar />

      {loading && (
        <Box borderStyle="single" borderColor="yellow" paddingX={1}>
          <Spinner type="dots" />
          <Text color="yellow"> Loading...</Text>
        </Box>
      )}

      {error && (
        <Box borderStyle="single" borderColor="red" paddingX={1}>
          <Text color="red">❌ Error: {error}</Text>
        </Box>
      )}

      {showHelp && <HelpPanel />}
      {showFilterModal && (
        <FilterModal
          issues={issues}
          onSelect={handleFilterSelect}
          onClose={() => setShowFilterModal(false)}
        />
      )}
      {showUpdateModal && (
        <UpdateStatusModal
          issueCount={selectedIssueIds.length > 0 ? selectedIssueIds.length : 1}
          onUpdate={handleUpdateStatus}
          onClose={() => setShowUpdateModal(false)}
        />
      )}
      {showSearchModal && view === 'issue-list' && (
        <SearchModal
          currentSearch={searchText}
          onSearch={setSearchText}
          onClose={() => setShowSearchModal(false)}
        />
      )}
      {showSearchModal && view === 'scan-selection' && (
        <SearchModal
          currentSearch={useStore.getState().scanSearchText}
          onSearch={(text) => {
            setScanSearchText(text);
            setListCursor(0);
          }}
          onClose={() => setShowSearchModal(false)}
        />
      )}
      {showCreateJiraModal && (
        <CreateJiraModal
          issues={issues.filter(i => selectedIssueIds.includes(i.Id))}
          defaultProjectKey={appScanService.getConfig().getJiraProjectKey()}
          onCreate={handleCreateJira}
          onClose={() => setShowCreateJiraModal(false)}
        />
      )}
      {showSetup && (
        <SetupWizard
          onComplete={() => {
            setShowSetup(false);
            setError('Configuration saved. Please restart the application to apply changes.');
          }}
          onCancel={() => setShowSetup(false)}
        />
      )}
      {showLinksPanel && (
        <LinksPanel onClose={() => setShowLinksPanel(false)} />
      )}
    </Box>
  );
};

// Helper function to group issues for Jira creation
function groupIssuesForJira(issues, strategy) {
  if (strategy === 'none') {
    return issues.map(issue => ({
      name: issue.IssueType,
      issues: [issue]
    }));
  } else if (strategy === 'severity') {
    const grouped = {};
    for (const issue of issues) {
      const key = issue.Severity || 'Unknown';
      if (!grouped[key]) {
        grouped[key] = { name: key, issues: [] };
      }
      grouped[key].issues.push(issue);
    }
    return Object.values(grouped);
  } else {
    // Default: group by type
    const grouped = {};
    for (const issue of issues) {
      const key = issue.IssueType || 'Unknown';
      if (!grouped[key]) {
        grouped[key] = { name: key, issues: [] };
      }
      grouped[key].issues.push(issue);
    }
    return Object.values(grouped);
  }
}

export default InkApp;
