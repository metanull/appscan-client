/**
 * AzdoApp - Main Azure DevOps TUI Application
 * Optimized 3-pane layout with memoization and no render loops
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { useStore } from './state/AppContext.js';
import {
  filterIssues,
  getStateName,
  getSeverityName,
  getAlertTypeName,
  getDismissalTypeName,
  getComputedStatus,
  COMPUTED_STATUS_COLORS,
  parseAlertMetadata,
  getValidityResultName,
  getValidityResultColor,
  getDistinctFilePaths,
  getMostRecentFingerprint,
  parseFingerprintJson,
} from './utils/issue.js';
import { Layout } from '../../shared/components/Layout.js';
import { Panel } from '../../shared/components/Panel.js';
import { ScrollableList } from '../../shared/components/ScrollableList.js';
import { DebugBar } from '../../shared/components/DebugBar.js';
import { KeyboardHint } from '../../shared/components/KeyboardHint.js';
import { HelpModal } from '../../shared/components/HelpModal.js';
import { IssueModal } from './components/IssueModal.js';
import { LinksModal } from './components/LinksModal.js';
import { CreateJiraModal } from './modals/CreateJiraModal.js';
import { LinkJiraModal } from './modals/LinkJiraModal.js';
import { UnlinkJiraModal } from './modals/UnlinkJiraModal.js';
import { RootSelectionWindow } from './components/RootSelectionWindow.js';
import { FolderSelectionWindow } from './components/FolderSelectionWindow.js';
import { SearchModal } from '../../shared/components/SearchModal.js';
import { FilterModal } from './modals/FilterModal.js';
import { UpdateStatusModal } from './modals/UpdateStatusModal.js';
import { UpdateSeverityModal } from './modals/UpdateSeverityModal.js';
import { TextInputPage } from '../../shared/components/TextInputPage.js';
import { AzdoService } from '../../shared/services/azdo.js';
import { JiraService } from '../../shared/services/jira.js';
import { useCurrentIssue } from './hooks/useCurrentIssue.js';
import {
  useDetailedEntityLoader,
  useDetailedAlertLoader,
} from './hooks/useDetailedEntityLoader.js';
import { useTerminalSize } from '../../shared/hooks/useTerminalSize.js';
import { useKeyboardShortcuts } from '../../shared/hooks/useKeyboardShortcuts.js';
import logger from '../../../utils/logger.js';
import { getPackageInfo } from '../../../utils/package-info.js';
import open from 'open';

/**
 * Context pane displaying selected project and repository information
 */
