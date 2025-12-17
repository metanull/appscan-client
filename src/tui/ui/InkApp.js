/**
 * InkApp - Main TUI Application
 * Optimized 3-pane layout with memoization and no render loops
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { useStore } from '../state/AppContext.js';
import { filterIssues } from '../utils/issue-utils.js';
import { Layout } from './components/Layout.js';
import { Panel } from './components/Panel.js';
import { ScrollableList } from './components/ScrollableList.js';
import { AppSelectionModal } from './components/AppSelectionModal.js';
import { ScanSelectionModal } from './components/ScanSelectionModal.js';
import { IssueDetailsModal } from './components/IssueDetailsModal.js';
import { HelpModal } from './components/HelpModal.js';
import { FilterModal } from './FilterModal.js';
import { SearchModal } from './SearchModal.js';
import { LinksModal } from './components/LinksModal.js';
import { UpdateStatusModal } from './UpdateStatusModal.js';
import { CreateJiraModal } from './CreateJiraModal.js';
import { AppScanService } from '../services/appscan.js';
import { JiraService } from '../services/jira.js';
import { useCurrentIssue } from '../hooks/useCurrentIssue.js';
import { useArticleCache } from '../hooks/useArticleCache.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import logger from '../utils/logger.js';
import { getPackageInfo } from '../../utils/package-info.js';

/**
 * Context Pane - Shows selected app/scan info
 */
const ContextPane = React.memo(
  ({ app, scan, issuesCount, onToggle: _onToggle }) => {
    if (!app && !scan) return null;

    return (
      <Panel title="Context [c to toggle]" borderColor="blue" width={40}>
        {app && (
          <Box flexDirection="column">
            <Text bold>App: </Text>
            <Text wrap="truncate">{app.Name || 'Unknown'}</Text>
            <Text dimColor>
              Issues: {issuesCount ?? app.IssueCountTotal ?? 0}
            </Text>
          </Box>
        )}
        {scan && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Scan: </Text>
            <Text wrap="truncate">{scan.Name || 'Unknown'}</Text>
            <Text dimColor>Type: {scan.Technology || 'N/A'}</Text>
          </Box>
        )}
      </Panel>
    );
  }
);
ContextPane.displayName = 'ContextPane';

/**
 * Vulnerability List Row - Memoized
 */
const VulnRow = React.memo(({ issue, isSelected }) => {
  const severity = issue.Severity || 'Unknown';
  const status = issue.Status || 'Unknown';
  const type = issue.IssueType || 'Unknown';

  const severityColor =
    {
      Critical: 'red',
      High: 'red',
      Medium: 'yellow',
      Low: 'blue',
      Informational: 'gray',
    }[severity] || 'white';

  return (
    <Box>
      <Box width={3}>
        <Text color={isSelected ? 'cyan' : undefined}>
          {isSelected ? '▶' : ' '}
        </Text>
      </Box>
      <Box width={12}>
        <Text color={severityColor} bold={isSelected}>
          {severity}
        </Text>
      </Box>
      <Box width={15}>
        <Text color={isSelected ? 'cyan' : undefined}>{status}</Text>
      </Box>
      <Box flexGrow={1}>
        <Text color={isSelected ? 'cyan' : undefined} wrap="truncate-end">
          {type}
        </Text>
      </Box>
    </Box>
  );
});
VulnRow.displayName = 'VulnRow';

/**
 * Vulnerability List Panel
 */
const VulnListPanel = React.memo(
  ({ issues, cursor, onCursorChange: _onCursorChange, height }) => {
    const renderItem = useCallback((issue, isSelected) => {
      return <VulnRow issue={issue} isSelected={isSelected} />;
    }, []);

    // Calculate available rows for the list
    // Height passed is the content area height (terminal - 2 for header/footer)
    // Subtract panel chrome:
    // - Panel border (2 lines)
    // - Panel title (1 line)
    // - Panel padding (1 line)
    const chromeLines = 4;
    const availableRows = height - chromeLines;
    const visibleRows = Math.max(1, availableRows);

    return (
      <Panel
        title={`Vulnerabilities (${issues.length})`}
        borderColor="cyan"
        flexGrow={1}
      >
        <ScrollableList
          items={issues}
          cursor={cursor}
          renderItem={renderItem}
          visibleRows={visibleRows}
          emptyMessage="No vulnerabilities found"
        />
      </Panel>
    );
  }
);
VulnListPanel.displayName = 'VulnListPanel';

