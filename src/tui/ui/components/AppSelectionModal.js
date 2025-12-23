/**
 * AppSelectionModal
 * Modal for selecting an application with search, sort, and filter options
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import { ScrollableList } from './ScrollableList.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

export const AppSelectionModal = React.memo(
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
    }, [selectedApp, filteredApps]); // Run when selectedApp or filteredApps changes

    // Handle keyboard input
    useInput((input, key) => {
      // Handle special keys first (before they can affect search)
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
    // Modal takes 80% of height, then subtract chrome:
    // - Modal padding (2 lines)
    // - Panel border (2 lines)
    // - Panel title (1 line)
    // - Search box (3 lines: label + input + margin)
    // - Controls hint (1 line + margin = 2 lines)
    // - Footer (1 line + margin = 2 lines)
    // Total chrome: ~13 lines
    const modalHeight = Math.floor(height * 0.8);
    const chromeLines = 13;
    const availableRows = modalHeight - chromeLines;
    const visibleRows = Math.max(1, availableRows);

    return (
      <Modal width={70} height={80}>
        <Panel title="Select Application" borderColor="cyan">
          <Box flexDirection="column" gap={1}>
            {/* Search box */}
            <Box flexDirection="column" marginBottom={1}>
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
              visibleRows={visibleRows}
              emptyMessage="No applications found"
            />

            {/* Footer */}
            <Box marginTop={1}>
              <Text dimColor>
                {filteredApps.length} of {applications.length} applications
              </Text>
            </Box>
          </Box>
        </Panel>
      </Modal>
    );
  }
);

AppSelectionModal.displayName = 'AppSelectionModal';
