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
    const [cursor, setCursor] = useState(0);
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'issues'
    const { height } = useTerminalSize();

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
            total: 0,
          };
          return total > 0;
        });
      }

      // Search filter
      if (searchText) {
        const search = searchText.toLowerCase();
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
          const aCount = appScanService?.getAppIssueCounts(a)?.total || 0;
          const bCount = appScanService?.getAppIssueCounts(b)?.total || 0;
          return bCount - aCount; // Descending
        }
        return 0;
      });

      return filtered;
    }, [applications, searchText, sortBy, hideEmpty, appScanService]);

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
    }, []); // Only run once on mount

    // Handle keyboard input
    useInput((input, key) => {
      // Handle special keys first (before they can affect search)
      if (key.escape) {
        onCancel();
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

      if (key.return && filteredApps[cursor]) {
        onSelect(filteredApps[cursor]);
        return;
      }

      if (input === 's') {
        // Toggle sort
        setSortBy((prev) => (prev === 'name' ? 'issues' : 'name'));
        return;
      }

      if (input === 'h') {
        // Toggle hide empty (not implemented in this simplified version)
        return;
      }

      // Ignore special keys and modifier combinations that shouldn't trigger search
      // Only process printable characters for search
      if (
        key.ctrl ||
        key.meta ||
        key.shift ||
        key.tab ||
        key.backspace ||
        key.delete ||
        key.pageUp ||
        key.pageDown ||
        key.home ||
        key.end ||
        !input // Empty input means it was a special key
      ) {
        return;
      }
    });

    const renderItem = useCallback(
      (app, isSelected) => {
        const { active, total } = appScanService?.getAppIssueCounts(app) || {
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
            <Text color={active > 0 ? 'red' : 'gray'}>{active}</Text>
            <Text dimColor> / {total} issues)</Text>
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