/**
 * Details Preview Panel
 */
const DetailsPreviewPanel = React.memo(({ issue, articleContent, loading }) => {
  if (!issue) {
    return (
      <Panel title="Details" borderColor="magenta" width={40}>
        <Text dimColor>Select an issue to view details</Text>
      </Panel>
    );
  }

  return (
    <Panel title="Details" borderColor="magenta" width={40}>
      <Box flexDirection="column">
        <Text>
          <Text bold>Type:</Text> {issue.IssueType || 'N/A'}
        </Text>
        <Text>
          <Text bold>Severity:</Text> {issue.Severity || 'N/A'}
        </Text>
        <Text>
          <Text bold>Status:</Text> {issue.Status || 'N/A'}
        </Text>
        {issue.Location && (
          <Text wrap="truncate">
            <Text bold>Location:</Text> {issue.Location}
          </Text>
        )}
        {loading && (
          <Box marginTop={1}>
            <Box marginRight={1}>
              <Spinner />
            </Box>
            <Text>Loading article...</Text>
          </Box>
        )}
        {articleContent && !loading && (
          <Box marginTop={1}>
            <Text dimColor>Press Enter for full details</Text>
          </Box>
        )}
      </Box>
    </Panel>
  );
});
DetailsPreviewPanel.displayName = 'DetailsPreviewPanel';

/**
 * Status Bar
 */
const pkg = getPackageInfo();
const StatusBar = React.memo(({ error, loading, message }) => {
  const rightText = `${pkg.version || 'v0.0.0'} • Pascal Havelange`;
  return (
    <Box
      borderStyle="single"
      borderTop
      paddingX={1}
      justifyContent="space-between"
      width="100%"
    >
      <Box>
        {error && <Text color="red">Error: {error}</Text>}
        {loading && !error && (
          <Box>
            <Box marginRight={1}>
              <Spinner />
            </Box>
            <Text>{message || 'Loading...'}</Text>
          </Box>
        )}
        {!error && !loading && (
          <Text dimColor>
            Press ? for help | a: App | s: Scan | f: Filter | q: Quit
          </Text>
        )}
      </Box>
      <Box>
        <Text dimColor>{rightText}</Text>
      </Box>
    </Box>
  );
});
StatusBar.displayName = 'StatusBar';

/**
 * Main InkApp Component
 */
