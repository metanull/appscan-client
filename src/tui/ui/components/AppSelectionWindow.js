/**
 * AppSelectionWindow
 * Standalone window for selecting an application with search, sort, and filter options
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { ScrollableList } from './ScrollableList.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

/**
 * Full-screen application selection window with search, filtering, and sorting capabilities
 *
 * @param {Object} props
 * @param {Array} props.applications - List of applications to display
 * @param {Function} props.onSelect - Callback when an application is selected
 * @param {Function} props.onCancel - Callback when selection is cancelled
 * @param {boolean} [props.hideEmpty=false] - Whether to hide applications with no issues
 * @param {Object} props.appScanService - Service for application/scan operations
 * @param {Object} props.selectedApp - Currently selected application
 * @returns {JSX.Element}
 */
export const AppSelectionWindow = React.memo(
  ({
    applications,
    onSelect,
    onCancel,
    hideEmpty = false,
    appScanService,
    selectedApp,
  }) => {
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [cursor, setCursor] = useState(0);
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'issues'
    const { height } = useTerminalSize();

    // Debounce search text to avoid filtering on every keystroke
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchText(searchText);
      }, 200); // 200ms delay

      return () => clearTimeout(timer);
    }, [searchText]);

    // Filter and sort applications
    const filteredApps = useMemo(() => {
      let filtered = [...applications];

      // ALWAYS filter out applications with 0 scans
      filtered = filtered.filter((app) => {
        const scanCount = appScanService?.getAppScanCount(app) || 0;
        return scanCount > 0;
      });

      // Hide empty if requested (0 issues)
      if (hideEmpty) {
        filtered = filtered.filter((app) => {
          const { total } = appScanService?.getAppIssueCounts(app) || {
            inProgress: 0,
            active: 0,
            total: 0,
          };
          return total > 0;
        });
      }

      // Search filter
      if (debouncedSearchText) {
        const search = debouncedSearchText.toLowerCase();
        filtered = filtered.filter(
          (app) =>
            app.Name?.toLowerCase().includes(search) ||
            app.Description?.toLowerCase().includes(search)
        );
      }

      // Sort
      filtered.sort((a, b) => {
        if (sortBy === 'name') {
          return (a.Name || '').localeCompare(b.Name || '');
        } else if (sortBy === 'issues') {
          const aCount = appScanService?.getAppIssueCounts(a)?.active || 0;
          const bCount = appScanService?.getAppIssueCounts(b)?.active || 0;
          return bCount - aCount; // Descending by active issues
        }
        return 0;
      });

      return filtered;
    }, [applications, debouncedSearchText, sortBy, hideEmpty, appScanService]);

    // Auto-select the currently selected app when modal opens
    useEffect(() => {
      if (selectedApp) {
        const index = filteredApps.findIndex(
          (app) => app.Id === selectedApp.Id
        );
        if (index !== -1) {
          setCursor(index);
        }
      }
    }, [selectedApp, filteredApps]);

    useInput((input, key) => {
      if (key.escape) {
        onCancel();
        return;
      }

      if (key.return && filteredApps[cursor]) {
        onSelect(filteredApps[cursor]);
        return;
      }

      if (key.upArrow) {
        setCursor((prev) => Math.max(0, prev - 1));
        return;
      }

      if (key.downArrow) {
        setCursor((prev) => Math.min(filteredApps.length - 1, prev + 1));
        return;
      }

      if (key.leftArrow || key.rightArrow) {
        setSortBy((prev) => (prev === 'name' ? 'issues' : 'name'));
        return;
      }
    });

    const renderItem = useCallback(
      (app, isSelected) => {
        const { inProgress, active, total } = appScanService?.getAppIssueCounts(
          app
        ) || {
          inProgress: 0,
          active: 0,
          total: 0,
        };

        return (
          <Box>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}
              {app.Name || 'Unnamed App'}
            </Text>
            <Text dimColor> (</Text>
            <Text color={inProgress > 0 ? 'green' : 'gray'}>{inProgress}</Text>
            <Text dimColor> | </Text>
            <Text color={active > inProgress ? 'red' : 'gray'}>{active}</Text>
            <Text dimColor> | </Text>
            <Text color="gray">{total}</Text>
            <Text dimColor>)</Text>
          </Box>
        );
      },
      [appScanService]
    );

    // Calculate available rows for the list
    const availableRows = Math.max(10, height - 15); // Full screen minus chrome

    return (
      <Box
        width="100%"
        height="100%"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        paddingTop={2}
      >
        <Box
          flexDirection="column"
          width="70%"
          borderStyle="double"
          borderColor="cyan"
          paddingX={2}
          paddingY={1}
        >
          <Text bold color="cyan">
            Select Application
          </Text>

          {/* Search box */}
          <Box flexDirection="column" marginTop={1} marginBottom={1}>
            <Text dimColor>Search: </Text>
            <TextInput
              value={searchText}
              onChange={setSearchText}
              placeholder="Type to search..."
            />
          </Box>

          {/* List */}
          <ScrollableList
            items={filteredApps}
            cursor={cursor}
            renderItem={renderItem}
            visibleRows={availableRows}
            emptyMessage="No applications found"
          />

          {/* Footer */}
          <Box marginTop={1}>
            <Text dimColor>
              {filteredApps.length} of {applications.length} applications
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>
              ↑↓: Navigate | ←→: Sort | Enter: Select | ESC: Cancel
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }
);

AppSelectionWindow.displayName = 'AppSelectionWindow';
