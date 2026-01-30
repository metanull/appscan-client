/**
 * DetectifyApp - Main Detectify TUI Application
 * Following AZDO TUI patterns for modals, windows, and keyboard shortcuts
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import open from 'open';
import { useStore } from './state/AppContext.js';
import {
  filterVulnerabilities,
  getSeverityName,
  getStatusName,
  getScanSourceName,
  formatDate,
  truncate,
  getEffectiveSeverity,
  SEVERITY_COLORS,
  STATUS_COLORS,
} from './utils/vulnerability.js';
import { Layout } from '../../shared/components/Layout.js';
import { Panel } from '../../shared/components/Panel.js';
import { ScrollableList } from '../../shared/components/ScrollableList.js';
import { KeyboardHint } from '../../shared/components/KeyboardHint.js';
import { HelpModal } from '../../shared/components/HelpModal.js';
import { SearchModal } from '../../shared/components/SearchModal.js';
import { TextInputPage } from '../../shared/components/TextInputPage.js';
import { DetectifyService } from '../../shared/services/detectify.js';
import { JiraService } from '../../shared/services/jira.js';
import { useTerminalSize } from '../../shared/hooks/useTerminalSize.js';
import { useKeyboardShortcuts } from '../../shared/hooks/useKeyboardShortcuts.js';

// Import modals
import { VulnerabilityModal } from './components/VulnerabilityModal.js';
import { LinksModal } from './components/LinksModal.js';
import { FilterModal } from './modals/FilterModal.js';
import { UpdateStatusModal } from './modals/UpdateStatusModal.js';
import { CreateJiraModal } from './modals/CreateJiraModal.js';

import logger from '../../../utils/logger.js';
import { getPackageInfo } from '../../../utils/package-info.js';

const packageInfo = getPackageInfo();

/**
 * Individual vulnerability row
 */
const VulnerabilityRow = React.memo(({ vulnerability, isSelected, isMultiSelected }) => {
  const effectiveSeverity = getEffectiveSeverity(vulnerability);
  const severityName = getSeverityName(effectiveSeverity);
  const statusName = getStatusName(vulnerability.status);
  const title = vulnerability.title || 'Unknown';
  const host = vulnerability.host || 'N/A';

  const severityColor = SEVERITY_COLORS[effectiveSeverity] || 'white';
  const statusColor = STATUS_COLORS[vulnerability.status?.toLowerCase()] || 'white';

  return (
    <Box>
      <Box width={2} justifyContent="flex-start" marginRight={1}>
        <Text color={isSelected ? 'cyan' : undefined}>
          {isSelected ? '▶' : ' '}
        </Text>
      </Box>
      <Box width={5} justifyContent="flex-start" marginRight={1}>
        <Text color={isMultiSelected ? 'cyan' : undefined} wrap="truncate">
          {isMultiSelected ? '[✓]' : '[ ]'}
        </Text>
      </Box>
      <Box width={12} justifyContent="flex-start" marginRight={1}>
        <Text color={severityColor} bold={isSelected}>
          {severityName}
        </Text>
      </Box>
      <Box width={14} justifyContent="flex-start" marginRight={1}>
        <Text color={statusColor}>
          {statusName}
        </Text>
      </Box>
      <Box width={30} justifyContent="flex-start" marginRight={1}>
        <Text color="gray" wrap="truncate">{truncate(host, 28)}</Text>
      </Box>
      <Box flexGrow={1} minWidth={0} justifyContent="flex-start">
        <Text color={isSelected ? 'cyan' : undefined} wrap="truncate">
          {title}
        </Text>
      </Box>
    </Box>
  );
});
VulnerabilityRow.displayName = 'VulnerabilityRow';

/**
 * Panel displaying list of vulnerabilities
 */
