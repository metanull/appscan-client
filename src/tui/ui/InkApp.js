/**
 * InkApp - Main TUI Application
 * Optimized 3-pane layout with memoization and no render loops
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { useStore } from '../state/AppContext.js';
import { filterIssues } from '../utils/issue-utils.js';
import { Layout } from './components/Layout.js';
import { Panel } from './components/Panel.js';
import { ScrollableList } from './components/ScrollableList.js';
import { DebugBar } from './components/DebugBar.js';
import { AppSelectionModal } from './components/AppSelectionModal.js';
import { ScanSelectionModal } from './components/ScanSelectionModal.js';
import { IssueDetailsModal } from './components/IssueDetailsModal.js';
import { HelpModal } from './components/HelpModal.js';
import { FilterModal } from './FilterModal.js';
import { SearchModal } from './SearchModal.js';
import { LinksModal } from './components/LinksModal.js';
import { UpdateStatusModal } from './UpdateStatusModal.js';
import { CreateJiraModal } from './CreateJiraModal.js';
import { LinkJiraModal } from './LinkJiraModal.js';
import { UnlinkJiraModal } from './UnlinkJiraModal.js';
import { AppScanService } from '../services/appscan.js';
import { JiraService } from '../services/jira.js';
import { useCurrentIssue } from '../hooks/useCurrentIssue.js';
import { useArticleCache } from '../hooks/useArticleCache.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import logger from '../utils/logger.js';
import { getPackageInfo } from '../../utils/package-info.js';

/**
 * Context Pane - Shows selected app/scan info
 */
