/**
 * InkApp - Main TUI Application
 * Optimized 3-pane layout with memoization and no render loops
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { useStore } from './state/AppContext.js';
import { filterIssues } from './utils/issue.js';
import { Layout } from '../../shared/components/Layout.js';
import { Panel } from '../../shared/components/Panel.js';
import { ScrollableList } from '../../shared/components/ScrollableList.js';
import { DebugBar } from '../../shared/components/DebugBar.js';
import { KeyboardHint } from '../../shared/components/KeyboardHint.js';
import { RootSelectionWindow } from './components/RootSelectionWindow.js';
import { FolderSelectionWindow } from './components/FolderSelectionWindow.js';
import { HelpModal } from '../../shared/components/HelpModal.js';
import { FilterModal } from './modals/FilterModal.js';
import { SearchModal } from '../../shared/components/SearchModal.js';
import { LinksModal } from './components/LinksModal.js';
import { EditAppPropertiesWindow } from './components/EditAppPropertiesWindow.js';
import { UpdateStatusModal } from './modals/UpdateStatusModal.js';
import { UpdateSeverityModal } from './modals/UpdateSeverityModal.js';
import { TextInputPage } from '../../shared/components/TextInputPage.js';
import { CreateJiraModal } from './modals/CreateJiraModal.js';
import { LinkJiraModal } from './modals/LinkJiraModal.js';
import { UnlinkJiraModal } from './modals/UnlinkJiraModal.js';
import { AppScanService } from '../../shared/services/asoc.js';
import { JiraService } from '../../shared/services/jira.js';
import { useCurrentIssue } from './hooks/useCurrentIssue.js';
import { useArticleCache } from './hooks/useArticleCache.js';
import { useCommentsCache } from './hooks/useCommentsCache.js';
import { useTerminalSize } from '../../shared/hooks/useTerminalSize.js';
import { useKeyboardShortcuts } from '../../shared/hooks/useKeyboardShortcuts.js';
import logger from '../../../utils/logger.js';
import { getPackageInfo } from '../../../utils/package-info.js';
import { Formatter } from '../../../utils/formatter.js';
import open from 'open';

/**
 * Context pane displaying selected application and scan information
 * @param {Object} props - Component props
 * @param {Object} props.app - Selected application with name, ID, and custom fields
 * @param {Object} props.scan - Selected scan information
 * @param {number} props.issuesCount - Total number of issues
 * @param {Array} props.shortcuts - Array of keyboard shortcuts to display
 * @param {Function} props.onToggle - Toggle handler (unused)
 * @returns {JSX.Element}
 */
