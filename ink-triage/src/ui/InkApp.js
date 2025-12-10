/**
 * InkApp Component
 * Main application component with 3-pane layout and keyboard handling
 */

import React, { useEffect, useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import useStore from '../state/AppContext.js';
import { Toolbar } from './Toolbar.js';
import { LeftNav } from './LeftNav.js';
import { VulnList } from './VulnList.js';
import { DetailsPanel } from './DetailsPanel.js';
import { CommandBar } from './CommandBar.js';
import { HelpPanel } from './HelpPanel.js';
import { JiraPanel } from './JiraPanel.js';
import { AppScanService } from '../services/appscan.js';
import { JiraService } from '../services/jira.js';
import { processArticle } from '../utils/article-processor.js';
import { Formatter } from '../../../src/utils/formatter.js';

export const InkApp = ({ configPath }) => {
  const { exit } = useApp();
  const [appScanService] = useState(() => new AppScanService(configPath));
  const [jiraService] = useState(() => new JiraService(appScanService.getConfig()));
  
  const view = useStore((state) => state.view);
  const setView = useStore((state) => state.setView);
  const applications = useStore((state) => state.applications);
  const setApplications = useStore((state) => state.setApplications);
  const scans = useStore((state) => state.scans);
  const setScans = useStore((state) => state.setScans);
  const setIssues = useStore((state) => state.setIssues);
  const setSelectedApp = useStore((state) => state.setSelectedApp);
  const setSelectedScan = useStore((state) => state.setSelectedScan);
  const selectedApp = useStore((state) => state.selectedApp);
  const selectedScan = useStore((state) => state.selectedScan);
  const goBack = useStore((state) => state.goBack);
  const listCursor = useStore((state) => state.listCursor);
  const setListCursor = useStore((state) => state.setListCursor);
  const moveCursorUp = useStore((state) => state.moveCursorUp);
  const moveCursorDown = useStore((state) => state.moveCursorDown);
  const filteredIssues = useStore((state) => state.getFilteredIssues());
  const toggleIssueSelection = useStore((state) => state.toggleIssueSelection);
  const selectAllIssues = useStore((state) => state.selectAllIssues);
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);
  const showHelp = useStore((state) => state.showHelp);
  const toggleHelp = useStore((state) => state.toggleHelp);
  const showJiraPanel = useStore((state) => state.showJiraPanel);
  const toggleJiraPanel = useStore((state) => state.toggleJiraPanel);
  const setIssueDetails = useStore((state) => state.setIssueDetails);
  const setArticleContent = useStore((state) => state.setArticleContent);
  const selectedIssueIds = useStore((state) => state.selectedIssueIds);
  const clearFilters = useStore((state) => state.clearFilters);

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
  }, []);

  // Keyboard handling
  useInput((input, key) => {
    // Help panel - consume all inputs
    if (showHelp) {
      toggleHelp();
      return;
    }

    // Jira panel
    if (showJiraPanel) {
      if (key.escape) {
        toggleJiraPanel();
      }
      return;
    }

    // Global shortcuts
    if (input === 'q') {
      exit();
      return;
    }

    if (input === '?') {
      toggleHelp();
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

    if (key.backspace || key.delete) {
      if (view === 'issue-list') {
        // On delete in issue list, clear filters if they exist
        const hasFilters = useStore.getState().hasActiveFilters();
        if (hasFilters && key.delete) {
          clearFilters();
          return;
        }
      }
      goBack();
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
        handleUpdateStatus();
      } else if (input === 'c') {
        if (selectedIssueIds.length > 0) {
          toggleJiraPanel();
        }
      } else if (input === 'r') {
        handleRefresh();
      }
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
    const selectedScanItem = scan || scans[listCursor];
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

  const handleUpdateStatus = async () => {
    // This would open a modal/prompt for status update
    // For now, we'll skip the implementation detail
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

  return (
    <Box flexDirection="column" height="100%">
      <Toolbar />
      
      <Box flexGrow={1}>
        <LeftNav />
        {view === 'issue-list' && <VulnList />}
        {view === 'issue-list' && <DetailsPanel />}
      </Box>

      <CommandBar />

      {showHelp && <HelpPanel />}
      {showJiraPanel && <JiraPanel jiraService={jiraService} />}
    </Box>
  );
};

export default InkApp;