const VulnerabilityListPanel = React.memo(({
  vulnerabilities,
  cursor,
  selectedIds,
  filterStatus,
  filterSeverity,
  filterScanSource,
  searchText,
  height,
}) => {
  const renderItem = useCallback(
    (vuln, isSelected) => {
      const isMultiSelected = selectedIds.includes(vuln.uuid);
      return (
        <VulnerabilityRow
          vulnerability={vuln}
          isSelected={isSelected}
          isMultiSelected={isMultiSelected}
        />
      );
    },
    [selectedIds]
  );

  // Build filter display text
  const activeFilters = [];
  if (filterStatus) activeFilters.push(`Status:${getStatusName(filterStatus)}`);
  if (filterSeverity) activeFilters.push(`Severity:${getSeverityName(filterSeverity)}`);
  if (filterScanSource) activeFilters.push(`Source:${getScanSourceName(filterScanSource)}`);
  if (searchText) activeFilters.push(`Search:"${searchText}"`);
  const hasFilters = activeFilters.length > 0;

  const chromeLines = 5 + (selectedIds.length > 0 ? 1 : 0) + (hasFilters ? 1 : 0);
  const availableRows = height - chromeLines;
  const visibleRows = Math.max(1, availableRows);

  return (
    <Panel title={`Vulnerabilities (${vulnerabilities.length})`} borderColor="cyan" flexGrow={1}>
      {/* Selection Count */}
      {selectedIds.length > 0 && (
        <Box marginBottom={1}>
          <Text color="cyan" bold>
            ✓ Selected: {selectedIds.length} of {vulnerabilities.length}
          </Text>
          <Text dimColor> (Space: toggle | Ctrl+a: all | Alt+a: clear)</Text>
        </Box>
      )}

      {/* Active Filters */}
      {hasFilters && (
        <Box marginBottom={1}>
          <Text color="yellow">🔍 Filtering &gt; </Text>
          <Text color="cyan">{activeFilters.join(' | ')}</Text>
          <Text dimColor> (Alt+f: clear)</Text>
        </Box>
      )}

      {/* Column Headers */}
      <Box marginBottom={1}>
        <Box width={2} justifyContent="flex-start" marginRight={1}>
          <Text bold dimColor> </Text>
        </Box>
        <Box width={5} justifyContent="flex-start" marginRight={1}>
          <Text bold dimColor>Sel</Text>
        </Box>
        <Box width={12} justifyContent="flex-start" marginRight={1}>
          <Text bold dimColor>Severity</Text>
        </Box>
        <Box width={14} justifyContent="flex-start" marginRight={1}>
          <Text bold dimColor>Status</Text>
        </Box>
        <Box width={30} justifyContent="flex-start" marginRight={1}>
          <Text bold dimColor>Host</Text>
        </Box>
        <Box flexGrow={1} minWidth={0} justifyContent="flex-start">
          <Text bold dimColor>Title</Text>
        </Box>
      </Box>

      <ScrollableList
        items={vulnerabilities}
        cursor={cursor}
        renderItem={renderItem}
        visibleRows={visibleRows}
        emptyMessage="No vulnerabilities found"
      />
    </Panel>
  );
});
VulnerabilityListPanel.displayName = 'VulnerabilityListPanel';

/**
 * Panel displaying vulnerability details preview
 */
const DetailsPreviewPanel = React.memo(({ vulnerability }) => {
  if (!vulnerability) {
    return (
      <Panel title="Details [d to toggle]" borderColor="magenta" width={70}>
        <Text dimColor>Select a vulnerability to view details</Text>
      </Panel>
    );
  }

  const effectiveSeverity = getEffectiveSeverity(vulnerability);
  const severityColor = SEVERITY_COLORS[effectiveSeverity] || 'white';
  const statusColor = STATUS_COLORS[vulnerability.status?.toLowerCase()] || 'white';

  return (
    <Panel title="Details [d to toggle]" borderColor="magenta" width={70}>
      <Box flexDirection="column">
        <Text> </Text>
        <Text>
          <Text bold color="cyan">UUID: </Text>
          <Text dimColor>{truncate(vulnerability.uuid || 'N/A', 35)}</Text>
        </Text>
        <Text>
          <Text bold color="cyan">Title: </Text>
          {truncate(vulnerability.title || 'N/A', 50)}
        </Text>
        <Text>
          <Text bold color="cyan">Host: </Text>
          {vulnerability.host || 'N/A'}
        </Text>
        <Text wrap="truncate">
          <Text bold color="cyan">Location: </Text>
          {truncate(vulnerability.location || 'N/A', 45)}
        </Text>
        <Text> </Text>
        <Text>
          <Text bold color="cyan">Severity: </Text>
          <Text color={severityColor} bold>{getSeverityName(effectiveSeverity)}</Text>
          {vulnerability.severity !== effectiveSeverity && (
            <Text dimColor> (v2: {vulnerability.severity})</Text>
          )}
        </Text>
        <Text>
          <Text bold color="cyan">Status: </Text>
          <Text color={statusColor}>{getStatusName(vulnerability.status)}</Text>
        </Text>
        <Text>
          <Text bold color="cyan">Scan Source: </Text>
          {getScanSourceName(vulnerability.scan_source)}
        </Text>
        <Text> </Text>
        <Text>
          <Text bold color="cyan">Created: </Text>
          {formatDate(vulnerability.created_at)}
        </Text>
        <Text>
          <Text bold color="cyan">Updated: </Text>
          {formatDate(vulnerability.updated_at)}
        </Text>
        {vulnerability.cwe && (
          <Text>
            <Text bold color="cyan">CWE: </Text>
            {vulnerability.cwe}
          </Text>
        )}
        {vulnerability.cvss_scores?.cvss_3_1 && (
          <Text>
            <Text bold color="cyan">CVSS v3.1: </Text>
            <Text color={vulnerability.cvss_scores.cvss_3_1.score >= 7 ? 'red' : 'yellow'}>
              {vulnerability.cvss_scores.cvss_3_1.score}
            </Text>
          </Text>
        )}
      </Box>
    </Panel>
  );
});
DetailsPreviewPanel.displayName = 'DetailsPreviewPanel';