const ContextPane = React.memo(
  ({ project, repository, alertsCount, shortcuts, onToggle: _onToggle }) => {
    if (!project && !repository) return null;

    const hintShortcuts = shortcuts?.filter((s) => s.hint) || [];
    const isViewingAll =
      repository?._isViewAll || repository?.id === '__VIEW_ALL__';

    return (
      <Panel title="Context [c to toggle]" borderColor="blue" width={60}>
        {project && (
          <Box flexDirection="column">
            <Text> </Text>
            <Text bold>Project: </Text>
            <Text wrap="truncate">{project.name || 'Unknown'}</Text>
            <Text dimColor>ID: {project.id || 'N/A'}</Text>
            <Text dimColor>Alerts: {alertsCount ?? 0}</Text>
          </Box>
        )}
        {repository && !isViewingAll && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Repository: </Text>
            <Text wrap="truncate">{repository.name || 'Unknown'}</Text>
            <Text dimColor>ID: {repository.id || 'N/A'}</Text>
          </Box>
        )}
        {isViewingAll && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="green">
              Mode:{' '}
            </Text>
            <Text color="green">
              Viewing all alerts across all repositories
            </Text>
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
 * Individual alert row displaying severity, state, Jira link, and type
 */
const AlertRow = React.memo(({ alert, isSelected, isMultiSelected }) => {
  const severityName = getSeverityName(alert.severity);
  const stateName = getStateName(alert.state);
  const dismissalType = alert.dismissal?.dismissalType;
  const dismissalTypeName =
    dismissalType !== undefined ? getDismissalTypeName(dismissalType) : null;
  const computedStatus = getComputedStatus(alert);
  const title = alert.title || alert.ruleName || 'Unknown';
  const metadata = parseAlertMetadata(alert);
  const jiraRef = metadata.jiraId || '';

  const severityColor =
    {
      Critical: 'red',
      High: 'red',
      Medium: 'yellow',
      Low: 'blue',
      Note: 'gray',
    }[severityName] || 'white';

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
          {severityName}
        </Text>
      </Box>
      <Box width={12} justifyContent="flex-start" marginRight={1}>
        <Text color={COMPUTED_STATUS_COLORS[computedStatus] || 'white'}>
          {computedStatus || '-'}
        </Text>
      </Box>
      <Box width={20} justifyContent="flex-start" marginRight={1}>
        <Text color={isSelected ? 'cyan' : undefined}>
          {stateName}
          {dismissalTypeName ? ` (${dismissalTypeName})` : ''}
        </Text>
      </Box>
      <Box width={14} justifyContent="flex-start" marginRight={1}>
        <Text color={jiraRef ? 'green' : 'dimColor'}>{jiraRef || '-'}</Text>
      </Box>
      <Box flexGrow={1} minWidth={0} justifyContent="flex-start">
        <Text color={isSelected ? 'cyan' : undefined} wrap="truncate">
          {title}
        </Text>
      </Box>
    </Box>
  );
});
AlertRow.displayName = 'AlertRow';

/**
 * Panel displaying list of alerts with filtering and selection indicators
 */
const AlertListPanel = React.memo(
  ({
    alerts,
    cursor,
    selectedAlertIds,
    filterStatus,
    filterState,
    filterSeverity,
    filterAlertType,
    filterJira,
    searchText,
    onCursorChange: _onCursorChange,
    height,
  }) => {
    const renderItem = useCallback(
      (alert, isSelected) => {
        const isMultiSelected = selectedAlertIds.includes(alert.alertId);
        return (
          <AlertRow
            alert={alert}
            isSelected={isSelected}
            isMultiSelected={isMultiSelected}
          />
        );
      },
      [selectedAlertIds]
    );

    // Build filter display text
    const activeFilters = [];
    if (filterStatus !== null && filterStatus !== undefined)
      activeFilters.push(`Status:${filterStatus}`);
    if (filterState !== null && filterState !== undefined)
      activeFilters.push(`State:${getStateName(filterState)}`);
    if (filterSeverity !== null && filterSeverity !== undefined)
      activeFilters.push(`Severity:${getSeverityName(filterSeverity)}`);
    if (filterAlertType !== null && filterAlertType !== undefined)
      activeFilters.push(`Type:${getAlertTypeName(filterAlertType)}`);
    if (filterJira) activeFilters.push(`Jira:${filterJira}`);
    if (searchText) activeFilters.push(`Search:"${searchText}"`);
    const hasFilters = activeFilters.length > 0;

    const chromeLines =
      5 + (selectedAlertIds.length > 0 ? 1 : 0) + (hasFilters ? 1 : 0);
    const availableRows = height - chromeLines;
    const visibleRows = Math.max(1, availableRows);

    return (
      <Panel
        title={`Alerts (${alerts.length})`}
        borderColor="cyan"
        flexGrow={1}
      >
        {/* Selection Count */}
        {selectedAlertIds.length > 0 && (
          <Box marginBottom={1}>
            <Text color="cyan" bold>
              ✓ Selected: {selectedAlertIds.length} of {alerts.length}
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
              State
            </Text>
          </Box>
          <Box width={14} justifyContent="flex-start" marginRight={1}>
            <Text bold dimColor>
              Jira
            </Text>
          </Box>
          <Box flexGrow={1} minWidth={0} justifyContent="flex-start">
            <Text bold dimColor>
              Alert
            </Text>
          </Box>
        </Box>

        <ScrollableList
          items={alerts}
          cursor={cursor}
          renderItem={renderItem}
          visibleRows={visibleRows}
          emptyMessage="No alerts found"
        />
      </Panel>
    );
  }
);
AlertListPanel.displayName = 'AlertListPanel';

/**
 * Panel displaying detailed preview of selected alert
 */
const DetailsPreviewPanel = React.memo(
  ({ alert, project, repository, azdoService }) => {
    if (!alert) {
      return (
        <Panel title="Details" borderColor="magenta" width={80}>
          <Text dimColor>Select an alert to view details</Text>
        </Panel>
      );
    }

    const metadata = parseAlertMetadata(alert);
    const computedStatus = getComputedStatus(alert);
    const statusColor = COMPUTED_STATUS_COLORS[computedStatus] || 'white';
    const severityName = getSeverityName(alert.severity);
    const severityColor =
      {
        Critical: 'red',
        High: 'red',
        Medium: 'yellow',
        Low: 'blue',
        Note: 'gray',
      }[severityName] || 'white';

    const distinctFiles = getDistinctFilePaths(alert);
    const occurrencesCount =
      alert.physicalLocations?.filter((loc) => loc.versionControl?.itemUrl)
        .length || 0;

    // Build alert web URL
    const alertWebUrl =
      repository && project && alert.alertId
        ? azdoService?.buildAlertWebUrl(
            project.name,
            repository.id,
            alert.alertId
          )
        : alert.url;

    // Get most recent validation fingerprint (for secret alerts)
    const fingerprint = getMostRecentFingerprint(alert);
    const validityResult = fingerprint?.validityResult;
    const fingerprintData = parseFingerprintJson(fingerprint);

    return (
      <Panel title="Details [d to toggle]" borderColor="magenta" width={80}>
        <Box flexDirection="column">
          <Text> </Text>
          <Text>
            <Text bold color="cyan">
              Alert ID:
            </Text>{' '}
            {alert.alertId || 'N/A'}
          </Text>
          {alertWebUrl && (
            <Text wrap="truncate">
              <Text bold color="cyan">
                Alert URL:
              </Text>{' '}
              <Text color="blue">{alertWebUrl}</Text>
            </Text>
          )}
          <Text>
            <Text bold color="cyan">
              Title:
            </Text>{' '}
            {alert.title || alert.ruleName || 'N/A'}
          </Text>
          <Text>
            <Text bold color="cyan">
              Type:
            </Text>{' '}
            {getAlertTypeName(alert.alertType)}
          </Text>
          {alert.truncatedSecret && (
            <Text wrap="truncate">
              <Text bold color="cyan">
                Secret:
              </Text>{' '}
              <Text color="yellow" backgroundColor="black">
                {alert.truncatedSecret}
              </Text>
            </Text>
          )}
          {/* Validation fingerprint for secrets */}
          {fingerprint && (
            <Box flexDirection="column" marginTop={1}>
              <Text>
                <Text bold color="cyan">
                  Validity:
                </Text>{' '}
                <Text color={getValidityResultColor(validityResult)} bold>
                  {getValidityResultName(validityResult)}
                </Text>
              </Text>
              {fingerprintData && (
                <Box flexDirection="column">
                  {Object.entries(fingerprintData).map(([key, value]) => (
                    <Text key={key} wrap="truncate" dimColor>
                      • {key}: {String(value)}
                    </Text>
                  ))}
                </Box>
              )}
            </Box>
          )}
          <Text>
            <Text bold color="cyan">
              Severity:
            </Text>{' '}
            <Text color={severityColor} bold>
              {severityName}
            </Text>
          </Text>
          <Text>
            <Text bold color="cyan">
              State:
            </Text>{' '}
            <Text color={alert.state === 1 ? 'red' : 'green'}>
              {getStateName(alert.state)}
            </Text>
            {alert.dismissal?.dismissalType !== undefined && (
              <Text dimColor>
                {' '}
                ({getDismissalTypeName(alert.dismissal.dismissalType)})
              </Text>
            )}
          </Text>
          {computedStatus && (
            <Text>
              <Text bold color="cyan">
                Status:
              </Text>{' '}
              <Text color={statusColor}>{computedStatus}</Text>
            </Text>
          )}
          {project && (
            <Text wrap="truncate">
              <Text bold color="cyan">
                Project:
              </Text>{' '}
              {project.name || 'N/A'}
            </Text>
          )}
          {repository && !repository._isViewAll && (
            <Text wrap="truncate">
              <Text bold color="cyan">
                Repository:
              </Text>{' '}
              {repository.name || 'N/A'}
            </Text>
          )}
          {/* Distinct file list */}
          {distinctFiles.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text bold color="cyan">
                Files ({distinctFiles.length}):
              </Text>
              {distinctFiles.slice(0, 3).map((filePath, idx) => (
                <Text key={idx} wrap="truncate" dimColor>
                  • {filePath}
                </Text>
              ))}
              {distinctFiles.length > 3 && (
                <Text dimColor>...and {distinctFiles.length - 3} more</Text>
              )}
            </Box>
          )}
          {occurrencesCount > 0 && distinctFiles.length === 0 && (
            <Text>
              <Text bold color="cyan">
                Occurrences:
              </Text>{' '}
              <Text color="yellow" bold>
                {occurrencesCount}
              </Text>
            </Text>
          )}
          {metadata.jiraId && (
            <Text wrap="truncate">
              <Text bold color="cyan">
                Jira ID:
              </Text>{' '}
              <Text color="green">{metadata.jiraId}</Text>
            </Text>
          )}
          {alert.dismissal && (
            <Box flexDirection="column" marginTop={1}>
              <Text bold color="cyan">
                Dismissal:
              </Text>
              <Box
                borderStyle="single"
                borderColor="gray"
                paddingX={1}
                marginTop={1}
              >
                <Text wrap="truncate" dimColor>
                  {alert.dismissal.message || 'No message'}
                </Text>
              </Box>
            </Box>
          )}
          <Box marginTop={1}>
            <Text dimColor>Press Enter for full details</Text>
          </Box>
        </Box>
      </Panel>
    );
  }
);
DetailsPreviewPanel.displayName = 'DetailsPreviewPanel';

/**
 * Status bar displaying error messages, loading indicators, and application info
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
          <Box>
            <Text dimColor>
              ? Help | CTRL+O Project | CTRL+W Repository | CTRL+Q Quit
            </Text>
          </Box>
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
 * Main TUI application component with 3-pane layout
 */
export const App = ({ configPath }) => {
  const { exit } = useApp();
  const { height } = useTerminalSize();

  // Services
  const [azdoService] = useState(() => new AzdoService(configPath));
  const [jiraService] = useState(() => new JiraService(azdoService.config));

  // Zustand state - ONLY subscribe to data, never to setters
  const selectedProject = useStore((state) => state.selectedProject);
  const selectedRepository = useStore((state) => state.selectedRepository);
  const projects = useStore((state) => state.projects);
  const repositories = useStore((state) => state.repositories);
  const listCursor = useStore((state) => state.listCursor);

  // Local UI state
  const [showContextPane, setShowContextPane] = useState(true);
  const [showDetailsPane, setShowDetailsPane] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [textInputConfig, setTextInputConfig] = useState(null);
  const [standaloneWindow, setStandaloneWindow] = useState(null);
  const [debugMode] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Ready');
  const isInitialSetup = useRef(true);

  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const view = useStore((state) => state.view);
  const alerts = useStore((state) => state.alerts);

  // Filter state
  const filterStatus = useStore((state) => state.filterStatus);
  const filterState = useStore((state) => state.filterState);
  const filterSeverity = useStore((state) => state.filterSeverity);
  const filterAlertType = useStore((state) => state.filterAlertType);
  const filterJira = useStore((state) => state.filterJira);
  const searchText = useStore((state) => state.searchText);
  const sortBy = useStore((state) => state.sortBy);
  const selectedAlertIds = useStore((state) => state.selectedAlertIds);
  const excludeFalsePositive = useStore((state) => state.excludeFalsePositive);

  // Load detailed project/repository data in background when selected
  useDetailedEntityLoader(azdoService);

  // Setup logger debug callback on mount
  React.useEffect(() => {
    logger.setDebugCallback((message) => {
      setDebugMessage(message);
    });
  }, []);

  // Load projects on mount
  const hasLoadedProjects = useRef(false);
  React.useEffect(() => {
    if (hasLoadedProjects.current) return;
    hasLoadedProjects.current = true;

    const loadProjects = async () => {
      try {
        useStore.getState().setLoading(true);
        logger.info('Loading Azure DevOps projects (TUI)');
        const projectList = await azdoService.listProjects();
        useStore.getState().setProjects(projectList);
        logger.info('Projects loaded', { count: projectList.length });
        useStore.getState().setLoading(false);
      } catch (err) {
        logger.error('Failed to load projects', err);
        useStore.getState().setError(err.message);
        useStore.getState().setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Auto-open project selection modal when projects are loaded
  const hasOpenedProjectModal = useRef(false);
  React.useEffect(() => {
    if (
      view === 'project-selection' &&
      projects.length > 0 &&
      !hasOpenedProjectModal.current
    ) {
      hasOpenedProjectModal.current = true;
      setStandaloneWindow('project');
    }
  }, [projects.length, view]);

  // Get current alert from filtered list using hook (same pattern as ASoC TUI)
  const currentAlert = useCurrentIssue();

  // Load detailed alert data (with fingerprints) when current alert changes
  useDetailedAlertLoader(azdoService, currentAlert);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return filterIssues(alerts, {
      status: filterStatus,
      state: filterState,
      severity: filterSeverity,
      alertType: filterAlertType,
      jira: filterJira,
      searchText: searchText,
      sortBy: sortBy,
    });
  }, [
    alerts,
    filterStatus,
    filterState,
    filterSeverity,
    filterAlertType,
    filterJira,
    searchText,
    sortBy,
  ]);

  // Get actual selected alerts from IDs
  const selectedAlerts = useMemo(() => {
    if (!alerts || alerts.length === 0) {
      return currentAlert ? [currentAlert] : [];
    }
    if (selectedAlertIds.length === 0) {
      return currentAlert ? [currentAlert] : [];
    }
    return alerts.filter((alert) => selectedAlertIds.includes(alert.alertId));
  }, [selectedAlertIds, alerts, currentAlert]);

  // Throttled cursor movement
  const pendingCursorMove = useRef(0);
  const flushTimeout = useRef(null);
  const filteredAlertsLength = filteredAlerts.length;

  const flushCursorMove = useCallback(() => {
    if (flushTimeout.current) return;

    flushTimeout.current = setTimeout(() => {
      const delta = pendingCursorMove.current;
      if (delta !== 0) {
        pendingCursorMove.current = 0;

        const currentCursor = useStore.getState().listCursor;
        const maxCursor = filteredAlertsLength - 1;
        const newCursor = Math.min(
          maxCursor,
          Math.max(0, currentCursor + delta)
        );

        if (newCursor !== currentCursor) {
          useStore.getState().setCursor(newCursor);
        }
      }
      flushTimeout.current = null;
    }, 16);
  }, [filteredAlertsLength]);

  // Reload alerts helper (preserves cursor position)
  const reloadAlerts = useCallback(async () => {
    if (!selectedRepository?.id) return;

    const store = useStore.getState();

    try {
      store.setLoading(true);

      const isViewAll =
        selectedRepository._isViewAll ||
        selectedRepository.id === '__VIEW_ALL__';

      let alertList;
      if (isViewAll && selectedProject?.id) {
        alertList = await azdoService.listAlertsByProject(
          selectedProject.id,
          {}
        );
      } else {
        alertList = await azdoService.listAlerts(
          selectedProject.id,
          selectedRepository.id,
          {}
        );
      }

      // Use refreshAlerts to preserve cursor position
      store.refreshAlerts(alertList || []);
      store.setLoading(false);
    } catch (err) {
      logger.error('Failed to reload alerts', err);
      store.setError(err.message);
      store.setLoading(false);
    }
  }, [selectedRepository, selectedProject, azdoService]);

  // Handle bulk alert updates
  const handleBulkUpdateAlerts = useCallback(
    async (updateData) => {
      const store = useStore.getState();
      const alertsToUpdate = selectedAlertIds
        .map((id) => alerts.find((a) => a.alertId === id))
        .filter(Boolean);

      if (alertsToUpdate.length === 0) {
        return;
      }

      try {
        store.setLoading(true);
        setLoadingMessage(`Updating ${alertsToUpdate.length} alert(s)...`);

        // Update alerts via service
        const results = await azdoService.bulkUpdateAlertsChunked(
          selectedProject.id,
          selectedRepository.id,
          selectedAlertIds,
          updateData,
          10,
          (current, total) => {
            setLoadingMessage(`Updating alerts: ${current}/${total}`);
          }
        );

        // Check for failures
        const failures = results.filter((r) => !r.success);
        if (failures.length > 0) {
          logger.error('Some alerts failed to update', { failures });
          store.setError(
            `${failures.length} alert(s) failed to update. Check logs for details.`
          );
        }

        // Reload alerts to reflect changes
        await reloadAlerts();

        // Clear selection
        store.clearSelection();

        store.setLoading(false);
        setLoadingMessage('Ready');
      } catch (err) {
        logger.error('Failed to update alerts', err);
        store.setError(err.message);
        store.setLoading(false);
        setLoadingMessage('Ready');
      }
    },
    [
      selectedAlertIds,
      alerts,
      selectedProject,
      selectedRepository,
      azdoService,
      reloadAlerts,
    ]
  );

  // Apply filter presets
  const applyFilterPreset = useCallback((preset) => {
    const store = useStore.getState();
    store.clearFilters();
    store.setFilterPreset(preset);

    switch (preset) {
      case 'active':
        store.setFilterState(1); // Active
        break;
      case 'inactive':
        // Dismissed (2 or 8) OR Fixed (4)
        store.setFilterState([2, 8, 4]);
        break;
      case 'dismissed-unknown':
        // Dismissed with DismissalType = Unknown (0)
        store.setFilterState(2);
        // Note: Additional filtering for DismissalType needs to be done in filterIssues
        break;
      case 'fixed-or-known':
        // Fixed (4) OR (Dismissed with DismissalType != Unknown)
        // This requires special handling in filterIssues
        store.setFilterState([2, 8, 4]);
        break;
      case 'unassigned':
        store.setFilterJira('without');
        break;
      case 'assigned':
        store.setFilterJira('with');
        break;
      case 'low':
        store.setFilterSeverity(1);
        break;
      case 'medium':
        store.setFilterSeverity(2);
        break;
      case 'high':
        store.setFilterSeverity(3);
        break;
      default:
        break;
    }
  }, []);

  // Define keyboard shortcuts for alert-list view
  const alertListShortcuts = useMemo(
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
        action: () => currentAlert && setActiveModal('details'),
        description: 'View',
        condition: () => !!currentAlert,
        group: 'Navigation',
      },
      {
        key: 'leftarrow',
        action: () => {
          if (currentAlert && selectedRepository && selectedProject) {
            // Build the Alert Web URL
            const alertWebUrl = azdoService.buildAlertWebUrl(
              selectedProject.name,
              selectedRepository.id,
              currentAlert.alertId
            );
            open(alertWebUrl).catch(() => {
              // Silently fail if we can't open the link
            });
          } else if (currentAlert && currentAlert.url) {
            // Fallback to alert.url if we can't build the URL
            open(currentAlert.url).catch(() => {
              // Silently fail if we can't open the link
            });
          }
        },
        description: 'Open Alert URL',
        condition: () =>
          !!currentAlert && (!!currentAlert.alertId || !!currentAlert.url),
        group: 'Navigation',
        hint: true,
      },
      {
        key: 'rightarrow',
        action: () => {
          if (
            currentAlert &&
            currentAlert.physicalLocations &&
            currentAlert.physicalLocations.length > 0
          ) {
            const location = currentAlert.physicalLocations[0];
            if (location.versionControl?.itemUrl) {
              open(location.versionControl.itemUrl).catch(() => {
                // Silently fail if we can't open the link
              });
            }
          }
        },
        description: 'Open Code',
        condition: () => {
          if (
            !currentAlert ||
            !currentAlert.physicalLocations ||
            currentAlert.physicalLocations.length === 0
          ) {
            return false;
          }
          const location = currentAlert.physicalLocations[0];
          return !!location.versionControl?.itemUrl;
        },
        group: 'Navigation',
        hint: true,
      },
      {
        key: 'ctrl+rightarrow',
        action: () => {
          const metadata = parseAlertMetadata(currentAlert);
          if (metadata.jiraId && azdoService) {
            const jiraHost = azdoService.getConfig().getJiraHost();
            if (jiraHost) {
              const jiraUrl = `${jiraHost}/browse/${metadata.jiraId}`;
              open(jiraUrl).catch(() => {
                // Silently fail if we can't open the link
              });
            }
          }
        },
        description: 'Open Jira',
        condition: () => {
          if (!currentAlert) return false;
          const metadata = parseAlertMetadata(currentAlert);
          return !!metadata.jiraId && !!azdoService?.getConfig().getJiraHost();
        },
        group: 'Navigation',
        hint: true,
      },
      {
        key: 'ctrl+leftarrow',
        action: () => {
          if (selectedRepository && selectedProject) {
            const orgUrl = azdoService?.getBaseUrl() || 'https://dev.azure.com';
            const repoUrl = `${orgUrl}/${encodeURIComponent(selectedProject.name)}/_git/${selectedRepository.id}`;
            open(repoUrl).catch(() => {
              // Silently fail if we can't open the link
            });
          }
        },
        description: 'Open Repository',
        condition: () => !!selectedRepository && !!selectedProject,
        group: 'Navigation',
        hint: true,
      },

      // Selection
      {
        key: 'space',
        action: () => {
          if (currentAlert) {
            useStore.getState().toggleAlertSelection(currentAlert.alertId);
            pendingCursorMove.current += 1;
            flushCursorMove();
          }
        },
        description: 'Select',
        condition: () => !!currentAlert,
        group: 'Selection',
      },
      {
        key: 'ctrl+a',
        action: () => useStore.getState().selectAllAlerts(),
        description: 'Select all',
        condition: () => filteredAlerts.length > 0,
        group: 'Selection',
      },
      {
        key: 'alt+a',
        action: () => useStore.getState().selectNone(),
        description: 'Clear selection',
        condition: () => selectedAlertIds.length > 0,
        group: 'Selection',
      },

      // Actions
      {
        key: 'l',
        action: () => currentAlert && setActiveModal('links'),
        description: 'Links',
        condition: () => !!currentAlert,
        group: 'Actions',
      },
      {
        key: 'u',
        action: () => currentAlert && setActiveModal('update-status'),
        description: 'Update State',
        condition: () => !!currentAlert,
        group: 'Actions',
      },
      {
        key: 's',
        action: () => currentAlert && setActiveModal('update-severity'),
        description: 'Update Severity',
        condition: () => !!currentAlert,
        group: 'Actions',
      },
      {
        key: 'j',
        action: () => setActiveModal('create-jira'),
        description: 'Create Jira',
        condition: () => selectedAlertIds.length > 0,
        group: 'Actions',
      },
      {
        key: 'ctrl+k',
        action: () => setActiveModal('link-jira'),
        description: 'Link Jira',
        condition: () => selectedAlertIds.length > 0,
        group: 'Actions',
      },
      {
        key: 'alt+k',
        action: () => setActiveModal('unlink-jira'),
        description: 'Unlink Jira',
        condition: () =>
          selectedAlertIds.length > 0 &&
          selectedAlerts.some((alert) => {
            const metadata = parseAlertMetadata(alert);
            return !!metadata.jiraId;
          }),
        group: 'Actions',
      },

      // Filtering
      {
        key: 'f',
        action: () => alerts.length > 0 && setActiveModal('filter'),
        description: 'Filter',
        condition: () => alerts.length > 0,
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
        condition: () => !!selectedRepository,
        group: 'Filter Presets',
      },
      {
        key: 'alt+1',
        action: () => applyFilterPreset('inactive'),
        description: 'Inactive Status',
        condition: () => !!selectedRepository,
        group: 'Filter Presets',
      },
      {
        key: '2',
        action: () => applyFilterPreset('dismissed-unknown'),
        description: 'Dismissed Unknown',
        condition: () => !!selectedRepository,
        group: 'Filter Presets',
      },
      {
        key: 'alt+2',
        action: () => applyFilterPreset('fixed-or-known'),
        description: 'Fixed/Known',
        condition: () => !!selectedRepository,
        group: 'Filter Presets',
      },
      // Filter Presets - Jira
      {
        key: '3',
        action: () => applyFilterPreset('unassigned'),
        description: 'Jira Unassigned',
        condition: () => !!selectedRepository,
        group: 'Filter Presets',
      },
      {
        key: 'alt+3',
        action: () => applyFilterPreset('assigned'),
        description: 'Jira Assigned',
        condition: () => !!selectedRepository,
        group: 'Filter Presets',
      },
      // Filter Presets - Severity
      {
        key: '4',
        action: () => applyFilterPreset('low'),
        description: 'Low Severity',
        condition: () => !!selectedRepository,
        group: 'Filter Presets',
      },
      {
        key: '5',
        action: () => applyFilterPreset('medium'),
        description: 'Medium Severity',
        condition: () => !!selectedRepository,
        group: 'Filter Presets',
      },
      {
        key: '6',
        action: () => applyFilterPreset('high'),
        description: 'High Severity',
        condition: () => !!selectedRepository,
        group: 'Filter Presets',
      },
      {
        key: 'alt+f',
        action: async () => {
          const store = useStore.getState();
          const hasFilters = store.hasActiveFilters() || store.filterPreset;
          if (hasFilters && selectedRepository?.id) {
            store.clearFilters();
            await reloadAlerts();
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
          if (!store.excludeFalsePositive) {
            store.setExcludeFalsePositive(true);
            await reloadAlerts();
          }
        },
        description: 'Exclude False Positives',
        condition: () => !!selectedRepository && !excludeFalsePositive,
        group: 'Filtering',
        hint: true,
      },
      {
        key: 'alt+x',
        action: async () => {
          const store = useStore.getState();
          if (store.excludeFalsePositive) {
            store.setExcludeFalsePositive(false);
            await reloadAlerts();
          }
        },
        description: 'Include All',
        condition: () => !!selectedRepository && excludeFalsePositive,
        group: 'Filtering',
        hint: true,
      },

      // Sorting
      {
        key: 'o',
        action: () => {
          const currentSort = useStore.getState().sortBy;
          const sortOptions = ['severity', 'name', 'state', 'type'];
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
        action: reloadAlerts,
        description: 'Reload',
        condition: () => !!selectedRepository,
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
    ],
    [
      currentAlert,
      selectedAlerts,
      filteredAlerts.length,
      selectedAlertIds.length,
      selectedRepository,
      selectedProject,
      azdoService,
      flushCursorMove,
      applyFilterPreset,
      reloadAlerts,
      alerts.length,
      excludeFalsePositive,
    ]
  );

  // General shortcuts that are always available
  const generalShortcuts = useMemo(
    () => [
      {
        key: 'ctrl+o',
        action: () => setStandaloneWindow('project'),
        description: 'Project',
        group: 'General',
      },
      {
        key: 'ctrl+w',
        action: () => selectedProject && setStandaloneWindow('repository'),
        description: 'Repository',
        condition: () => !!selectedProject,
        group: 'General',
      },
      {
        key: 'ctrl+q',
        action: () => exit(),
        description: 'Quit',
        group: 'General',
      },
    ],
    [selectedProject, exit]
  );

  // Register general shortcuts (always enabled)
  useKeyboardShortcuts('general', generalShortcuts, {
    enabled: !activeModal && !standaloneWindow && !textInputConfig,
  });

  // Register alert-list shortcuts
  useKeyboardShortcuts('alert-list', alertListShortcuts, {
    enabled: !activeModal && !standaloneWindow && view === 'alert-list',
  });

  // Calculate content height
  const statusBarHeight = 1;
  const debugBarHeight = debugMode ? 1 : 0;
  const contentHeight = height - statusBarHeight - debugBarHeight;

  // Standalone windows
  if (standaloneWindow === 'project') {
    return (
      <RootSelectionWindow
        projects={projects}
        azdoService={azdoService}
        selectedProject={selectedProject}
        onSelect={async (project) => {
          setStandaloneWindow(null);
          useStore.getState().setSelectedProject(project);
          useStore.getState().setAlerts([]);
          useStore.getState().setView('alert-list');
          useStore.getState().setLoading(true);
          setLoadingMessage(`Loading repositories for ${project.name}...`);

          try {
            const repoList = await azdoService.listRepositories(project.id);
            useStore.getState().setRepositories(repoList || []);
            if (repoList && repoList.length > 0) {
              setStandaloneWindow('repository');
            }
          } catch (err) {
            logger.error('Failed to load repositories', err);
            useStore
              .getState()
              .setError(`Failed to load repositories: ${err.message}`);
          } finally {
            useStore.getState().setLoading(false);
            isInitialSetup.current = false;
          }
        }}
        onCancel={() => {
          if (isInitialSetup.current) {
            exit();
          } else {
            setStandaloneWindow(null);
          }
        }}
      />
    );
  }

  if (standaloneWindow === 'repository') {
    return (
      <FolderSelectionWindow
        repositories={repositories}
        azdoService={azdoService}
        selectedProject={selectedProject}
        selectedRepository={selectedRepository}
        onSelect={async (repository) => {
          setStandaloneWindow(null);
          useStore.getState().setSelectedRepository(repository);
          useStore.getState().setAlerts([]);
          useStore.getState().setView('alert-list');
          useStore.getState().setLoading(true);
          setLoadingMessage(`Loading alerts for ${repository.name}...`);

          try {
            const isViewAll =
              repository._isViewAll || repository.id === '__VIEW_ALL__';

            let alertList;
            if (isViewAll && selectedProject?.id) {
              alertList = await azdoService.listAlertsByProject(
                selectedProject.id,
                {}
              );
            } else {
              alertList = await azdoService.listAlerts(
                selectedProject.id,
                repository.id,
                {}
              );
            }

            useStore.getState().setAlerts(alertList || []);
          } catch (err) {
            logger.error('Failed to load alerts', err);
            useStore
              .getState()
              .setError(`Failed to load alerts: ${err.message}`);
          } finally {
            useStore.getState().setLoading(false);
          }
        }}
        onCancel={() => setStandaloneWindow(null)}
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
        />
      }
      debugBar={<DebugBar message={debugMessage} visible={debugMode} />}
    >
      <Box flexDirection="row" height={contentHeight}>
        {/* Context Pane */}
        {showContextPane && (
          <ContextPane
            project={selectedProject}
            repository={selectedRepository}
            alertsCount={alerts.length}
            shortcuts={alertListShortcuts}
          />
        )}

        {/* Alert List */}
        <AlertListPanel
          alerts={filteredAlerts}
          cursor={listCursor}
          selectedAlertIds={selectedAlertIds}
          filterStatus={filterStatus}
          filterState={filterState}
          filterSeverity={filterSeverity}
          filterAlertType={filterAlertType}
          filterJira={filterJira}
          searchText={searchText}
          height={contentHeight}
        />

        {/* Details Preview */}
        {showDetailsPane && (
          <DetailsPreviewPanel
            alert={currentAlert}
            project={selectedProject}
            repository={selectedRepository}
            azdoService={azdoService}
          />
        )}
      </Box>

      {/* Modals */}
      {activeModal === 'details' && currentAlert && (
        <IssueModal
          alert={currentAlert}
          project={selectedProject}
          repository={selectedRepository}
          azdoService={azdoService}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'links' && currentAlert && (
        <LinksModal
          alert={currentAlert}
          project={selectedProject}
          repository={selectedRepository}
          config={azdoService.getConfig()}
          azdoService={azdoService}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'help' && (
        <HelpModal view={view} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'filter' && (
        <FilterModal
          alerts={filteredAlerts}
          onSelect={(filterType, value) => {
            if (filterType === 'status')
              useStore.getState().setFilterStatus(value);
            else if (filterType === 'state')
              useStore.getState().setFilterState(value);
            else if (filterType === 'severity')
              useStore.getState().setFilterSeverity(value);
            else if (filterType === 'alertType')
              useStore.getState().setFilterAlertType(value);
            else if (filterType === 'jira')
              useStore.getState().setFilterJira(value);
            setActiveModal(null);
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
      {activeModal === 'update-status' && (
        <UpdateStatusModal
          alertCount={selectedAlertIds.length > 0 ? selectedAlertIds.length : 1}
          alerts={selectedAlerts}
          onUpdate={async (
            state,
            dismissalType,
            comment,
            _progressCallback
          ) => {
            const updateData = {
              state,
              dismissedReason: dismissalType,
              dismissedComment: comment,
            };
            await handleBulkUpdateAlerts(updateData);
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
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
            setActiveModal(null);
          }}
          parseAlertMetadata={parseAlertMetadata}
        />
      )}
      {activeModal === 'update-severity' && (
        <UpdateSeverityModal
          alertCount={selectedAlertIds.length > 0 ? selectedAlertIds.length : 1}
          alerts={selectedAlerts}
          onUpdate={async (severity, comment, _progressCallback) => {
            const updateData = { severity };
            if (comment) {
              updateData.dismissedComment = comment;
            }
            await handleBulkUpdateAlerts(updateData);
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
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
            setActiveModal(null);
          }}
        />
      )}
      {activeModal === 'link-jira' && selectedAlertIds.length > 0 && (
        <LinkJiraModal
          alertCount={selectedAlertIds.length}
          onLink={async (jiraId) => {
            // Link Jira ID to selected alerts
            await azdoService.linkJiraToAlerts(
              selectedProject.name,
              selectedRepository.id,
              selectedAlertIds,
              jiraId,
              null // Progress callback handled internally
            );

            logger.info('Alerts linked to Jira', {
              alertCount: selectedAlertIds.length,
              jiraId,
            });

            // Reload alerts to reflect updated metadata
            await reloadAlerts();
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'create-jira' && selectedAlertIds.length > 0 && (
        <CreateJiraModal
          alerts={selectedAlerts}
          defaultProjectKey={jiraService.getProjectKey()}
          projectName={selectedProject?.name}
          onCreate={async (
            projectKey,
            groupBy,
            alerts,
            parentEpic,
            projectName
          ) => {
            // Create Jira issues and link alert IDs
            const results = await jiraService.createIssuesFromAlerts(
              projectKey,
              groupBy,
              alerts,
              selectedProject,
              selectedRepository,
              parentEpic,
              projectName
            );

            logger.info('Jira issues created from alerts', {
              count: results.length,
            });

            // Link each alert to its corresponding Jira issue
            for (const result of results) {
              await azdoService.linkJiraToAlerts(
                selectedProject.name,
                selectedRepository.id,
                result.alertIds,
                result.jiraIssue.key,
                null
              );
            }

            logger.info('Alerts linked to created Jira issues');

            // Reload alerts and clear selection
            await reloadAlerts();
            useStore.getState().clearSelection();
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'jira' &&
        currentAlert &&
        (() => {
          const metadata = parseAlertMetadata(currentAlert);
          const hasJira = !!metadata.jiraId;

          if (hasJira) {
            // Show unlink modal for single alert
            return (
              <UnlinkJiraModal
                alertCount={1}
                jiraKeys={[metadata.jiraId]}
                onUnlink={async () => {
                  await azdoService.unlinkJiraFromAlerts(
                    selectedProject.name,
                    selectedRepository.id,
                    [currentAlert.alertId],
                    null
                  );
                  logger.info('Alert unlinked from Jira', {
                    alertId: currentAlert.alertId,
                  });
                  await reloadAlerts();
                  setActiveModal(null);
                }}
                onClose={() => setActiveModal(null)}
              />
            );
          } else {
            // Show link modal for single alert
            return (
              <LinkJiraModal
                alertCount={1}
                onLink={async (jiraId) => {
                  await azdoService.linkJiraToAlerts(
                    selectedProject.name,
                    selectedRepository.id,
                    [currentAlert.alertId],
                    jiraId,
                    null
                  );
                  logger.info('Alert linked to Jira', {
                    alertId: currentAlert.alertId,
                    jiraId,
                  });
                  await reloadAlerts();
                  setActiveModal(null);
                }}
                onClose={() => setActiveModal(null)}
              />
            );
          }
        })()}
      {activeModal === 'unlink-jira' && selectedAlertIds.length > 0 && (
        <UnlinkJiraModal
          alertCount={selectedAlertIds.length}
          jiraKeys={selectedAlerts
            .map((alert) => {
              const metadata = parseAlertMetadata(alert);
              return metadata.jiraId;
            })
            .filter(Boolean)}
          onUnlink={async () => {
            // Unlink Jira IDs from selected alerts
            await azdoService.unlinkJiraFromAlerts(
              selectedProject.name,
              selectedRepository.id,
              selectedAlertIds,
              null // Progress callback handled internally
            );

            logger.info('Alerts unlinked from Jira', {
              alertCount: selectedAlertIds.length,
            });

            // Reload alerts to reflect removed metadata
            await reloadAlerts();
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </Layout>
  );
};

export default App;
