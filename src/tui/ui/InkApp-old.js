/**
 * InkApp Component
 * Main application component with 3-pane layout and keyboard handling
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import useStore from '../state/AppContext.js';
import { Toolbar } from './Toolbar.js';
import { LeftNav } from './LeftNav.js';
import { VulnList } from './VulnList.js';
import { DetailsPanel } from './DetailsPanel.js';
import { AppSelectionView } from './AppSelectionView.js';
import { ScanSelectionView } from './ScanSelectionView.js';
import { IssueDetailsView } from './IssueDetailsView.js';
import { CommandBar } from './CommandBar.js';
import { HelpPanel } from './HelpPanel.js';
import { FilterModal } from './FilterModal.js';
import { UpdateStatusModal } from './UpdateStatusModal.js';
import { SearchModal } from './SearchModal.js';
import { CreateJiraModal } from './CreateJiraModal.js';
import { LinksPanel } from './LinksPanel.js';
import { ProgressModal } from './ProgressModal.js';
import { AppScanService } from '../services/appscan.js';
import { JiraService } from '../services/jira.js';
import { processArticle } from '../utils/article-processor.js';
import { groupIssuesBy } from '../utils/issue-utils.js';
import { SetupWizard } from './SetupWizard.js';
import {
  useKeyboardShortcuts,
  useKeyboardManager,
} from '../utils/KeyboardManager.js';
import logger from '../utils/logger.js';
import { auditService } from '../utils/audit.js';

export const InkApp = ({ configPath }) => {
  const { exit } = useApp();
  const { throttle } = useKeyboardManager();
  const [appScanService] = useState(() => new AppScanService(configPath));
  const [jiraService] = useState(
    () => new JiraService(appScanService.getConfig())
  );
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateJiraModal, setShowCreateJiraModal] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showLinksPanel, setShowLinksPanel] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressState, setProgressState] = useState({
    current: 0,
    total: 0,
    message: '',
  });

  // Refs to prevent concurrent API calls and rapid navigation
  const loadingRef = useRef(false);
  const lastNavigationRef = useRef(0);

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
  const clearSelection = useStore((state) => state.clearSelection);
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
      logger.error('Application error displayed', null, { error });
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
        logger.info('Loading applications');
        const apps = await appScanService.listApplications();
        setApplications(apps);
        logger.info('Applications loaded', { count: apps.length });
        setLoading(false);
      } catch (error) {
        logger.error('Failed to load applications', error);
        setError(error.message);
        setLoading(false);
      }
    };
    loadApps();
  }, [appScanService, setLoading, setApplications, setError]);

  // Handler functions - defined before keyboard handler to avoid initialization errors
  const handleSelectApp = async () => {
    if (applications.length === 0) return;

    // Prevent concurrent calls
    if (loadingRef.current) {
      logger.debug('Ignoring handleSelectApp - already loading');
      return;
    }

    const app = applications[listCursor];
    setSelectedApp(app);

    try {
      loadingRef.current = true;
      setLoading(true);
      logger.info('Loading scans for application', {
        appId: app.Id,
        appName: app.Name,
      });
      const scanList = await appScanService.listScans(app.Id);
      setScans(scanList);
      setView('scan-selection');
      setListCursor(0);
      logger.info('Scans loaded', { count: scanList.length });
      setLoading(false);
      loadingRef.current = false;

      // Auto-select if only one scan
      if (scanList.length === 1) {
        setTimeout(() => {
          handleSelectScan(scanList[0]);
        }, 100);
      }
    } catch (error) {
      logger.error('Failed to load scans', error, { appId: app.Id });
      setError(error.message);
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleSelectScan = async (scan = null) => {
    // Prevent concurrent calls
    if (loadingRef.current) {
      logger.debug('Ignoring handleSelectScan - already loading');
      return;
    }

    const filteredScans = getFilteredScans();
    const selectedScanItem =
      scan || (filteredScans.length > 0 ? filteredScans[listCursor] : null);
    if (!selectedScanItem) return;

    setSelectedScan(selectedScanItem);

    try {
      loadingRef.current = true;
      setLoading(true);
      logger.info('Loading issues for scan', {
        scanId: selectedScanItem.Id,
        scanName: selectedScanItem.Name,
      });
      const issueList = await appScanService.listIssues(selectedScanItem.Id);
      setIssues(issueList);
      setView('issue-list');
      setListCursor(0);
      logger.info('Issues loaded', { count: issueList.length });
      setLoading(false);
      loadingRef.current = false;
    } catch (error) {
      logger.error('Failed to load issues', error, {
        scanId: selectedScanItem.Id,
      });
      setError(error.message);
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleViewIssueDetails = async () => {
    if (filteredIssues.length === 0) return;

    // Throttle rapid navigation
    const now = Date.now();
    if (now - lastNavigationRef.current < 150) {
      logger.debug('Ignoring rapid navigation to issue details');
      return;
    }
    lastNavigationRef.current = now;

    // Prevent concurrent calls
    if (loadingRef.current) {
      logger.debug('Ignoring handleViewIssueDetails - already loading');
      return;
    }

    const issue = filteredIssues[listCursor];
    setSelectedIssue(issue);

    try {
      loadingRef.current = true;
      setLoading(true);
      logger.info('Loading issue details', { issueId: issue.Id });
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
      logger.info('Issue details loaded', { issueId: issue.Id });
      setLoading(false);
      loadingRef.current = false;
    } catch (error) {
      logger.error('Failed to load issue details', error, {
        issueId: issue.Id,
      });
      setError(error.message);
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleOpenUpdateModal = () => {
    if (!selectedIssueIds || selectedIssueIds.length === 0) {
      setError(
        'No issues selected. Use Space to select vulnerabilities before updating.'
      );
      return;
    }
    setShowUpdateModal(true);
  };

  const handleOpenCreateJiraModal = () => {
    if (!jiraService.isConfigured()) {
      setError(
        'Jira is not configured. Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN.'
      );
      return;
    }
    setShowCreateJiraModal(true);
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

  const handleUpdateStatus = async (status, comment) => {
    // Guard: Refuse to update if no issues selected
    if (!selectedIssueIds || selectedIssueIds.length === 0) {
      setError('No issues selected. Use Space to select vulnerabilities.');
      return;
    }

    const issueIdsToUpdate = [...selectedIssueIds]; // Explicit copy to prevent mutations

    try {
      const updateData = { Status: status };
      if (comment) updateData.Comment = comment;

      // Group by application ID
      const issuesByApp = {};
      for (const issueId of issueIdsToUpdate) {
        const issue = issues.find((i) => i.Id === issueId);
        if (issue) {
          const appId = issue.ApplicationId;
          if (!issuesByApp[appId]) {
            issuesByApp[appId] = [];
          }
          issuesByApp[appId].push(issueId);
        }
      }

      // Show progress modal
      const totalIssues = issueIdsToUpdate.length;
      setProgressState({
        current: 0,
        total: totalIssues,
        message: 'Updating issues...',
      });
      setShowProgressModal(true);

      let totalProcessed = 0;
      const errors = [];

      // Update each group with chunking
      for (const [appId, ids] of Object.entries(issuesByApp)) {
        const groupStartCount = totalProcessed;
        const result = await appScanService.bulkUpdateIssuesChunked(
          ids,
          appId,
          updateData,
          20, // chunk size
          (current) => {
            const currentTotal = groupStartCount + current;
            setProgressState({
              current: currentTotal,
              total: totalIssues,
              message: `Updating issues... (${currentTotal}/${totalIssues})`,
            });
          }
        );

        totalProcessed += ids.length;

        if (result.failed > 0) {
          errors.push(...result.errors);
        }
      }

      // Mark complete
      setProgressState({
        current: totalIssues,
        total: totalIssues,
        message: 'Update complete!',
      });

      // Close modal after brief delay
      setTimeout(() => {
        setShowProgressModal(false);

        if (errors.length > 0) {
          setError(
            `Updated issues, but ${errors.length} chunk(s) failed. Check logs for details.`
          );
        }

        // Refresh issues
        handleRefresh();
      }, 1500);
    } catch (error) {
      logger.error('Failed to update issues', error);
      setShowProgressModal(false);
      setError(error.message);
    }
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
            await appScanService.updateIssue(issue.Id, appId, {
              ExternalId: jiraKey,
            });

            // Audit the link
            auditService.logJiraLink(issue.Id, appId, jiraKey, {
              success: true,
            });
          } catch (updateError) {
            logger.error('Failed to link issue to Jira', updateError, {
              issueId: issue.Id,
              jiraKey,
            });

            // Audit the failed link
            auditService.logJiraLink(issue.Id, issue.ApplicationId, jiraKey, {
              success: false,
              error: updateError.message,
            });

            errors.push(
              `Failed to link issue ${issue.Id} to ${jiraKey}: ${updateError.message}`
            );
          }
        }
      } catch (createError) {
        logger.error('Failed to create Jira issue', createError, {
          groupName: group.name,
        });
        errors.push(
          `Failed to create Jira for ${group.name}: ${createError.message}`
        );
      }
    }

    // Report results
    if (errors.length > 0) {
      logger.warn('Jira creation completed with errors', {
        successCount: successes.length,
        errorCount: errors.length,
      });
      setError(
        `Created ${successes.length} Jira issue(s), but encountered ${errors.length} error(s): ${errors.join('; ')}`
      );
    } else if (successes.length > 0) {
      logger.info('Jira creation completed successfully', {
        successCount: successes.length,
      });
      // Success message will be shown by modal
    }

    // Refresh issues
    await handleRefresh();
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

  // Keyboard handling using centralized manager
  const keyboardHandler = useCallback(
    (input, key) => {
      try {
        // Help panel - consume all inputs
        if (showHelp) {
          toggleHelp();
          return true; // Stop propagation
        }

        // Modal handling - modals manage their own input
        if (
          showFilterModal ||
          showUpdateModal ||
          showSearchModal ||
          showCreateJiraModal ||
          showSetup ||
          showLinksPanel ||
          showProgressModal
        ) {
          return true; // Stop propagation
        }

        // Global shortcuts
        if (input === 'q') {
          logger.info('User requested exit');
          exit();
          return true;
        }

        if (input === 'S') {
          setShowSetup(true);
          return true;
        }

        if (input === '?') {
          toggleHelp();
          return true;
        }

        if (input === 'l') {
          setShowLinksPanel(true);
          return true;
        }

        // Navigation with throttling to prevent rapid-fire
        if (key.upArrow || input === 'k') {
          throttle('cursor-up', () => moveCursorUp(), 50);
          return true;
        }

        if (key.downArrow || input === 'j') {
          throttle('cursor-down', () => moveCursorDown(), 50);
          return true;
        }

        // Backspace navigation
        if (
          key.backspace ||
          input === 'b' ||
          input === '\u007F' ||
          input === '\b'
        ) {
          goBack();
          return true;
        }

        if (key.delete) {
          if (view === 'issue-list') {
            const hasFilters = useStore.getState().hasActiveFilters();
            if (hasFilters) {
              clearFilters();
              setListCursor(0);
              return true;
            }
          }
          return false;
        }

        // View-specific shortcuts
        if (view === 'app-selection') {
          if (key.return) {
            handleSelectApp();
            return true;
          }
        } else if (view === 'scan-selection') {
          if (key.return) {
            handleSelectScan();
            return true;
          } else if (input === '/') {
            setShowSearchModal(true);
            return true;
          } else if (input === 't') {
            const types = [null, 'SAST', 'DAST', 'SCA', 'IAST'];
            const current = useStore.getState().scanFilterType;
            const currentIndex = types.indexOf(current);
            const nextIndex = (currentIndex + 1) % types.length;
            setScanFilterType(types[nextIndex]);
            setListCursor(0);
            return true;
          } else if (input === 'h') {
            toggleHideEmptyScans();
            setListCursor(0);
            return true;
          }
        } else if (view === 'issue-list') {
          if (key.return) {
            handleViewIssueDetails();
            return true;
          } else if (input === ' ') {
            if (filteredIssues.length > 0) {
              const issue = filteredIssues[listCursor];
              toggleIssueSelection(issue.Id);
            }
            return true;
          } else if (key.ctrl && input === 'w') {
            clearSelection();
            return true;
          } else if (key.ctrl && input === 'a') {
            selectAllIssues();
            return true;
          } else if (input === 'u') {
            handleOpenUpdateModal();
            return true;
          } else if (input === 'c') {
            if (selectedIssueIds.length > 0) {
              handleOpenCreateJiraModal();
            }
            return true;
          } else if (input === 'f') {
            setShowFilterModal(true);
            return true;
          } else if (input === '/') {
            setShowSearchModal(true);
            return true;
          } else if (input === 'r') {
            handleRefresh();
            return true;
          } else if (input === 's') {
            const sortOptions = ['severity', 'name', 'status'];
            const currentIndex = sortOptions.indexOf(sortBy);
            const nextIndex = (currentIndex + 1) % sortOptions.length;
            setSortBy(sortOptions[nextIndex]);
            setListCursor(0);
            return true;
          } else if (input >= '1' && input <= '9') {
            const groupIndex = parseInt(input) - 1;
            const groups = groupIssuesBy(issues, 'IssueType');
            if (groupIndex < groups.length) {
              const groupName = groups[groupIndex].name;
              setFilterIssueType(groupName);
              setListCursor(0);
            }
            return true;
          }
        } else if (view === 'issue-details') {
          // Handled by goBack above
          return false;
        }

        return false; // Allow propagation if not handled
      } catch (err) {
        logger.error('Error in keyboard handler', err);
        return false;
      }
    },
    [
      showHelp,
      toggleHelp,
      showFilterModal,
      showUpdateModal,
      showSearchModal,
      showCreateJiraModal,
      showSetup,
      showLinksPanel,
      exit,
      throttle,
      moveCursorUp,
      moveCursorDown,
      goBack,
      view,
      clearFilters,
      setListCursor,
      handleSelectApp,
      handleSelectScan,
      setShowSearchModal,
      setScanFilterType,
      toggleHideEmptyScans,
      handleViewIssueDetails,
      filteredIssues,
      listCursor,
      toggleIssueSelection,
      clearSelection,
      selectAllIssues,
      handleOpenUpdateModal,
      selectedIssueIds,
      handleOpenCreateJiraModal,
      setShowFilterModal,
      handleRefresh,
      sortBy,
      setSortBy,
      setFilterIssueType,
      issues,
    ]
  );

  // Register keyboard handler with the manager
  useKeyboardShortcuts(keyboardHandler, {
    enabled: true,
    priority: 10,
    deps: [keyboardHandler],
  });

  return (
    <Box flexDirection="column" height="100%">
      <Toolbar />

      <Box flexGrow={1}>
        {view === 'app-selection' && <AppSelectionView />}
        {view === 'scan-selection' && <ScanSelectionView />}
        {view === 'issue-details' && <IssueDetailsView />}
        {view === 'issue-list' && (
          <>
            <LeftNav />
            <VulnList />
            <DetailsPanel />
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

      {/* Overlay layer for modals - absolute positioning */}
      {(showHelp ||
        showFilterModal ||
        showUpdateModal ||
        showSearchModal ||
        showCreateJiraModal ||
        showSetup ||
        showLinksPanel ||
        showProgressModal) && (
        <Box
          position="absolute"
          width="100%"
          height="100%"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          {/* Background overlay - blocks content behind modal */}
          <Box
            position="absolute"
            width="100%"
            height="100%"
            backgroundColor="black"
          />

          {/* Modal content on top */}
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
              issueCount={selectedIssueIds.length}
              issues={issues.filter((i) => selectedIssueIds.includes(i.Id))}
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
              issues={issues.filter((i) => selectedIssueIds.includes(i.Id))}
              defaultProjectKey={appScanService.getConfig().getJiraProjectKey()}
              onCreate={handleCreateJira}
              onClose={() => setShowCreateJiraModal(false)}
            />
          )}
          {showSetup && (
            <SetupWizard
              onComplete={() => {
                setShowSetup(false);
                setError(
                  'Configuration saved. Please restart the application to apply changes.'
                );
              }}
              onCancel={() => setShowSetup(false)}
            />
          )}
          {showLinksPanel && (
            <LinksPanel onClose={() => setShowLinksPanel(false)} />
          )}
          {showProgressModal && (
            <ProgressModal
              title="Updating Issues"
              current={progressState.current}
              total={progressState.total}
              message={progressState.message}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

// Helper function to group issues for Jira creation
function groupIssuesForJira(issues, strategy) {
  if (strategy === 'none') {
    return issues.map((issue) => ({
      name: issue.IssueType,
      issues: [issue],
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