const ContextPane = React.memo(
  ({ app, scan, issuesCount, shortcuts, onToggle: _onToggle }) => {
    if (!app && !scan) return null;

    // Filter shortcuts that have hint: true
    const hintShortcuts = shortcuts?.filter((s) => s.hint) || [];

    // Check if viewing all issues (application mode)
    const isViewingAll = scan?._isViewAll || scan?.Id === '__VIEW_ALL__';

    return (
      <Panel title="Context [c to toggle]" borderColor="blue" width={60}>
        {app && (
          <Box flexDirection="column">
            <Text> </Text>
            <Text bold>App: </Text>
            <Text wrap="truncate">{app.Name || 'Unknown'}</Text>
            <Text dimColor>ID: {app.Id || 'N/A'}</Text>
            <Text dimColor>
              Issues: {issuesCount ?? app.IssueCountTotal ?? 0}
            </Text>

            {/* Custom Fields */}
            {app.customFields &&
              Object.keys(app.customFields).some(
                (k) => app.customFields[k]
              ) && (
                <Box flexDirection="column" marginTop={1}>
                  <Text bold dimColor>
                    Project Info:
                  </Text>
                  {app.customFields.JiraProject && (
                    <Text dimColor>Jira: {app.customFields.JiraProject}</Text>
                  )}
                  {app.customFields.DevOpsProject && (
                    <Text dimColor>
                      DevOps: {app.customFields.DevOpsProject}
                    </Text>
                  )}
                  {app.customFields.DevOpsRepo && (
                    <Text dimColor>Repo: {app.customFields.DevOpsRepo}</Text>
                  )}
                  {app.customFields.ConfluenceSpace && (
                    <Text dimColor>
                      Wiki: {app.customFields.ConfluenceSpace}
                    </Text>
                  )}
                  {app.customFields.JiraParentEpic && (
                    <Text dimColor>
                      Epic: {app.customFields.JiraParentEpic}
                    </Text>
                  )}
                </Box>
              )}
          </Box>
        )}
        {scan && !isViewingAll && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Scan: </Text>
            <Text wrap="truncate">{scan.Name || 'Unknown'}</Text>
            <Text dimColor>ID: {scan.Id || 'N/A'}</Text>
            <Text dimColor>Type: {scan.Technology || 'N/A'}</Text>
          </Box>
        )}
        {isViewingAll && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="green">
              Mode:{' '}
            </Text>
            <Text color="green">Viewing all issues across all scans</Text>
          </Box>
        )}
        {hintShortcuts.length > 0 && (
          <Box flexDirection="column" marginTop={2}>
            <Box
              borderStyle="round"
              borderColor="green"
              paddingX={1}
              paddingY={0}
              flexDirection="column"
            >
              <Text bold color="green">
                Hints
              </Text>
              <Box flexDirection="column" marginTop={1}>
                {hintShortcuts.map((shortcut, index) => (
                  <KeyboardHint
                    key={index}
                    keyString={shortcut.key}
                    description={shortcut.description}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Panel>
    );
  }
);
ContextPane.displayName = 'ContextPane';

/**
 * Individual vulnerability row displaying severity, status, work items, comments, and type
 * @param {Object} props - Component props
 * @param {Object} props.issue - Vulnerability issue object with severity, status, type, ExternalId, and LastComment
 * @param {boolean} props.isSelected - Whether this row is the currently selected item
 * @param {boolean} props.isMultiSelected - Whether this row is included in multi-selection
 * @returns {JSX.Element}
 */
const VulnRow = React.memo(({ issue, isSelected, isMultiSelected }) => {
  const severity = issue.Severity || 'Unknown';
  const status = issue.Status || 'Unknown';
  const type = issue.IssueType || 'Unknown';
  const workItemRef = issue.ExternalId || '';
  const hasComments = !!issue.LastComment;

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
      <Box width={2} justifyContent="flex-start" marginRight={1}>
        <Text color={isSelected ? 'cyan' : undefined}>
          {isSelected ? '▶' : ' '}
        </Text>
      </Box>
      <Box width={6} justifyContent="flex-start" marginRight={1}>
        <Text color={isMultiSelected ? 'cyan' : undefined} wrap="truncate">
          {isMultiSelected ? '[✓]' : '[ ]'}
        </Text>
      </Box>
      <Box width={14} justifyContent="flex-start" marginRight={1}>
        <Text color={severityColor} bold={isSelected}>
          {severity}
        </Text>
      </Box>
      <Box width={13} justifyContent="flex-start" marginRight={1}>
        <Text color={isSelected ? 'cyan' : undefined}>{status}</Text>
      </Box>
      <Box width={14} justifyContent="flex-start" marginRight={1}>
        <Text color={workItemRef ? 'green' : 'dimColor'}>
          {workItemRef || '-'}
        </Text>
      </Box>
      <Box width={6} justifyContent="flex-start" marginRight={1}>
        <Text color={hasComments ? 'yellow' : 'dimColor'}>
          {hasComments ? '💬' : '-'}
        </Text>
      </Box>
      <Box flexGrow={1} minWidth={0} justifyContent="flex-start">
        <Text color={isSelected ? 'cyan' : undefined} wrap="truncate">
          {type}
        </Text>
      </Box>
    </Box>
  );
});
VulnRow.displayName = 'VulnRow';

/**
 * Panel displaying list of vulnerabilities with filtering and selection indicators
 * Includes filter status display, column headers, and scrollable list
 * @param {Object} props - Component props
 * @param {Array} props.issues - Array of filtered vulnerability issues
 * @param {number} props.cursor - Current cursor position in the list
 * @param {Array<string>} props.selectedIssueIds - Array of selected issue IDs for multi-selection
 * @param {string} props.filterStatus - Active status filter
 * @param {string} props.filterSeverity - Active severity filter
 * @param {string} props.filterIssueType - Active issue type filter
 * @param {string} props.filterJira - Active Jira filter (with/without)
 * @param {string} props.searchText - Active search text
 * @param {string} props.filterPreset - Active filter preset name
 * @param {string} props.filterDateRange - Active date range filter
 * @param {Function} props.onCursorChange - Cursor change handler (unused)
 * @param {number} props.height - Available height for panel
 * @returns {JSX.Element}
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
    filterPreset,
    filterDateRange,
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
    if (filterPreset) {
      const presetLabels = {
        active: 'Preset:Active',
        inactive: 'Preset:Inactive',
        pending: 'Preset:Pending',
        processed: 'Preset:Processed',
        low: 'Preset:Low Severity',
        medium: 'Preset:Medium Severity',
        high: 'Preset:High Severity',
        assigned: 'Preset:Jira Assigned',
        unassigned: 'Preset:Jira Unassigned',
      };
      activeFilters.push(
        presetLabels[filterPreset] || `Preset:${filterPreset}`
      );
    }
    if (filterStatus) activeFilters.push(`Status:${filterStatus}`);
    if (filterSeverity) activeFilters.push(`Severity:${filterSeverity}`);
    if (filterIssueType) activeFilters.push(`Type:${filterIssueType}`);
    if (filterJira) activeFilters.push(`Jira:${filterJira}`);
    if (searchText) activeFilters.push(`Search:"${searchText}"`);
    if (filterDateRange) {
      const dateRangeLabels = {
        'last-sync': 'Since last sync',
        '24h': 'Last 24h',
        '1w': 'Last 1 week',
        '1m': 'Last 1 month',
        '3m': 'Last 3 months',
        '6m': 'Last 6 months',
      };
      activeFilters.push(
        `Date:${dateRangeLabels[filterDateRange] || filterDateRange}`
      );
    }
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
          <Box width={2} justifyContent="flex-start" marginRight={1}>
            <Text bold dimColor>
              {' '}
            </Text>
          </Box>
          <Box width={6} justifyContent="flex-start" marginRight={1}>
            <Text bold dimColor>
              Sel
            </Text>
          </Box>
          <Box width={14} justifyContent="flex-start" marginRight={1}>
            <Text bold dimColor>
              Severity
            </Text>
          </Box>
          <Box width={13} justifyContent="flex-start" marginRight={1}>
            <Text bold dimColor>
              Status
            </Text>
          </Box>
          <Box width={14} justifyContent="flex-start" marginRight={1}>
            <Text bold dimColor>
              Work Items
            </Text>
          </Box>
          <Box width={6} justifyContent="flex-start" marginRight={1}>
            <Text bold dimColor>
              Cmts
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
 * Panel displaying detailed preview of selected vulnerability
 * Shows issue metadata, comments, and article content loading state
 * @param {Object} props - Component props
 * @param {Object} props.issue - Selected vulnerability issue
 * @param {Object} props.app - Selected application
 * @param {Object} props.scan - Selected scan (unused)
 * @param {string} props.articleContent - Loaded article content for the issue
 * @param {boolean} props.loading - Whether article content is loading
 * @param {Array} props.comments - Array of comments for the issue
 * @param {boolean} props.commentsLoading - Whether comments are loading
 * @returns {JSX.Element}
 */
const DetailsPreviewPanel = React.memo(
  ({
    issue,
    app,
    scan: _scan,
    articleContent,
    loading,
    comments,
    commentsLoading,
  }) => {
    if (!issue) {
      return (
        <Panel title="Details" borderColor="magenta" width={80}>
          <Text dimColor>Select an issue to view details</Text>
        </Panel>
      );
    }

    return (
      <Panel title="Details [d to toggle]" borderColor="magenta" width={80}>
        <Box flexDirection="column">
          <Text> </Text>
          <Text>
            <Text bold>Vulnerability ID:</Text> {issue.Id || 'N/A'}
          </Text>
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
          {app && (
            <Text wrap="truncate">
              <Text bold>Application Name:</Text> {app.Name || 'N/A'}
            </Text>
          )}
          {issue.ApplicationId && (
            <Text wrap="truncate">
              <Text bold>Application ID:</Text> {issue.ApplicationId}
            </Text>
          )}
          {issue.ScanName && (
            <Text wrap="truncate">
              <Text bold>Scan Name:</Text> {issue.ScanName}
            </Text>
          )}
          {issue.Scanner && (
            <Text wrap="truncate">
              <Text bold>Type of Scan:</Text>{' '}
              <Text
                color={Formatter.getScanTypeColor(
                  Formatter.scannerToTechnology(issue.Scanner)
                )}
              >
                {Formatter.normalizeScanType(
                  Formatter.scannerToTechnology(issue.Scanner)
                )}
              </Text>
            </Text>
          )}
          {issue.ExternalId && (
            <Text wrap="truncate">
              <Text bold>Jira ID:</Text> {issue.ExternalId}
            </Text>
          )}
          {Formatter.getIssueContext(issue) && (
            <Box flexDirection="column" marginTop={1}>
              <Text bold>Context:</Text>
              <Box
                borderStyle="single"
                borderColor="gray"
                paddingX={1}
                marginTop={1}
              >
                <Text wrap="truncate" dimColor>
                  {Formatter.getIssueContext(issue).substring(0, 500)}
                  {Formatter.getIssueContext(issue).length > 500 ? '...' : ''}
                </Text>
              </Box>
            </Box>
          )}
          {commentsLoading && (
            <Box marginTop={1}>
              <Box marginRight={1}>
                <Spinner />
              </Box>
              <Text>Loading comments...</Text>
            </Box>
          )}
          {!commentsLoading && comments && comments.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text bold>Comments:</Text>
              <Box
                borderStyle="single"
                borderColor="gray"
                paddingX={1}
                marginTop={1}
                flexDirection="column"
              >
                {comments.map((comment, index) => (
                  <Text key={index} dimColor>
                    • {comment.Comment || comment.Text || 'No comment text'}
                  </Text>
                ))}
              </Box>
            </Box>
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
  }
);
DetailsPreviewPanel.displayName = 'DetailsPreviewPanel';

/**
 * Status bar displaying error messages, loading indicators, and application info
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {boolean} props.loading - Whether application is in loading state
 * @param {string} props.message - Custom loading message
 * @param {boolean} props.excludePassedNoise - Whether Passed/Noise issues are excluded
 * @param {string} props.logFilePath - Path to the application log file
 * @returns {JSX.Element}
 */
const pkg = getPackageInfo();
const StatusBar = React.memo(
  ({ error, loading, message, excludePassedNoise, logFilePath }) => {
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
            <Box>
              <Text dimColor>
                ? Help | CTRL+O App | CTRL+W Scan | CTRL+Q Quit
              </Text>
              {excludePassedNoise && (
                <Text color="yellow" dimColor>
                  {' '}
                  | [Passed/Noise Excluded]
                </Text>
              )}
              {logFilePath && (
                <Text dimColor>
                  {' '}
                  | Log: <Text color="blue">{logFilePath}</Text>
                  <Text dimColor> (ALT+L)</Text>
                </Text>
              )}
            </Box>
          )}
        </Box>
        <Box>
          <Text dimColor>{rightText}</Text>
        </Box>
      </Box>
    );
  }
);
StatusBar.displayName = 'StatusBar';

/**
 * Main TUI application component with 3-pane layout
 * Manages application state, user interactions, and modal workflows
 * Optimized with memoization to prevent render loops
 * @param {Object} props - Component props
 * @param {string} props.configPath - Path to configuration file
 * @returns {JSX.Element}
 */
export const App = ({ configPath }) => {
  const { exit } = useApp();
  const { height } = useTerminalSize();

  // Services
  const [AsocService] = useState(() => new AppScanService(configPath));
  const [jiraService] = useState(
    () => new JiraService(AsocService.getConfig())
  );

  // Zustand state - ONLY subscribe to data, never to setters
  const selectedApp = useStore((state) => state.selectedApp);
  const selectedScan = useStore((state) => state.selectedScan);
  const applications = useStore((state) => state.applications);
  const scans = useStore((state) => state.scans);
  const listCursor = useStore((state) => state.listCursor);

  // Local UI state
  const [showContextPane, setShowContextPane] = useState(true);
  const [showDetailsPane, setShowDetailsPane] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // null | 'filter' | 'search' | 'help' | etc. (NOT for edit-app-properties)
  const [textInputConfig, setTextInputConfig] = useState(null); // Config for text input page
  const [standaloneWindow, setStandaloneWindow] = useState(null); // 'app' | 'scan' | 'edit-app-properties' | null - for standalone window rendering
  const [editAppPropertiesCursor, setEditAppPropertiesCursor] = useState(0); // Track cursor position in edit properties modal
  const [editAppPropertiesField, setEditAppPropertiesField] = useState(null); // Track field being edited
  const [debugMode, setDebugMode] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Ready'); // Custom loading message
  const isInitialSetup = useRef(true); // Track if we're in initial setup phase
  const pendingAppLoad = useRef(null); // Track pending app load
  const pendingScanLoad = useRef(null); // Track pending scan load

  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const view = useStore((state) => state.view);
  const issues = useStore((state) => state.issues);
  const fixGroups = useStore((state) => state.fixGroups);

  // Filter state - subscribe to each individually to avoid object creation
  const filterStatus = useStore((state) => state.filterStatus);
  const filterSeverity = useStore((state) => state.filterSeverity);
  const filterIssueType = useStore((state) => state.filterIssueType);
  const filterJira = useStore((state) => state.filterJira);
  const filterFixGroup = useStore((state) => state.filterFixGroup);
  const searchText = useStore((state) => state.searchText);
  const filterPreset = useStore((state) => state.filterPreset);
  const sortBy = useStore((state) => state.sortBy);
  const selectedIssueIds = useStore((state) => state.selectedIssueIds);
  const excludePassedNoise = useStore((state) => state.excludePassedNoise);
  const filterDateRange = useStore((state) => state.filterDateRange);
  const lastSyncDates = useStore((state) => state.lastSyncDates);

  // Compute the source key and last sync date for the current selection
  const isCurrentViewAll =
    selectedScan?._isViewAll || selectedScan?.Id === '__VIEW_ALL__';
  const currentSourceKey =
    isCurrentViewAll && selectedApp?.Id
      ? `app:${selectedApp.Id}`
      : selectedScan?.Id
        ? `scan:${selectedScan.Id}`
        : null;
  const lastSyncDate = currentSourceKey
    ? lastSyncDates[currentSourceKey]
    : undefined;

  // Log file path (stable reference – derived from logger)
  const logFilePath = useRef(logger.getLogFilePath()).current;

  // Setup logger debug callback on mount
  React.useEffect(() => {
    logger.setDebugCallback((message) => {
      setDebugMessage(message);
    });
  }, []);

  const hasLoadedApps = useRef(false);
  React.useEffect(() => {
    if (hasLoadedApps.current) return; // Guard against double-mounting
    hasLoadedApps.current = true;

    const loadApps = async () => {
      try {
        useStore.getState().setLoading(true);
        logger.info('Loading applications (TUI)');
        const apps = await AsocService.listApplications();
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
      setStandaloneWindow('app');
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
          return await AsocService.getArticle(id);
        }
        // Get focused article as markdown
        return await AsocService.getIssueArticle(issue);
      },
      [AsocService, issues]
    )
  );

  // Get comments for current issue using hook
  const { comments: issueComments, loading: commentsLoading } =
    useCommentsCache(
      currentIssue?.Id,
      useCallback(
        async (id) => {
          return await AsocService.getIssueComments(id);
        },
        [AsocService]
      )
    );

  const lastLoadedScanRef = useRef(null);
  React.useEffect(() => {
    if (!selectedScan || !selectedScan.Id) return;
    if (lastLoadedScanRef.current === selectedScan.Id) return; // Already loaded this scan

    let cancelled = false;

    (async () => {
      try {
        useStore.getState().setLoading(true);
        setLoadingMessage(`Loading issues for ${selectedScan.Name}...`);

        // Check if this is the "View all vulnerabilities" option
        const isViewAll =
          selectedScan._isViewAll || selectedScan.Id === '__VIEW_ALL__';

        // Build filter options with excludePassedNoise
        const filterOptions = excludePassedNoise
          ? { excludePassedNoise: true }
          : null;

        let issueList;
        if (isViewAll && selectedApp?.Id) {
          issueList = await AsocService.listIssues(
            selectedApp.Id,
            filterOptions,
            'Application'
          );
        } else {
          issueList = await AsocService.listIssues(
            selectedScan.Id,
            filterOptions
          );
        }

        if (cancelled) return;
        useStore.getState().setIssues(issueList || []);
        // Record successful sync timestamp per source (only on success – preserves last good date on failure)
        const sourceKey =
          isViewAll && selectedApp?.Id
            ? `app:${selectedApp.Id}`
            : `scan:${selectedScan.Id}`;
        useStore.getState().setLastSyncDate(sourceKey, new Date().toISOString());

        if (selectedApp?.Id) {
          try {
            const fixGroups = await AsocService.getFixGroups(
              'Application',
              selectedApp.Id,
              {}
            );
            if (!cancelled) {
              useStore.getState().setFixGroups(fixGroups || []);
            }
          } catch (err) {
            logger.error('Failed to load FixGroups', err);
            if (!cancelled) {
              useStore.getState().setFixGroups([]);
            }
          }
        }

        useStore.getState().setView('issue-list');
        lastLoadedScanRef.current = selectedScan.Id;
        useStore.getState().setLoading(false);
      } catch (err) {
        if (cancelled) return;
        logger.error('Failed to load issues', err, {
          scanId: selectedScan?.Id,
          appId: selectedApp?.Id,
          isViewAll:
            selectedScan?._isViewAll || selectedScan?.Id === '__VIEW_ALL__',
        });
        useStore.getState().setError(err.message || 'Failed to load issues');
        useStore.getState().setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedScan, selectedApp, AsocService, excludePassedNoise]);

  // Filtered issues - build from individual filter state
  const filteredIssues = useMemo(() => {
    return filterIssues(issues, {
      status: filterStatus,
      severity: filterSeverity,
      issueType: filterIssueType,
      jira: filterJira,
      fixgroup: filterFixGroup,
      searchText: searchText,
      sortBy: sortBy,
      dateRange: filterDateRange,
      lastSyncDate: lastSyncDate,
    });
  }, [
    issues,
    filterStatus,
    filterSeverity,
    filterIssueType,
    filterJira,
    filterFixGroup,
    searchText,
    sortBy,
    filterDateRange,
    lastSyncDate,
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
          useStore.getState().setListCursor(newCursor);
        }
      }
      flushTimeout.current = null;
    }, 16);
  }, [filteredIssuesLength]);

  // Helper: Get filter options for a preset
  const getFilterOptionsForPreset = useCallback(
    (presetName, excludePassedNoise) => {
      const presetMap = {
        active: { statusActive: true },
        inactive: { statusInactive: true },
        pending: { statusPending: true },
        processed: { statusProcessed: true },
        unassigned: { jiraUnassigned: true },
        assigned: { jiraAssigned: true },
        low: { severityLow: true },
        medium: { severityMedium: true },
        high: { severityHigh: true },
      };
      const options = presetMap[presetName] || {};

      if (excludePassedNoise) {
        options.excludePassedNoise = true;
      }

      return Object.keys(options).length > 0 ? options : null;
    },
    []
  );

  // Helper: Apply filter preset and fetch filtered issues
  const applyFilterPreset = useCallback(
    async (presetName) => {
      if (!selectedScan?.Id) return;

      const store = useStore.getState();
      store.applyFilterPreset(presetName);

      try {
        store.setLoading(true);

        const isViewAll =
          selectedScan._isViewAll || selectedScan.Id === '__VIEW_ALL__';
        const filterOptions = getFilterOptionsForPreset(
          presetName,
          store.excludePassedNoise
        );

        let issueList;
        if (isViewAll && selectedApp?.Id) {
          issueList = await AsocService.listIssues(
            selectedApp.Id,
            filterOptions,
            'Application'
          );
        } else {
          issueList = await AsocService.listIssues(
            selectedScan.Id,
            filterOptions
          );
        }

        store.setIssues(issueList || []);
        store.setLoading(false);
      } catch (err) {
        logger.error(`Failed to apply ${presetName} filter`, err, {
          scanId: selectedScan?.Id,
          appId: selectedApp?.Id,
          isViewAll:
            selectedScan?._isViewAll || selectedScan?.Id === '__VIEW_ALL__',
        });
        store.setError(err.message);
        store.setLoading(false);
      }
    },
    [selectedScan, selectedApp, AsocService, getFilterOptionsForPreset]
  );

  // Helper: Reload issues with current filters
  const reloadIssues = useCallback(async () => {
    if (!selectedScan?.Id) return;

    const store = useStore.getState();

    try {
      store.setLoading(true);

      const isViewAll =
        selectedScan._isViewAll || selectedScan.Id === '__VIEW_ALL__';

      // Check if there's an active filter preset
      const currentPreset = store.filterPreset;
      const filterOptions = currentPreset
        ? getFilterOptionsForPreset(currentPreset, store.excludePassedNoise)
        : store.excludePassedNoise
          ? { excludePassedNoise: true }
          : null;

      let issueList;
      if (isViewAll && selectedApp?.Id) {
        issueList = await AsocService.listIssues(
          selectedApp.Id,
          filterOptions,
          'Application'
        );
      } else {
        issueList = await AsocService.listIssues(
          selectedScan.Id,
          filterOptions
        );
      }

      store.setIssues(issueList || []);
      // Update last sync date per source only on success
      const sourceKey =
        isViewAll && selectedApp?.Id
          ? `app:${selectedApp.Id}`
          : `scan:${selectedScan.Id}`;
      store.setLastSyncDate(sourceKey, new Date().toISOString());

      // Load FixGroups for the application
      if (selectedApp?.Id) {
        try {
          const fixGroups = await AsocService.getFixGroups(
            'Application',
            selectedApp.Id,
            {}
          );
          store.setFixGroups(fixGroups || []);
        } catch (err) {
          logger.error('Failed to load FixGroups', err);
          // Don't fail the whole operation if FixGroups fail to load
          store.setFixGroups([]);
        }
      }

      store.setLoading(false);
    } catch (err) {
      logger.error('Failed to reload issues', err, {
        scanId: selectedScan?.Id,
        appId: selectedApp?.Id,
        isViewAll:
          selectedScan?._isViewAll || selectedScan?.Id === '__VIEW_ALL__',
        currentPreset: useStore.getState().filterPreset,
      });
      store.setError(err.message);
      store.setLoading(false);
    }
  }, [selectedScan, selectedApp, AsocService, getFilterOptionsForPreset]);

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
      {
        key: 'leftarrow',
        action: () => {
          if (currentIssue && selectedApp) {
            const url = AsocService.getIssueUrl(
              selectedApp.Id,
              currentIssue.Id
            );
            open(url).catch(() => {
              // Silently fail if we can't open the link
            });
          }
        },
        description: 'Open Vulnerability',
        condition: () => !!currentIssue && !!selectedApp,
        group: 'Navigation',
        hint: true,
      },
      {
        key: 'rightarrow',
        action: () => {
          if (currentIssue && currentIssue.SourceFileUri) {
            open(currentIssue.SourceFileUri).catch(() => {
              // Silently fail if we can't open the link
            });
          }
        },
        description: 'Open Code',
        condition: () => !!currentIssue && !!currentIssue.SourceFileUri,
        group: 'Navigation',
        hint: true,
      },
      {
        key: 'ctrl+rightarrow',
        action: () => {
          const jiraUrl = AsocService.getJiraUrl(currentIssue);
          if (jiraUrl) {
            open(jiraUrl).catch(() => {
              // Silently fail if we can't open the link
            });
          }
        },
        description: 'Open Jira',
        condition: () => {
          const jiraUrl = AsocService.getJiraUrl(currentIssue);
          return !!jiraUrl;
        },
        group: 'Navigation',
        hint: true,
      },
      {
        key: 'ctrl+leftarrow',
        action: () => {
          // In "All Scans" mode, get the scan ID from the current issue
          const isViewingAll =
            selectedScan?._isViewAll || selectedScan?.Id === '__VIEW_ALL__';
          const scanId = isViewingAll ? currentIssue?.ScanId : selectedScan?.Id;

          if (selectedApp?.Id && scanId) {
            const scanUrl = AsocService.getScanUrl(selectedApp.Id, scanId);
            open(scanUrl).catch(() => {
              // Silently fail if we can't open the link
            });
          }
        },
        description: 'Open Scan',
        condition: () => {
          const isViewingAll =
            selectedScan?._isViewAll || selectedScan?.Id === '__VIEW_ALL__';
          if (!selectedApp) return false;
          if (isViewingAll) {
            return !!currentIssue && !!currentIssue.ScanId;
          }
          return !!selectedScan && !!selectedScan.Id;
        },
        group: 'Navigation',
        hint: true,
      },

      // Selection
      {
        key: 'space',
        action: () => {
          if (currentIssue) {
            useStore.getState().toggleIssueSelection(currentIssue.Id);
            // Automatically move to next vulnerability after selection
            pendingCursorMove.current += 1;
            flushCursorMove();
          }
        },
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
        key: 'p',
        action: () => selectedApp && setStandaloneWindow('edit-app-properties'),
        description: 'Edit App Properties',
        condition: () => !!selectedApp,
        group: 'Actions',
      },
      {
        key: 'u',
        action: () => currentIssue && setActiveModal('update'),
        description: 'Update Status',
        condition: () => !!currentIssue,
        group: 'Actions',
      },
      {
        key: 's',
        action: () => currentIssue && setActiveModal('update-severity'),
        description: 'Update Severity',
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
        action: () => issues.length > 0 && setActiveModal('filter'),
        description: 'Filter',
        condition: () => issues.length > 0,
        group: 'Filtering',
      },
      {
        key: '/',
        action: () => setActiveModal('search'),
        description: 'Search',
        group: 'Filtering',
      },
      // Filter Presets - Status
      {
        key: '1',
        action: () => applyFilterPreset('active'),
        description: 'Active Status',
        condition: () => !!selectedScan,
        group: 'Filter Presets',
      },
      {
        key: 'alt+1',
        action: () => applyFilterPreset('inactive'),
        description: 'Inactive Status',
        condition: () => !!selectedScan,
        group: 'Filter Presets',
      },
      {
        key: '2',
        action: () => applyFilterPreset('pending'),
        description: 'Pending Status',
        condition: () => !!selectedScan,
        group: 'Filter Presets',
      },
      {
        key: 'alt+2',
        action: () => applyFilterPreset('processed'),
        description: 'Processed Status',
        condition: () => !!selectedScan,
        group: 'Filter Presets',
      },
      // Filter Presets - Jira
      {
        key: '3',
        action: () => applyFilterPreset('unassigned'),
        description: 'Jira Unassigned',
        condition: () => !!selectedScan,
        group: 'Filter Presets',
      },
      {
        key: 'alt+3',
        action: () => applyFilterPreset('assigned'),
        description: 'Jira Assigned',
        condition: () => !!selectedScan,
        group: 'Filter Presets',
      },
      // Filter Presets - Severity
      {
        key: '4',
        action: () => applyFilterPreset('low'),
        description: 'Low Severity',
        condition: () => !!selectedScan,
        group: 'Filter Presets',
      },
      {
        key: '5',
        action: () => applyFilterPreset('medium'),
        description: 'Medium Severity',
        condition: () => !!selectedScan,
        group: 'Filter Presets',
      },
      {
        key: '6',
        action: () => applyFilterPreset('high'),
        description: 'High Severity',
        condition: () => !!selectedScan,
        group: 'Filter Presets',
      },
      {
        key: 'alt+f',
        action: async () => {
          const store = useStore.getState();
          const hasFilters = store.hasActiveFilters() || store.filterPreset;
          if (hasFilters && selectedScan?.Id) {
            store.clearFilters();
            // Reload all issues with current excludePassedNoise setting
            try {
              store.setLoading(true);

              // Check if viewing all issues (application mode)
              const isViewAll =
                selectedScan._isViewAll || selectedScan.Id === '__VIEW_ALL__';

              // Build filter options with excludePassedNoise if enabled
              const filterOptions = store.excludePassedNoise
                ? { excludePassedNoise: true }
                : null;

              let issueList;
              if (isViewAll && selectedApp?.Id) {
                issueList = await AsocService.listIssues(
                  selectedApp.Id,
                  filterOptions,
                  'Application'
                );
              } else {
                issueList = await AsocService.listIssues(
                  selectedScan.Id,
                  filterOptions
                );
              }

              store.setIssues(issueList || []);
              store.setLoading(false);
            } catch (err) {
              logger.error('Failed to clear filters and reload', err, {
                scanId: selectedScan?.Id,
                appId: selectedApp?.Id,
              });
              store.setError(err.message);
              store.setLoading(false);
            }
          }
        },
        description: 'Clear Filters',
        condition: () => {
          const store = useStore.getState();
          return store.hasActiveFilters() || store.filterPreset;
        },
        group: 'Filtering',
      },
      {
        key: 'x',
        action: async () => {
          const store = useStore.getState();
          if (!store.excludePassedNoise) {
            // Enable exclusion
            store.setExcludePassedNoise(true);
            await reloadIssues();
          }
        },
        description: 'Exclude Noise/Passed',
        condition: () => !!selectedScan && !excludePassedNoise,
        group: 'Filtering',
        hint: true,
      },
      {
        key: 'alt+x',
        action: async () => {
          const store = useStore.getState();
          if (store.excludePassedNoise) {
            // Disable exclusion
            store.setExcludePassedNoise(false);
            await reloadIssues();
          }
        },
        description: 'Include All',
        condition: () => !!selectedScan && excludePassedNoise,
        group: 'Filtering',
        hint: true,
      },

      // Sorting
      {
        key: 'o',
        action: () => {
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
        key: 'd',
        action: () => setShowDetailsPane((prev) => !prev),
        description: 'Toggle Details',
        group: 'General',
      },
      {
        key: 'r',
        action: reloadIssues,
        description: 'Reload',
        condition: () => !!selectedScan,
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
        hint: true,
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
      {
        key: 'alt+l',
        action: () => {
          open(logFilePath).catch((err) => {
            logger.error('Failed to open log file', err);
          });
        },
        description: 'Open Log File',
        group: 'General',
      },
    ],
    [
      currentIssue,
      filteredIssues.length,
      selectedIssueIds.length,
      selectedIssues,
      selectedApp,
      selectedScan,
      AsocService,
      exit,
      flushCursorMove,
      applyFilterPreset,
      reloadIssues,
      excludePassedNoise,
      logFilePath,
    ]
  );

  // General shortcuts that are always available
  const generalShortcuts = useMemo(
    () => [
      {
        key: 'ctrl+o',
        action: () => setStandaloneWindow('app'),
        description: 'App',
        group: 'General',
      },
      {
        key: 'ctrl+w',
        action: () => selectedApp && setStandaloneWindow('scan'),
        description: 'Scan',
        condition: () => !!selectedApp,
        group: 'General',
      },
      {
        key: 'ctrl+q',
        action: () => exit(),
        description: 'Quit',
        group: 'General',
      },
    ],
    [selectedApp, exit]
  );

  // Register general shortcuts (always enabled)
  useKeyboardShortcuts('general', generalShortcuts, {
    enabled: !activeModal && !standaloneWindow && !textInputConfig,
  });

  // Register issue-list shortcuts
  useKeyboardShortcuts('issue-list', issueListShortcuts, {
    enabled: !activeModal && !standaloneWindow && view === 'issue-list',
  });

  // Calculate content height accounting for status bar and optional debug bar
  const statusBarHeight = 1;
  const debugBarHeight = debugMode ? 1 : 0;
  const contentHeight = height - statusBarHeight - debugBarHeight;

  // If standalone window is active, render ONLY that (no Layout, no other components)
  if (standaloneWindow === 'app') {
    return (
      <RootSelectionWindow
        applications={applications}
        onSelect={async (app) => {
          // Cancel any pending app or scan loads
          if (pendingAppLoad.current) {
            pendingAppLoad.current.cancelled = true;
          }
          if (pendingScanLoad.current) {
            pendingScanLoad.current.cancelled = true;
          }

          const loadTracker = { cancelled: false };
          pendingAppLoad.current = loadTracker;

          // Close window immediately for visual feedback
          setStandaloneWindow(null);

          useStore.getState().setSelectedApp(app);
          useStore.getState().setIssues([]); // Clear issues immediately
          useStore.getState().setView('issue-list'); // Show empty list with loading state
          useStore.getState().setLoading(true);
          setLoadingMessage(`Loading scans for ${app.Name}...`);

          try {
            const scanList = await AsocService.listScans(app.Id);

            // Check if this load was cancelled
            if (loadTracker.cancelled) {
              return;
            }

            useStore.getState().setScans(scanList || []);
            // Auto-open scan selection
            if (scanList && scanList.length > 0) {
              setStandaloneWindow('scan');
            }
          } catch (err) {
            if (loadTracker.cancelled) {
              return;
            }
            logger.error('Failed to load scans', err);
            useStore
              .getState()
              .setError(`Failed to load scans: ${err.message}`);
          } finally {
            if (!loadTracker.cancelled) {
              useStore.getState().setLoading(false);
            }
            isInitialSetup.current = false;
            if (pendingAppLoad.current === loadTracker) {
              pendingAppLoad.current = null;
            }
          }
        }}
        onCancel={() => {
          if (isInitialSetup.current) {
            logger.info('User cancelled application selection');
            exit();
          } else {
            setStandaloneWindow(null);
          }
        }}
        hideEmpty={false}
        AsocService={AsocService}
        selectedApp={selectedApp}
      />
    );
  }

  if (standaloneWindow === 'scan') {
    return (
      <FolderSelectionWindow
        scans={scans}
        onSelect={async (scan) => {
          // Cancel any pending app or scan loads
          if (pendingAppLoad.current) {
            pendingAppLoad.current.cancelled = true;
          }
          if (pendingScanLoad.current) {
            pendingScanLoad.current.cancelled = true;
          }

          const loadTracker = { cancelled: false };
          pendingScanLoad.current = loadTracker;

          // Close window immediately for visual feedback
          setStandaloneWindow(null);

          useStore.getState().setSelectedScan(scan);
          useStore.getState().setIssues([]); // Clear issues immediately
          useStore.getState().setView('issue-list'); // Show empty list with loading state
          useStore.getState().setLoading(true);
          setLoadingMessage(`Loading issues for ${scan.Name}...`);

          try {
            const isViewAll = scan._isViewAll || scan.Id === '__VIEW_ALL__';

            // Build filter options respecting excludePassedNoise setting
            const currentExcludePassedNoise =
              useStore.getState().excludePassedNoise;
            const filterOptions = currentExcludePassedNoise
              ? { excludePassedNoise: true }
              : null;

            let issueList;
            if (isViewAll) {
              issueList = await AsocService.listIssues(
                selectedApp.Id,
                filterOptions,
                'Application'
              );
            } else {
              issueList = await AsocService.listIssues(scan.Id, filterOptions);
            }

            // Check if this load was cancelled
            if (loadTracker.cancelled) {
              return;
            }

            useStore.getState().setIssues(issueList || []);

            // Load FixGroups for the application
            if (selectedApp?.Id) {
              try {
                const fixGroups = await AsocService.getFixGroups(
                  'Application',
                  selectedApp.Id,
                  {}
                );
                if (!loadTracker.cancelled) {
                  useStore.getState().setFixGroups(fixGroups || []);
                }
              } catch (err) {
                logger.error('Failed to load FixGroups', err);
                // Don't fail the whole operation if FixGroups fail to load
                if (!loadTracker.cancelled) {
                  useStore.getState().setFixGroups([]);
                }
              }
            }
          } catch (err) {
            if (loadTracker.cancelled) {
              return;
            }
            logger.error('Failed to load issues', err);
            useStore
              .getState()
              .setError(`Failed to load issues: ${err.message}`);
          } finally {
            if (!loadTracker.cancelled) {
              useStore.getState().setLoading(false);
            }
            if (pendingScanLoad.current === loadTracker) {
              pendingScanLoad.current = null;
            }
          }
        }}
        onCancel={() => setStandaloneWindow(null)}
        hideEmpty={false}
        AsocService={AsocService}
        selectedScan={selectedScan}
      />
    );
  }

  // If standalone edit app properties window is active
  if (standaloneWindow === 'edit-app-properties' && selectedApp) {
    // If we're editing a field, show text input
    if (editAppPropertiesField) {
      return (
        <TextInputPage
          title={`Edit ${editAppPropertiesField.label}`}
          subtitle={`Application: ${selectedApp.Name}`}
          borderColor={editAppPropertiesField.isCustom ? 'yellow' : 'cyan'}
          placeholder={editAppPropertiesField.value || 'Enter value...'}
          initialValue={editAppPropertiesField.value || ''}
          onSubmit={async (value) => {
            try {
              const currentApp = await AsocService.getApplicationDetails(
                selectedApp.Id
              );
              const apiPayload = {};

              if (!editAppPropertiesField.isCustom) {
                apiPayload[editAppPropertiesField.key] = value;
              } else {
                const fieldDef = currentApp._customFieldsRaw?.find(
                  (f) => f.Name === editAppPropertiesField.key
                );
                if (fieldDef) {
                  apiPayload.AppCustomFields = [
                    { Id: fieldDef.Id, Value: value || '' },
                  ];
                }
              }

              await AsocService.updateApplication(selectedApp.Id, apiPayload);
              const updatedApp = await AsocService.getApplicationDetails(
                selectedApp.Id
              );
              useStore.getState().setSelectedApp(updatedApp);

              // Return to field selection
              setEditAppPropertiesField(null);
            } catch (err) {
              logger.error('Failed to update application', err);
              setEditAppPropertiesField(null);
              setStandaloneWindow(null);
            }
          }}
          onCancel={() => {
            setEditAppPropertiesField(null);
          }}
        />
      );
    }

    // Show field selection
    return (
      <EditAppPropertiesWindow
        app={selectedApp}
        initialCursor={editAppPropertiesCursor}
        onSelectField={(field, fieldIndex) => {
          logger.info('Field selected for editing', {
            field: field.key,
            index: fieldIndex,
          });
          setEditAppPropertiesCursor(fieldIndex);
          setEditAppPropertiesField(field);
          logger.info('State updated', { editAppPropertiesField: field.key });
        }}
        onCancel={() => {
          logger.info('Edit app properties cancelled');
          setEditAppPropertiesCursor(0);
          setEditAppPropertiesField(null);
          setStandaloneWindow(null);
        }}
      />
    );
  }

  // If text input page is active, render ONLY that (no Layout, no other components)
  if (textInputConfig) {
    return (
      <TextInputPage
        title={textInputConfig.title}
        subtitle={textInputConfig.subtitle}
        borderColor={textInputConfig.borderColor}
        placeholder={textInputConfig.placeholder}
        initialValue={textInputConfig.initialValue}
        onSubmit={textInputConfig.onComplete}
        onCancel={textInputConfig.onCancel}
      />
    );
  }

  // Main layout
  return (
    <Layout
      header={null}
      footer={
        <StatusBar
          error={error}
          loading={loading}
          message={loading ? loadingMessage : 'Ready'}
          excludePassedNoise={excludePassedNoise}
          logFilePath={logFilePath}
        />
      }
      debugBar={<DebugBar message={debugMessage} visible={debugMode} />}
    >
      <Box flexDirection="row" height={contentHeight}>
        {/* Context Pane */}
        {showContextPane && (
          <ContextPane
            app={selectedApp}
            scan={selectedScan}
            issuesCount={issues.length}
            shortcuts={issueListShortcuts}
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
          filterPreset={filterPreset}
          filterDateRange={filterDateRange}
          height={contentHeight}
        />

        {/* Details Preview */}
        {showDetailsPane && (
          <DetailsPreviewPanel
            issue={currentIssue}
            app={selectedApp}
            scan={selectedScan}
            articleContent={articleContent}
            loading={articleLoading}
            comments={issueComments}
            commentsLoading={commentsLoading}
          />
        )}
      </Box>

      {/* Modals */}
      {activeModal === 'help' && (
        <HelpModal view={view} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'filter' && (
        <FilterModal
          issues={filteredIssues}
          fixGroups={fixGroups}
          onSelect={(filterType, value) => {
            if (filterType === 'status')
              useStore.getState().setFilterStatus(value);
            else if (filterType === 'severity')
              useStore.getState().setFilterSeverity(value);
            else if (filterType === 'type')
              useStore.getState().setFilterIssueType(value);
            else if (filterType === 'fixgroup')
              useStore.getState().setFilterFixGroup(value);
            else if (filterType === 'jira')
              useStore.getState().setFilterJira(value);
            else if (filterType === 'dateRange')
              useStore.getState().setFilterDateRange(value);
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
          config={AsocService.getConfig()}
          AsocService={AsocService}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'update' && selectedIssues.length > 0 && (
        <UpdateStatusModal
          issueCount={selectedIssues.length}
          issues={selectedIssues}
          onRequestTextInput={(config) => {
            setTextInputConfig({
              ...config,
              onComplete: (value) => {
                // Return to modal and trigger submit
                setTextInputConfig(null);
                config.onComplete(value);
              },
              onCancel: () => {
                // Return to modal
                setTextInputConfig(null);
              },
            });
          }}
          onUpdate={async (status, comment, onProgress) => {
            // Get the app ID from first selected issue
            const appId = selectedIssues[0].ApplicationId;
            const issueIds = selectedIssues.map((issue) => issue.Id);

            const updateData = {
              Status: status,
              Comment: comment || '',
            };

            // Use chunked update with configurable batch size from config
            const chunkSize = AsocService.getConfig().getBulkUpdateChunkSize();
            const results = await AsocService.bulkUpdateIssuesChunked(
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

            // Reload issues to reflect updated status and comment
            try {
              // Check if viewing all issues (application mode)
              const isViewAll =
                selectedScan._isViewAll || selectedScan.Id === '__VIEW_ALL__';

              // Check if there's an active filter preset and preserve it
              const currentPreset = useStore.getState().filterPreset;
              const currentExcludePassedNoise =
                useStore.getState().excludePassedNoise;
              const filterOptions = currentPreset
                ? getFilterOptionsForPreset(
                    currentPreset,
                    currentExcludePassedNoise
                  )
                : currentExcludePassedNoise
                  ? { excludePassedNoise: true }
                  : null;

              let updatedIssues;
              if (isViewAll && selectedApp?.Id) {
                // Reload all issues for the application
                updatedIssues = await AsocService.listIssues(
                  selectedApp.Id,
                  filterOptions,
                  'Application'
                );
              } else {
                // Reload issues for the specific scan
                updatedIssues = await AsocService.listIssues(
                  selectedScan.Id,
                  filterOptions
                );
              }

              useStore.getState().setIssues(updatedIssues || []);
              useStore.getState().clearSelection();
            } catch (err) {
              logger.error('Failed to reload issues after update', err, {
                scanId: selectedScan?.Id,
                appId: selectedApp?.Id,
                isViewAll:
                  selectedScan?._isViewAll ||
                  selectedScan?.Id === '__VIEW_ALL__',
              });
              throw new Error(
                `Updates succeeded but failed to reload: ${err.message}`
              );
            }
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'update-severity' && selectedIssues.length > 0 && (
        <UpdateSeverityModal
          issueCount={selectedIssues.length}
          issues={selectedIssues}
          onRequestTextInput={(config) => {
            setTextInputConfig({
              ...config,
              onComplete: (value) => {
                // Return to modal and trigger submit
                setTextInputConfig(null);
                config.onComplete(value);
              },
              onCancel: () => {
                // Return to modal
                setTextInputConfig(null);
              },
            });
          }}
          onUpdate={async (severity, comment, onProgress) => {
            // Get the app ID from first selected issue
            const appId = selectedIssues[0].ApplicationId;
            const issueIds = selectedIssues.map((issue) => issue.Id);

            const updateData = {
              Severity: severity,
              Comment: comment || '',
            };

            // Use chunked update with configurable batch size from config
            const chunkSize = AsocService.getConfig().getBulkUpdateChunkSize();
            const results = await AsocService.bulkUpdateIssuesChunked(
              issueIds,
              appId,
              updateData,
              chunkSize,
              onProgress
            );

            logger.info('Severity updated', {
              count: selectedIssues.length,
              successful: results.successful,
              failed: results.failed,
            });

            if (results.failed > 0) {
              logger.error('Some updates failed', { errors: results.errors });
              throw new Error(`${results.failed} issue(s) failed to update`);
            }

            // Reload issues to reflect updated severity and comment
            try {
              // Check if viewing all issues (application mode)
              const isViewAll =
                selectedScan._isViewAll || selectedScan.Id === '__VIEW_ALL__';

              // Check if there's an active filter preset and preserve it
              const currentPreset = useStore.getState().filterPreset;
              const currentExcludePassedNoise =
                useStore.getState().excludePassedNoise;
              const filterOptions = currentPreset
                ? getFilterOptionsForPreset(
                    currentPreset,
                    currentExcludePassedNoise
                  )
                : currentExcludePassedNoise
                  ? { excludePassedNoise: true }
                  : null;

              let updatedIssues;
              if (isViewAll && selectedApp?.Id) {
                // Reload all issues for the application
                updatedIssues = await AsocService.listIssues(
                  selectedApp.Id,
                  filterOptions,
                  'Application'
                );
              } else {
                // Reload issues for the specific scan
                updatedIssues = await AsocService.listIssues(
                  selectedScan.Id,
                  filterOptions
                );
              }

              useStore.getState().setIssues(updatedIssues || []);
              useStore.getState().clearSelection();
            } catch (err) {
              logger.error('Failed to reload issues after update', err, {
                scanId: selectedScan?.Id,
                appId: selectedApp?.Id,
                isViewAll:
                  selectedScan?._isViewAll ||
                  selectedScan?.Id === '__VIEW_ALL__',
              });
              throw new Error(
                `Updates succeeded but failed to reload: ${err.message}`
              );
            }
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'jira' && selectedIssues.length > 0 && (
        <CreateJiraModal
          issues={selectedIssues}
          defaultProjectKey={jiraService.getProjectKey()}
          appName={selectedApp?.Name}
          AsocService={AsocService}
          onSaveAvsComment={async (issueId, comment) => {
            const issue = selectedIssues.find((i) => i.Id === issueId);
            if (issue) {
              await AsocService.updateIssue(issueId, issue.ApplicationId, {
                Comment: comment,
              });
            }
          }}
          onCreate={async (
            projectKey,
            groupBy,
            issues,
            parentEpic,
            appName
          ) => {
            await jiraService.createIssues(
              projectKey,
              groupBy,
              issues,
              AsocService,
              selectedApp,
              selectedScan,
              parentEpic,
              appName
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

            await AsocService.bulkUpdateIssues(issueIds, appId, {
              ExternalId: jiraKey,
            });
            logger.info('Issues linked to Jira', {
              issueCount: issueIds.length,
              jiraKey,
            });

            // Reload issues to reflect updated ExternalId
            try {
              // Check if viewing all issues (application mode)
              const isViewAll =
                selectedScan._isViewAll || selectedScan.Id === '__VIEW_ALL__';

              // Check if there's an active filter preset and preserve it
              const currentPreset = useStore.getState().filterPreset;
              const currentExcludePassedNoise =
                useStore.getState().excludePassedNoise;
              const filterOptions = currentPreset
                ? getFilterOptionsForPreset(
                    currentPreset,
                    currentExcludePassedNoise
                  )
                : currentExcludePassedNoise
                  ? { excludePassedNoise: true }
                  : null;

              let updatedIssues;
              if (isViewAll && selectedApp?.Id) {
                // Reload all issues for the application
                updatedIssues = await AsocService.listIssues(
                  selectedApp.Id,
                  filterOptions,
                  'Application'
                );
              } else {
                // Reload issues for the specific scan
                updatedIssues = await AsocService.listIssues(
                  selectedScan.Id,
                  filterOptions
                );
              }

              useStore.getState().setIssues(updatedIssues || []);
              useStore.getState().clearSelection();
            } catch (err) {
              logger.error('Failed to reload issues after linking', err, {
                scanId: selectedScan?.Id,
                appId: selectedApp?.Id,
              });
              throw new Error(
                `Link succeeded but failed to reload: ${err.message}`
              );
            }
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

            await AsocService.bulkUpdateIssues(issueIds, appId, {
              ExternalId: '',
            });
            logger.info('Issues unlinked from Jira', {
              issueCount: issueIds.length,
            });

            // Reload issues to reflect updated ExternalId
            try {
              // Check if viewing all issues (application mode)
              const isViewAll =
                selectedScan._isViewAll || selectedScan.Id === '__VIEW_ALL__';

              // Check if there's an active filter preset and preserve it
              const currentPreset = useStore.getState().filterPreset;
              const currentExcludePassedNoise =
                useStore.getState().excludePassedNoise;
              const filterOptions = currentPreset
                ? getFilterOptionsForPreset(
                    currentPreset,
                    currentExcludePassedNoise
                  )
                : currentExcludePassedNoise
                  ? { excludePassedNoise: true }
                  : null;

              let updatedIssues;
              if (isViewAll && selectedApp?.Id) {
                // Reload all issues for the application
                updatedIssues = await AsocService.listIssues(
                  selectedApp.Id,
                  filterOptions,
                  'Application'
                );
              } else {
                // Reload issues for the specific scan
                updatedIssues = await AsocService.listIssues(
                  selectedScan.Id,
                  filterOptions
                );
              }

              useStore.getState().setIssues(updatedIssues || []);
              useStore.getState().clearSelection();
            } catch (err) {
              logger.error('Failed to reload issues after unlinking', err, {
                scanId: selectedScan?.Id,
                appId: selectedApp?.Id,
              });
              throw new Error(
                `Unlink succeeded but failed to reload: ${err.message}`
              );
            }
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'details' && currentIssue && (
        <IssueDetailsModal
          issue={currentIssue}
          app={selectedApp}
          articleContent={articleContent}
          AsocService={AsocService}
          config={AsocService.getConfig()}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'details' && currentIssue && (
        <IssueDetailsModal
          issue={currentIssue}
          app={selectedApp}
          articleContent={articleContent}
          AsocService={AsocService}
          config={AsocService.getConfig()}
          onClose={() => setActiveModal(null)}
        />
      )}
    </Layout>
  );
};

export default App;