export const InkApp = ({ configPath }) => {
  const { exit } = useApp();
  const { height } = useTerminalSize();

  // Services
  const [appScanService] = useState(() => new AppScanService(configPath));
  const [jiraService] = useState(
    () => new JiraService(appScanService.getConfig())
  );

  // Zustand state - ONLY subscribe to data, never to setters
  const selectedApp = useStore((state) => state.selectedApp);
  const selectedScan = useStore((state) => state.selectedScan);
  const applications = useStore((state) => state.applications);
  const scans = useStore((state) => state.scans);
  const listCursor = useStore((state) => state.listCursor);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const view = useStore((state) => state.view);
  const issues = useStore((state) => state.issues);

  // Filter state - subscribe to each individually to avoid object creation
  const filterStatus = useStore((state) => state.filterStatus);
  const filterSeverity = useStore((state) => state.filterSeverity);
  const filterIssueType = useStore((state) => state.filterIssueType);
  const filterJira = useStore((state) => state.filterJira);
  const searchText = useStore((state) => state.searchText);
  const sortBy = useStore((state) => state.sortBy);

  // Local UI state
  const [showContextPane, setShowContextPane] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // null | 'app' | 'scan' | 'filter' | 'search' | 'help' | etc.

  // Load applications on mount - runs once
  const hasLoadedApps = useRef(false);
  React.useEffect(() => {
    if (hasLoadedApps.current) return; // Guard against double-mounting
    hasLoadedApps.current = true;

    const loadApps = async () => {
      try {
        useStore.getState().setLoading(true);
        logger.info('Loading applications (TUI)');
        const apps = await appScanService.listApplications();
        useStore.getState().setApplications(apps);
        logger.info('Applications loaded', { count: apps.length });
        // Log a sample application to inspect available fields
        if (apps.length > 0) {
          const sample = apps[0];
          logger.debug('Sample application fields', {
            id: sample.Id,
            name: sample.Name,
            keys: Object.keys(sample).slice(0, 20),
            IssueCountTotal: sample.IssueCountTotal,
            LatestExecution: sample.LatestExecution,
          });
        }
        useStore.getState().setLoading(false);
      } catch (err) {
        logger.error('Failed to load applications', err);
        useStore.getState().setError(err.message);
        useStore.getState().setLoading(false);
      }
    };

    loadApps();
  }, []); // Run once on mount

  // Auto-open app selection modal when applications are loaded
  // Only watch applications and view - NOT activeModal to avoid circular dependency
  const hasOpenedAppModal = useRef(false);
  React.useEffect(() => {
    if (
      view === 'app-selection' &&
      applications.length > 0 &&
      !hasOpenedAppModal.current
    ) {
      hasOpenedAppModal.current = true;
      setActiveModal('app');
    }
  }, [applications.length, view]); // Only depend on data, not activeModal

  // Get current issue and article using hooks
  const currentIssue = useCurrentIssue();
  const { content: articleContent, loading: articleLoading } = useArticleCache(
    currentIssue?.Id,
    useCallback(
      async (id) => {
        const article = await appScanService.getArticle(id);
        return article;
      },
      [appScanService]
    )
  );

  // Load issues when a scan is selected (runs when `selectedScan` changes)
  const lastLoadedScanRef = useRef(null);
  React.useEffect(() => {
    if (!selectedScan || !selectedScan.Id) return;
    if (lastLoadedScanRef.current === selectedScan.Id) return; // Already loaded this scan

    let cancelled = false;

    (async () => {
      try {
        useStore.getState().setLoading(true);
        const issueList = await appScanService.listIssues(selectedScan.Id);
        if (cancelled) return;
        useStore.getState().setIssues(issueList || []);
        useStore.getState().setView('issue-list');
        lastLoadedScanRef.current = selectedScan.Id;
        useStore.getState().setLoading(false);
      } catch (err) {
        if (cancelled) return;
        useStore.getState().setError(err.message || 'Failed to load issues');
        useStore.getState().setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedScan, appScanService]);

  // Filtered issues - build from individual filter state
  const filteredIssues = useMemo(() => {
    return filterIssues(issues, {
      status: filterStatus,
      severity: filterSeverity,
      issueType: filterIssueType,
      jira: filterJira,
      searchText: searchText,
      sortBy: sortBy,
    });
  }, [
    issues,
    filterStatus,
    filterSeverity,
    filterIssueType,
    filterJira,
    searchText,
    sortBy,
  ]);

  // Throttled cursor movement
  const pendingCursorMove = useRef(0);
  const flushTimeout = useRef(null);
  const filteredIssuesLength = filteredIssues.length;

  const flushCursorMove = useCallback(() => {
    if (flushTimeout.current) return;

    flushTimeout.current = setTimeout(() => {
      const delta = pendingCursorMove.current;
      if (delta !== 0) {
        pendingCursorMove.current = 0;

        const currentCursor = useStore.getState().listCursor;
        const maxCursor = filteredIssuesLength - 1;
        const newCursor = Math.min(
          maxCursor,
          Math.max(0, currentCursor + delta)
        );

        if (newCursor !== currentCursor) {
          useStore.getState().setListCursor(newCursor); // Use getState() instead of prop
        }
      }
      flushTimeout.current = null;
    }, 16);
  }, [filteredIssuesLength]); // Only depend on data, not setter

  // Keyboard handling
  useInput((input, key) => {
    // Modal open - don't handle shortcuts
    if (activeModal) return;

    // Quit
    if (input === 'q') {
      exit();
      return;
    }

    // Help
    if (input === 'h' || input === '?') {
      setActiveModal('help');
      return;
    }

    // Toggle context pane
    if (input === 'c') {
      setShowContextPane((prev) => !prev);
      return;
    }

    // App selection
    if (input === 'a') {
      setActiveModal('app');
      return;
    }

    // Scan selection
    if (input === 's' && selectedApp) {
      setActiveModal('scan');
      return;
    }

    // Filter
    if (input === 'f' && filteredIssues.length > 0) {
      setActiveModal('filter');
      return;
    }

    // Search
    if (input === '/') {
      setActiveModal('search');
      return;
    }

    // Links
    if (input === 'l' && currentIssue) {
      setActiveModal('links');
      return;
    }

    // Update status
    if (input === 'u' && currentIssue) {
      setActiveModal('update');
      return;
    }

    // Create Jira
    if (input === 'j' && currentIssue) {
      setActiveModal('jira');
      return;
    }

    // Details modal
    if (key.return && currentIssue) {
      setActiveModal('details');
      return;
    }

    // Navigation
    if (key.upArrow) {
      pendingCursorMove.current -= 1;
      flushCursorMove();
      return;
    }

    if (key.downArrow) {
      pendingCursorMove.current += 1;
      flushCursorMove();
      return;
    }
  });

  // Main layout
  return (
    <Layout
      header={null}
      footer={<StatusBar error={error} loading={loading} message="Ready" />}
    >
      <Box flexDirection="row" height={height - 2}>
        {/* Context Pane */}
        {showContextPane && (
          <ContextPane
            app={selectedApp}
            scan={selectedScan}
            issuesCount={issues.length}
          />
        )}

        {/* Vulnerability List */}
        <VulnListPanel
          issues={filteredIssues}
          cursor={listCursor}
          height={height - 2}
        />

        {/* Details Preview */}
        <DetailsPreviewPanel
          issue={currentIssue}
          articleContent={articleContent}
          loading={articleLoading}
        />
      </Box>

      {/* Modals */}
      {activeModal === 'help' && (
        <HelpModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'app' && (
        <AppSelectionModal
          applications={applications}
          onSelect={async (app) => {
            // Set selected app and load scans for it
            useStore.getState().setSelectedApp(app);
            setActiveModal(null);
            try {
              useStore.getState().setLoading(true);
              logger.info('Loading scans for application', {
                appId: app.Id,
                appName: app.Name,
              });
              const scanList = await appScanService.listScans(app.Id);
              useStore.getState().setScans(scanList);
              // Auto-open scan modal if there are scans
              if (scanList && scanList.length > 0) {
                setActiveModal('scan');
                // Log a sample scan to inspect fields
                logger.debug('Sample scan fields', {
                  sample: scanList[0],
                  keys: Object.keys(scanList[0] || {}).slice(0, 20),
                });
              }
              useStore.getState().setLoading(false);
            } catch (err) {
              logger.error('Failed to load scans', err);
              useStore.getState().setError(err.message);
              useStore.getState().setLoading(false);
            }
          }}
          onCancel={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'scan' && (
        <ScanSelectionModal
          scans={scans}
          onSelect={(scan) => {
            useStore.getState().setSelectedScan(scan);
            setActiveModal(null);
          }}
          onCancel={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'filter' && (
        <FilterModal
          issues={filteredIssues}
          onSelect={(filterType, value) => {
            if (filterType === 'status')
              useStore.getState().setFilterStatus(value);
            else if (filterType === 'severity')
              useStore.getState().setFilterSeverity(value);
            else if (filterType === 'type')
              useStore.getState().setFilterIssueType(value);
            else if (filterType === 'jira')
              useStore.getState().setFilterJira(value);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'search' && (
        <SearchModal
          currentSearch={useStore.getState().searchText}
          onSearch={(text) => useStore.getState().setSearchText(text)}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'links' && currentIssue && (
        <LinksModal
          issue={currentIssue}
          config={appScanService.getConfig()}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'update' && currentIssue && (
        <UpdateStatusModal
          issueCount={1}
          issues={[currentIssue]}
          onUpdate={async (status, comment) => {
            await appScanService.updateIssueStatus(
              currentIssue.Id,
              status,
              comment
            );
            logger.info('Status updated');
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'jira' && currentIssue && (
        <CreateJiraModal
          issues={[currentIssue]}
          defaultProjectKey={jiraService.getProjectKey()}
          onCreate={async (projectKey, groupBy, issues) => {
            await jiraService.createIssues(projectKey, groupBy, issues);
            logger.info('Jira issue created');
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'details' && currentIssue && (
        <IssueDetailsModal
          issue={currentIssue}
          articleContent={articleContent}
          onClose={() => setActiveModal(null)}
        />
      )}
    </Layout>
  );
};

export default InkApp;