/**
 * Context/Hints pane
 */
const ContextPane = React.memo(({ totalCount, filteredCount, shortcuts }) => {
  const hintShortcuts = shortcuts?.filter((s) => s.hint) || [];

  return (
    <Panel title="Detectify Triage [c to toggle]" borderColor="blue" width={50}>
      <Box flexDirection="column">
        <Text> </Text>
        <Text bold>Vulnerabilities</Text>
        <Text dimColor>Showing: {filteredCount} of {totalCount} total</Text>
        <Text> </Text>

        {hintShortcuts.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Box borderStyle="round" borderColor="green" paddingX={1} flexDirection="column">
              <Text bold color="green">Keyboard Shortcuts</Text>
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
      </Box>
    </Panel>
  );
});
ContextPane.displayName = 'ContextPane';

/**
 * Status bar at the bottom of the screen (like ASOC)
 * Shows help hints, loading state, errors, and app info
 */
const StatusBar = React.memo(({ error, loading, message, excludeResolved, sortBy, filterStatus, filterSeverity, searchText }) => {
  const rightText = `${packageInfo.name || 'appscan-client'} v${packageInfo.version || '0.0.0'}`;
  
  // Build filter info string
  const filterParts = [];
  if (filterStatus) filterParts.push(`Status:${getStatusName(filterStatus)}`);
  if (filterSeverity) filterParts.push(`Severity:${getSeverityName(filterSeverity)}`);
  if (searchText) filterParts.push(`Search:"${searchText}"`);
  const filterInfo = filterParts.length > 0 ? filterParts.join(' | ') : '';
  
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
              <Spinner type="dots" />
            </Box>
            <Text>{message || 'Loading...'}</Text>
          </Box>
        )}
        {!error && !loading && (
          <Box>
            <Text dimColor>
              ? Help | q Quit | x/{excludeResolved ? 'Active' : 'All'} | Sort:{sortBy}
            </Text>
            {filterInfo && (
              <Text color="yellow" dimColor>
                {' '}| {filterInfo}
              </Text>
            )}
            {excludeResolved && (
              <Text color="cyan" dimColor>
                {' '}| [Resolved Excluded]
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
});
StatusBar.displayName = 'StatusBar';

/**
 * Main App component
 */
export const App = React.memo(({ configPath }) => {
  const { exit } = useApp();
  const { width, height } = useTerminalSize();

  // Services
  const [detectifyService] = useState(() => new DetectifyService(configPath));
  const [jiraService] = useState(() => {
    try {
      return new JiraService(configPath);
    } catch {
      return null;
    }
  });

  // Local UI state
  const [showDetailsPane, setShowDetailsPane] = useState(true);
  const [showContextPane, setShowContextPane] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Ready');
  const [textInputConfig, setTextInputConfig] = useState(null);

  // Store state (data selectors only)
  const vulnerabilities = useStore((state) => state.vulnerabilities);
  const totalVulnerabilities = useStore((state) => state.totalVulnerabilities);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const listCursor = useStore((state) => state.listCursor);
  const selectedVulnerabilityIds = useStore((state) => state.selectedVulnerabilityIds);
  const filterStatus = useStore((state) => state.filterStatus);
  const filterSeverity = useStore((state) => state.filterSeverity);
  const filterScanSource = useStore((state) => state.filterScanSource);
  const searchText = useStore((state) => state.searchText);
  const sortBy = useStore((state) => state.sortBy);
  const excludeResolved = useStore((state) => state.excludeResolved);

  // Filtered vulnerabilities
  const filteredVulnerabilities = useMemo(() => {
    return filterVulnerabilities(vulnerabilities, {
      status: filterStatus,
      severity: filterSeverity,
      scanSource: filterScanSource,
      searchText,
      sortBy,
      excludeResolved, // Exclude resolved (patched, accepted_risk, false_positive) when true
    });
  }, [vulnerabilities, filterStatus, filterSeverity, filterScanSource, searchText, sortBy, excludeResolved]);

  // Current vulnerability
  const currentVulnerability = useMemo(() => {
    return filteredVulnerabilities[listCursor] || null;
  }, [filteredVulnerabilities, listCursor]);

  // Selected vulnerabilities
  const selectedVulnerabilities = useMemo(() => {
    if (selectedVulnerabilityIds.length === 0) {
      return currentVulnerability ? [currentVulnerability] : [];
    }
    return vulnerabilities.filter((v) => selectedVulnerabilityIds.includes(v.uuid));
  }, [selectedVulnerabilityIds, vulnerabilities, currentVulnerability]);

  // Throttled cursor movement
  const pendingCursorMove = useRef(0);
  const flushTimeout = useRef(null);
  const filteredVulnerabilitiesLength = filteredVulnerabilities.length;

  const flushCursorMove = useCallback(() => {
    if (flushTimeout.current) return;

    flushTimeout.current = setTimeout(() => {
      const delta = pendingCursorMove.current;
      if (delta !== 0) {
        pendingCursorMove.current = 0;

        const currentCursor = useStore.getState().listCursor;
        const maxCursor = filteredVulnerabilitiesLength - 1;
        const newCursor = Math.min(maxCursor, Math.max(0, currentCursor + delta));

        if (newCursor !== currentCursor) {
          useStore.getState().setListCursor(newCursor);
        }
      }
      flushTimeout.current = null;
    }, 16);
  }, [filteredVulnerabilitiesLength]);

  // Load vulnerabilities on mount
  const hasLoaded = useRef(false);
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadVulnerabilities = async () => {
      try {
        useStore.getState().setLoading(true);
        setLoadingMessage('Loading vulnerabilities...');
        logger.info('Loading Detectify vulnerabilities (TUI)');

        // Load ALL vulnerabilities using pagination with progressive updates
        await detectifyService.getAllVulnerabilities({
          onBatch: (batch, allSoFar, total) => {
            // Update store progressively as each batch arrives (don't reset cursor)
            useStore.getState().updateVulnerabilitiesProgressively(allSoFar, total || allSoFar.length);
          },
          onProgress: (fetched, total) => {
            setLoadingMessage(`Loading vulnerabilities... ${fetched}${total ? `/${total}` : ''}`);
          },
        });

        logger.info('Vulnerabilities loaded', {
          count: useStore.getState().vulnerabilities.length,
        });
        useStore.getState().setLoading(false);
        setLoadingMessage('Ready');
      } catch (err) {
        logger.error('Failed to load vulnerabilities', err);
        useStore.getState().setError(err.message);
        useStore.getState().setLoading(false);
        setLoadingMessage('Error loading');
      }
    };

    loadVulnerabilities();
  }, [detectifyService]);

  // Reload helper
  const reloadVulnerabilities = useCallback(async () => {
    try {
      useStore.getState().setLoading(true);
      setLoadingMessage('Reloading...');

      // Load ALL vulnerabilities using pagination with progressive updates
      await detectifyService.getAllVulnerabilities({
        onBatch: (batch, allSoFar, total) => {
          // Update store progressively - use refreshVulnerabilities to preserve cursor position
          useStore.getState().updateVulnerabilitiesProgressively(allSoFar, total || allSoFar.length);
        },
        onProgress: (fetched, total) => {
          setLoadingMessage(`Reloading... ${fetched}${total ? `/${total}` : ''}`);
        },
      });

      useStore.getState().setLoading(false);
      setLoadingMessage('Ready');
    } catch (err) {
      logger.error('Failed to reload', err);
      useStore.getState().setError(err.message);
      useStore.getState().setLoading(false);
    }
  }, [detectifyService]);

  // Handle status update
  const handleStatusUpdate = useCallback(async (targetStatus, progressCallback) => {
    const vulnsToUpdate = selectedVulnerabilityIds.length > 0
      ? selectedVulnerabilities
      : (currentVulnerability ? [currentVulnerability] : []);

    if (vulnsToUpdate.length === 0) return;

    const total = vulnsToUpdate.length;
    let current = 0;

    for (const vuln of vulnsToUpdate) {
      try {
        await detectifyService.updateStatus(vuln.uuid, targetStatus, {
          currentStatus: vuln.status,
          title: vuln.title,
          host: vuln.host,
        });
        current++;
        if (progressCallback) progressCallback(current, total);
      } catch (err) {
        logger.error('Failed to update vulnerability', { uuid: vuln.uuid, error: err.message });
        throw err;
      }
    }

    // Clear selection immediately
    useStore.getState().clearSelection();
    
    // Start reload in background (don't await - let modal close immediately)
    reloadVulnerabilities().catch((err) => {
      logger.error('Background reload failed', err);
    });
  }, [selectedVulnerabilityIds, selectedVulnerabilities, currentVulnerability, detectifyService, reloadVulnerabilities]);

  // Handle filter selection
  const handleFilterSelect = useCallback((filterType, value) => {
    const store = useStore.getState();
    if (filterType === 'status') {
      store.setFilterStatus(value);
    } else if (filterType === 'severity') {
      store.setFilterSeverity(value);
    } else if (filterType === 'scanSource') {
      store.setFilterScanSource(value);
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    useStore.getState().clearFilters();
  }, []);

  // Apply filter presets
  const applyFilterPreset = useCallback((preset) => {
    const store = useStore.getState();
    store.clearFilters();

    switch (preset) {
      case 'active':
        store.setFilterStatus('active');
        break;
      case 'new':
        store.setFilterStatus('new');
        break;
      case 'patched':
        store.setFilterStatus('patched');
        break;
      case 'accepted':
        store.setFilterStatus('accepted_risk');
        break;
      case 'false-positive':
        store.setFilterStatus('false_positive');
        break;
      case 'critical':
        store.setFilterSeverity('critical');
        break;
      case 'high':
        store.setFilterSeverity('high');
        break;
      case 'medium':
        store.setFilterSeverity('medium');
        break;
      default:
        break;
    }
  }, []);

  // Keyboard shortcuts
  const shortcuts = useMemo(() => [
    // Navigation
    {
      key: 'uparrow',
      action: () => {
        pendingCursorMove.current -= 1;
        flushCursorMove();
      },
      description: 'Navigate up',
      group: 'Navigation',
    },
    {
      key: 'downarrow',
      action: () => {
        pendingCursorMove.current += 1;
        flushCursorMove();
      },
      description: 'Navigate down',
      group: 'Navigation',
    },
    {
      key: 'pageup',
      action: () => {
        pendingCursorMove.current -= 10;
        flushCursorMove();
      },
      description: 'Page up',
      group: 'Navigation',
    },
    {
      key: 'pagedown',
      action: () => {
        pendingCursorMove.current += 10;
        flushCursorMove();
      },
      description: 'Page down',
      group: 'Navigation',
    },
    {
      key: 'enter',
      action: () => currentVulnerability && setActiveModal('details'),
      description: 'View Details',
      condition: () => !!currentVulnerability,
      group: 'Navigation',
    },
    {
      key: 'leftarrow',
      action: () => {
        if (currentVulnerability?.links?.details_page) {
          open(currentVulnerability.links.details_page).catch(() => {});
        }
      },
      description: 'Open Detectify',
      condition: () => !!currentVulnerability?.links?.details_page,
      group: 'Navigation',
      hint: true,
    },
    {
      key: 'rightarrow',
      action: () => {
        if (currentVulnerability?.location?.startsWith('http')) {
          open(currentVulnerability.location).catch(() => {});
        } else if (currentVulnerability?.host) {
          const url = currentVulnerability.host.startsWith('http')
            ? currentVulnerability.host
            : `https://${currentVulnerability.host}`;
          open(url).catch(() => {});
        }
      },
      description: 'Open Location',
      condition: () => !!currentVulnerability?.location || !!currentVulnerability?.host,
      group: 'Navigation',
      hint: true,
    },

    // Selection
    {
      key: 'space',
      action: () => {
        if (currentVulnerability) {
          useStore.getState().toggleVulnerabilitySelection(currentVulnerability.uuid);
          pendingCursorMove.current += 1;
          flushCursorMove();
        }
      },
      description: 'Select',
      condition: () => !!currentVulnerability,
      group: 'Selection',
    },
    {
      key: 'ctrl+a',
      action: () => useStore.getState().selectAllVulnerabilities(),
      description: 'Select all',
      condition: () => filteredVulnerabilities.length > 0,
      group: 'Selection',
    },
    {
      key: 'alt+a',
      action: () => useStore.getState().clearSelection(),
      description: 'Clear selection',
      condition: () => selectedVulnerabilityIds.length > 0,
      group: 'Selection',
    },

    // Actions
    {
      key: 'l',
      action: () => currentVulnerability && setActiveModal('links'),
      description: 'Links',
      condition: () => !!currentVulnerability,
      group: 'Actions',
    },
    {
      key: 'u',
      action: () => (currentVulnerability || selectedVulnerabilityIds.length > 0) && setActiveModal('update-status'),
      description: 'Update Status',
      condition: () => !!currentVulnerability || selectedVulnerabilityIds.length > 0,
      group: 'Actions',
    },
    {
      key: 'j',
      action: () => setActiveModal('create-jira'),
      description: 'Create Jira',
      condition: () => selectedVulnerabilityIds.length > 0 || !!currentVulnerability,
      group: 'Actions',
    },

    // Filtering
    {
      key: 'f',
      action: () => vulnerabilities.length > 0 && setActiveModal('filter'),
      description: 'Filter',
      condition: () => vulnerabilities.length > 0,
      group: 'Filtering',
      hint: true,
    },
    {
      key: '/',
      action: () => setActiveModal('search'),
      description: 'Search',
      group: 'Filtering',
    },
    // Filter presets
    {
      key: '1',
      action: () => applyFilterPreset('active'),
      description: 'Active',
      group: 'Filter Presets',
    },
    {
      key: '2',
      action: () => applyFilterPreset('new'),
      description: 'New',
      group: 'Filter Presets',
    },
    {
      key: '3',
      action: () => applyFilterPreset('patched'),
      description: 'Patched',
      group: 'Filter Presets',
    },
    {
      key: '4',
      action: () => applyFilterPreset('critical'),
      description: 'Critical',
      group: 'Filter Presets',
    },
    {
      key: '5',
      action: () => applyFilterPreset('high'),
      description: 'High',
      group: 'Filter Presets',
    },
    {
      key: 'alt+f',
      action: clearFilters,
      description: 'Clear Filters',
      condition: () => filterStatus || filterSeverity || filterScanSource || searchText,
      group: 'Filtering',
    },
    {
      key: 'x',
      action: () => {
        const store = useStore.getState();
        if (!store.excludeResolved) {
          store.setExcludeResolved(true);
        }
      },
      description: 'Show Active Only',
      condition: () => !excludeResolved,
      group: 'Filtering',
      hint: true,
    },
    {
      key: 'alt+x',
      action: () => {
        const store = useStore.getState();
        if (store.excludeResolved) {
          store.setExcludeResolved(false);
        }
      },
      description: 'Show All',
      condition: () => excludeResolved,
      group: 'Filtering',
      hint: true,
    },

    // Sorting
    {
      key: 'o',
      action: () => {
        const currentSort = useStore.getState().sortBy;
        const sortOptions = ['severity', 'title', 'status', 'host', 'updated'];
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
      action: reloadVulnerabilities,
      description: 'Reload',
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
      key: 'h',
      action: () => setActiveModal('help'),
      description: 'Help',
      group: 'General',
    },
    {
      key: 'ctrl+q',
      action: () => exit(),
      description: 'Quit',
      group: 'General',
      hint: true,
    },
    {
      key: 'escape',
      action: () => {
        if (activeModal) {
          setActiveModal(null);
        }
      },
      description: 'Close modal',
      group: 'General',
    },
  ], [
    flushCursorMove,
    currentVulnerability,
    filteredVulnerabilities.length,
    selectedVulnerabilityIds.length,
    vulnerabilities.length,
    filterStatus,
    filterSeverity,
    filterScanSource,
    searchText,
    excludeResolved,
    applyFilterPreset,
    clearFilters,
    reloadVulnerabilities,
    activeModal,
    exit,
  ]);

  // Register keyboard shortcuts
  useKeyboardShortcuts('vulnerability-list', shortcuts, {
    enabled: !activeModal && !textInputConfig,
  });

  // Calculate layout dimensions
  const mainPanelHeight = height - 4;

  // Prepare Jira default project key
  const defaultJiraProjectKey = process.env.JIRA_PROJECT_KEY || '';

  return (
    <Layout width={width} height={height}>
      {/* Main content */}
      <Box flexGrow={1} flexDirection="row">
        {/* Context pane (left) */}
        {showContextPane && (
          <ContextPane
            totalCount={totalVulnerabilities}
            filteredCount={filteredVulnerabilities.length}
            shortcuts={shortcuts}
          />
        )}

        {/* Vulnerability list (center) */}
        <VulnerabilityListPanel
          vulnerabilities={filteredVulnerabilities}
          cursor={listCursor}
          selectedIds={selectedVulnerabilityIds}
          filterStatus={filterStatus}
          filterSeverity={filterSeverity}
          filterScanSource={filterScanSource}
          searchText={searchText}
          height={mainPanelHeight}
        />

        {/* Details pane (right) */}
        {showDetailsPane && (
          <DetailsPreviewPanel vulnerability={currentVulnerability} />
        )}
      </Box>

      {/* Status Bar (footer) */}
      <StatusBar 
        error={error}
        loading={loading}
        message={loadingMessage}
        excludeResolved={excludeResolved}
        sortBy={sortBy}
        filterStatus={filterStatus}
        filterSeverity={filterSeverity}
        searchText={searchText}
      />

      {/* Modals */}
      {activeModal === 'help' && (
        <HelpModal
          view="vulnerability-list"
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'details' && currentVulnerability && (
        <VulnerabilityModal
          vulnerability={currentVulnerability}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'links' && currentVulnerability && (
        <LinksModal
          vulnerability={currentVulnerability}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'filter' && (
        <FilterModal
          vulnerabilities={vulnerabilities}
          onSelect={handleFilterSelect}
          onClear={clearFilters}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'search' && (
        <SearchModal
          onClose={() => setActiveModal(null)}
          onSearch={(text) => {
            useStore.getState().setSearchText(text);
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'update-status' && (
        <UpdateStatusModal
          vulnerabilityCount={selectedVulnerabilityIds.length > 0 ? selectedVulnerabilityIds.length : 1}
          vulnerabilities={selectedVulnerabilities}
          onUpdate={handleStatusUpdate}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'create-jira' && (
        <CreateJiraModal
          vulnerabilities={selectedVulnerabilities}
          defaultProjectKey={defaultJiraProjectKey}
          onCreate={async (projectKey, groupBy, vulns, parentEpic) => {
            // TODO: Implement Jira creation logic
            logger.info('Creating Jira issues', { projectKey, groupBy, count: vulns.length, parentEpic });
            // For now, just log - full implementation would use jiraService
            throw new Error('Jira creation not yet fully implemented for Detectify');
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Text Input Page (for full-screen text input - avoid modal lag) */}
      {textInputConfig && (
        <TextInputPage
          title={textInputConfig.title}
          subtitle={textInputConfig.subtitle}
          borderColor={textInputConfig.borderColor}
          placeholder={textInputConfig.placeholder}
          initialValue={textInputConfig.initialValue}
          onComplete={(value) => {
            textInputConfig.onComplete(value);
            setTextInputConfig(null);
          }}
          onCancel={() => setTextInputConfig(null)}
        />
      )}
    </Layout>
  );
});
App.displayName = 'DetectifyApp';

export default App;