const ContextPane = React.memo(
  ({ app, scan, issuesCount, onToggle: _onToggle }) => {
    if (!app && !scan) return null;

    return (
      <Panel title="Context [c to toggle]" borderColor="blue" width={60}>
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
const VulnRow = React.memo(({ issue, isSelected, isMultiSelected }) => {
  const severity = issue.Severity || 'Unknown';
  const status = issue.Status || 'Unknown';
  const type = issue.IssueType || 'Unknown';
  const jiraRef = issue.ExternalId || '';

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
      <Box width={2} justifyContent="flex-start">
        <Text color={isSelected ? 'cyan' : undefined}>
          {isSelected ? '▶' : ' '}
        </Text>
      </Box>
      <Box width={4} justifyContent="flex-start">
        <Text color={isMultiSelected ? 'cyan' : undefined}>
          {isMultiSelected ? '[✓]' : '[ ]'}
        </Text>
      </Box>
      <Box width={15} justifyContent="flex-start">
        <Text color={severityColor} bold={isSelected}>
          {severity}
        </Text>
      </Box>
      <Box width={14} justifyContent="flex-start">
        <Text color={isSelected ? 'cyan' : undefined}>{status}</Text>
      </Box>
      <Box width={15} justifyContent="flex-start">
        <Text color={jiraRef ? 'green' : 'dimColor'} wrap="truncate-end">
          {jiraRef || '-'}
        </Text>
      </Box>
      <Box flexGrow={1} minWidth={0} justifyContent="flex-start">
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
  ({
    issues,
    cursor,
    selectedIssueIds,
    filterStatus,
    filterSeverity,
    filterIssueType,
    filterJira,
    searchText,
    onCursorChange: _onCursorChange,
    height,
  }) => {
    const renderItem = useCallback(
      (issue, isSelected) => {
        const isMultiSelected = selectedIssueIds.includes(issue.Id);
        return (
          <VulnRow
            issue={issue}
            isSelected={isSelected}
            isMultiSelected={isMultiSelected}
          />
        );
      },
      [selectedIssueIds]
    );

    // Build filter display text
    const activeFilters = [];
    if (filterStatus) activeFilters.push(`Status:${filterStatus}`);
    if (filterSeverity) activeFilters.push(`Severity:${filterSeverity}`);
    if (filterIssueType) activeFilters.push(`Type:${filterIssueType}`);
    if (filterJira) activeFilters.push(`Jira:${filterJira}`);
    if (searchText) activeFilters.push(`Search:"${searchText}"`);
    const hasFilters = activeFilters.length > 0;

    // Calculate available rows for the list
    // Height passed is the content area height (terminal - 2 for header/footer)
    // Subtract panel chrome:
    // - Panel border (2 lines)
    // - Panel title (1 line)
    // - Selection count (conditional, 1 line)
    // - Filter status (conditional, 1 line)
    // - Column headers (1 line)
    // - Panel padding (1 line)
    const chromeLines =
      5 + (selectedIssueIds.length > 0 ? 1 : 0) + (hasFilters ? 1 : 0);
    const availableRows = height - chromeLines;
    const visibleRows = Math.max(1, availableRows);

    return (
      <Panel
        title={`Vulnerabilities (${issues.length})`}
        borderColor="cyan"
        flexGrow={1}
      >
        {/* Selection Count */}
        {selectedIssueIds.length > 0 && (
          <Box marginBottom={1}>
            <Text color="cyan" bold>
              ✓ Selected: {selectedIssueIds.length} of {issues.length}
            </Text>
            <Text dimColor> (Space: toggle | CTRL+a: all | ALT+a: clear)</Text>
          </Box>
        )}

        {/* Active Filters */}
        {hasFilters && (
          <Box marginBottom={1}>
            <Text color="yellow">🔍 Filtering &gt; </Text>
            <Text color="cyan">{activeFilters.join(' | ')}</Text>
            <Text dimColor> (ALT+f: clear)</Text>
          </Box>
        )}

        {/* Column Headers */}
        <Box marginBottom={1}>
          <Box width={2} justifyContent="flex-start">
            <Text bold dimColor>
              {' '}
            </Text>
          </Box>
          <Box width={4} justifyContent="flex-start">
            <Text bold dimColor>
              Sel
            </Text>
          </Box>
          <Box width={15} justifyContent="flex-start">
            <Text bold dimColor>
              Severity
            </Text>
          </Box>
          <Box width={14} justifyContent="flex-start">
            <Text bold dimColor>
              Status
            </Text>
          </Box>
          <Box width={15} justifyContent="flex-start">
            <Text bold dimColor>
              Jira
            </Text>
          </Box>
          <Box flexGrow={1} minWidth={0} justifyContent="flex-start">
            <Text bold dimColor>
              Vulnerability
            </Text>
          </Box>
        </Box>

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
  const rightText = `${pkg.name || 'appscan-client'} ${pkg.version || 'v0.0.0'} • License ${pkg.license || 'MIT'} • ${pkg.author || 'Pascal (MetaNull) Havelange'}`;
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
          <Text dimColor>? Help | CTRL+O App | CTRL+W Scan | q Quit</Text>
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
  const selectedIssueIds = useStore((state) => state.selectedIssueIds);

  // Local UI state
  const [showContextPane, setShowContextPane] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // null | 'app' | 'scan' | 'filter' | 'search' | 'help' | etc.
  const [debugMode, setDebugMode] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const isInitialSetup = useRef(true); // Track if we're in initial setup phase

  // Setup logger debug callback on mount
  React.useEffect(() => {
    logger.setDebugCallback((message) => {
      setDebugMessage(message);
    });
  }, []);

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
        // Find the full issue object
        const issue = issues.find((i) => i.Id === id);
        if (!issue) {
          // Fallback to generic article HTML if issue not found
          return await appScanService.getArticle(id);
        }
        // Get focused article as markdown
        return await appScanService.getIssueArticle(issue);
      },
      [appScanService, issues]
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

  // Get actual selected issues from IDs (use full issues list, not filtered)
  const selectedIssues = useMemo(() => {
    if (!issues || issues.length === 0) {
      // No issues loaded yet
      return currentIssue ? [currentIssue] : [];
    }
    if (selectedIssueIds.length === 0) {
      // If nothing selected, use current issue if available
      return currentIssue ? [currentIssue] : [];
    }
    // Filter issues to get only selected ones (from full list, not filtered list)
    return issues.filter((issue) => selectedIssueIds.includes(issue.Id));
  }, [selectedIssueIds, issues, currentIssue]);

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

  // Define keyboard shortcuts for issue-list view
  const issueListShortcuts = useMemo(
    () => [
      // Navigation
      {
        key: 'uparrow',
        action: () => {
          pendingCursorMove.current -= 1;
          flushCursorMove();
        },
        description: 'Navigate',
        group: 'Navigation',
      },
      {
        key: 'downarrow',
        action: () => {
          pendingCursorMove.current += 1;
          flushCursorMove();
        },
        description: 'Navigate',
        group: 'Navigation',
      },
      {
        key: 'enter',
        action: () => currentIssue && setActiveModal('details'),
        description: 'View',
        condition: () => !!currentIssue,
        group: 'Navigation',
      },

      // Selection
      {
        key: 'space',
        action: () =>
          currentIssue &&
          useStore.getState().toggleIssueSelection(currentIssue.Id),
        description: 'Select',
        condition: () => !!currentIssue,
        group: 'Selection',
      },
      {
        key: 'ctrl+a',
        action: () => useStore.getState().selectAllIssues(),
        description: 'Select all',
        condition: () => filteredIssues.length > 0,
        group: 'Selection',
      },
      {
        key: 'alt+a',
        action: () => useStore.getState().selectNone(),
        description: 'Clear selection',
        condition: () => selectedIssueIds.length > 0,
        group: 'Selection',
      },

      // Actions
      {
        key: 'l',
        action: () => currentIssue && setActiveModal('links'),
        description: 'Links',
        condition: () => !!currentIssue,
        group: 'Actions',
      },
      {
        key: 'u',
        action: () => currentIssue && setActiveModal('update'),
        description: 'Update',
        condition: () => !!currentIssue,
        group: 'Actions',
      },
      {
        key: 'j',
        action: () => currentIssue && setActiveModal('jira'),
        description: 'Jira',
        condition: () => !!currentIssue,
        group: 'Actions',
      },
      {
        key: 'ctrl+k',
        action: () => setActiveModal('link-jira'),
        description: 'Link Jira',
        condition: () => selectedIssueIds.length > 0,
        group: 'Actions',
      },
      {
        key: 'alt+k',
        action: () => setActiveModal('unlink-jira'),
        description: 'Unlink Jira',
        condition: () =>
          selectedIssueIds.length > 0 &&
          selectedIssues.some((issue) => issue.ExternalId),
        group: 'Actions',
      },

      // Filtering
      {
        key: 'f',
        action: () => filteredIssues.length > 0 && setActiveModal('filter'),
        description: 'Filter',
        condition: () => filteredIssues.length > 0,
        group: 'Filtering',
      },
      {
        key: '/',
        action: () => setActiveModal('search'),
        description: 'Search',
        group: 'Filtering',
      },
      {
        key: 'alt+f',
        action: () => {
          const store = useStore.getState();
          const hasFilters = store.hasActiveFilters();
          if (hasFilters) {
            store.clearFilters();
          }
        },
        description: 'Clear Filters',
        condition: () => {
          const store = useStore.getState();
          return store.hasActiveFilters();
        },
        group: 'Filtering',
      },

      // Sorting
      {
        key: 'o',
        action: () => {
          // Create a simple sort modal or cycle through sort options
          const currentSort = useStore.getState().sortBy;
          const sortOptions = ['severity', 'name', 'status'];
          const currentIndex = sortOptions.indexOf(currentSort);
          const nextIndex = (currentIndex + 1) % sortOptions.length;
          useStore.getState().setSortBy(sortOptions[nextIndex]);
        },
        description: 'Sort',
        group: 'Sorting',
      },

      // General
      {
        key: 'c',
        action: () => setShowContextPane((prev) => !prev),
        description: 'Toggle Context',
        group: 'General',
      },
      {
        key: 'r',
        action: async () => {
          // Reload current scan's issues
          if (selectedScan && selectedScan.Id) {
            try {
              useStore.getState().setLoading(true);
              const issueList = await appScanService.listIssues(
                selectedScan.Id
              );
              useStore.getState().setIssues(issueList || []);
              useStore.getState().setLoading(false);
            } catch (err) {
              useStore.getState().setError(err.message);
              useStore.getState().setLoading(false);
            }
          }
        },
        description: 'Reload',
        condition: () => !!selectedScan,
        group: 'General',
      },
      {
        key: 'ctrl+o',
        action: () => setActiveModal('app'),
        description: 'App',
        group: 'General',
      },
      {
        key: 'ctrl+w',
        action: () => selectedApp && setActiveModal('scan'),
        description: 'Scan',
        condition: () => !!selectedApp,
        group: 'General',
      },
      {
        key: 'h',
        action: () => setActiveModal('help'),
        description: 'Help',
        group: 'General',
      },
      {
        key: '?',
        action: () => setActiveModal('help'),
        description: 'Help',
        group: 'General',
      },
      {
        key: 'q',
        action: () => exit(),
        description: 'Quit',
        group: 'General',
      },
      {
        key: 'ctrl+d',
        action: () => {
          setDebugMode(true);
          setDebugMessage('[DEBUG MODE ENABLED]');
        },
        description: 'Enable Debug',
        group: 'Debug',
      },
      {
        key: 'alt+d',
        action: () => {
          setDebugMode(false);
          setDebugMessage('');
        },
        description: 'Disable Debug',
        group: 'Debug',
      },
    ],
    [
      currentIssue,
      filteredIssues.length,
      selectedIssueIds.length,
      selectedIssues,
      selectedApp,
      selectedScan,
      appScanService,
      exit,
      flushCursorMove,
    ]
  );

  // Register and handle keyboard shortcuts
  useKeyboardShortcuts('issue-list', issueListShortcuts, {
    enabled: !activeModal && view === 'issue-list',
  });

  // Calculate content height accounting for status bar and optional debug bar
  const statusBarHeight = 1;
  const debugBarHeight = debugMode ? 1 : 0;
  const contentHeight = height - statusBarHeight - debugBarHeight;

  // Main layout
  return (
    <Layout
      header={null}
      footer={<StatusBar error={error} loading={loading} message="Ready" />}
      debugBar={<DebugBar message={debugMessage} visible={debugMode} />}
    >
      <Box flexDirection="row" height={contentHeight}>
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
          selectedIssueIds={selectedIssueIds}
          filterStatus={filterStatus}
          filterSeverity={filterSeverity}
          filterIssueType={filterIssueType}
          filterJira={filterJira}
          searchText={searchText}
          height={contentHeight}
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
        <HelpModal view={view} onClose={() => setActiveModal(null)} />
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
          onCancel={() => {
            if (isInitialSetup.current) {
              // During initial setup, exit the app
              logger.info('User cancelled application selection');
              exit();
            } else {
              // After initial setup, just close the modal
              setActiveModal(null);
            }
          }}
        />
      )}
      {activeModal === 'scan' && (
        <ScanSelectionModal
          scans={scans}
          onSelect={(scan) => {
            useStore.getState().setSelectedScan(scan);
            setActiveModal(null);
            // Mark initial setup as complete once a scan is selected
            isInitialSetup.current = false;
          }}
          onCancel={() => {
            if (isInitialSetup.current) {
              // During initial setup, exit the app
              logger.info('User cancelled scan selection');
              exit();
            } else {
              // After initial setup, just close the modal
              setActiveModal(null);
            }
          }}
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
          app={selectedApp}
          scan={selectedScan}
          config={appScanService.getConfig()}
          appScanService={appScanService}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'update' && selectedIssues.length > 0 && (
        <UpdateStatusModal
          issueCount={selectedIssues.length}
          issues={selectedIssues}
          onUpdate={async (status, comment, onProgress) => {
            // Get the app ID from first selected issue
            const appId = selectedIssues[0].ApplicationId;
            const issueIds = selectedIssues.map((issue) => issue.Id);

            const updateData = {
              Status: status,
              Comment: comment || '',
            };

            // Use chunked update with configurable batch size from config
            const chunkSize = appScanService.getConfig().getBulkUpdateChunkSize();
            const results = await appScanService.bulkUpdateIssuesChunked(
              issueIds,
              appId,
              updateData,
              chunkSize,
              onProgress
            );
            
            logger.info('Status updated', {
              count: selectedIssues.length,
              successful: results.successful,
              failed: results.failed,
            });
            
            if (results.failed > 0) {
              logger.error('Some updates failed', { errors: results.errors });
              throw new Error(`${results.failed} issue(s) failed to update`);
            }
            
            useStore.getState().clearSelection();
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'jira' && selectedIssues.length > 0 && (
        <CreateJiraModal
          issues={selectedIssues}
          defaultProjectKey={jiraService.getProjectKey()}
          onCreate={async (projectKey, groupBy, issues) => {
            await jiraService.createIssues(
              projectKey,
              groupBy,
              issues,
              appScanService,
              selectedApp,
              selectedScan
            );
            logger.info('Jira issue created');
            useStore.getState().clearSelection();
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'link-jira' && selectedIssues.length > 0 && (
        <LinkJiraModal
          issueCount={selectedIssues.length}
          onLink={async (jiraKey) => {
            // Get the app ID from first selected issue
            const appId = selectedIssues[0].ApplicationId;
            const issueIds = selectedIssues.map((issue) => issue.Id);

            await appScanService.bulkUpdateIssues(issueIds, appId, {
              ExternalId: jiraKey,
            });
            logger.info('Issues linked to Jira', {
              issueCount: issueIds.length,
              jiraKey,
            });

            // Reload issues to reflect updated ExternalId
            const updatedIssues = await appScanService.listIssues(
              selectedScan.Id
            );
            useStore.getState().setIssues(updatedIssues || []);
            useStore.getState().clearSelection();
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'unlink-jira' && selectedIssues.length > 0 && (
        <UnlinkJiraModal
          issueCount={selectedIssues.length}
          jiraKeys={selectedIssues
            .map((issue) => issue.ExternalId)
            .filter((id) => !!id)}
          onUnlink={async () => {
            // Get the app ID from first selected issue
            const appId = selectedIssues[0].ApplicationId;
            const issueIds = selectedIssues.map((issue) => issue.Id);

            await appScanService.bulkUpdateIssues(issueIds, appId, {
              ExternalId: '',
            });
            logger.info('Issues unlinked from Jira', {
              issueCount: issueIds.length,
            });

            // Reload issues to reflect updated ExternalId
            const updatedIssues = await appScanService.listIssues(
              selectedScan.Id
            );
            useStore.getState().setIssues(updatedIssues || []);
            useStore.getState().clearSelection();
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'details' && currentIssue && (
        <IssueDetailsModal
          issue={currentIssue}
          articleContent={articleContent}
          appScanService={appScanService}
          config={appScanService.getConfig()}
          onClose={() => setActiveModal(null)}
        />
      )}
    </Layout>
  );
};

export default InkApp;
