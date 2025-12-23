/**
 * ScanSelectionModal
 * Modal for selecting a scan with search, type filter, and sort options
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import { ScrollableList } from './ScrollableList.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

const SCAN_TYPES = ['SAST', 'DAST', 'SCA', 'IAST', 'IAC'];

export const ScanSelectionModal = React.memo(
  ({
    scans,
    onSelect,
    onCancel,
    hideEmpty = false,
    appScanService,
    selectedScan,
  }) => {
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [cursor, setCursor] = useState(0);
    const [filterType, setFilterType] = useState(null); // null | 'SAST' | 'DAST' | etc.
    const { height } = useTerminalSize();

    // Debounce search text to avoid filtering on every keystroke
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchText(searchText);
      }, 200); // 200ms delay

      return () => clearTimeout(timer);
    }, [searchText]);

    // Filter and sort scans, with special "View All" option
    const filteredScans = useMemo(() => {
      let filtered = [...scans];

      // Hide empty if requested
      if (hideEmpty) {
        filtered = filtered.filter((scan) => {
          const { total } = appScanService?.getScanIssueCounts(scan) || {
            total: 0,
          };
          return total > 0;
        });
      }

      // Type filter
      if (filterType) {
        filtered = filtered.filter((scan) => {
          const tech = scan.Technology || '';
          return tech.toUpperCase().includes(filterType);
        });
      }

      // Search filter
      if (debouncedSearchText) {
        const search = debouncedSearchText.toLowerCase();
        filtered = filtered.filter((scan) =>
          scan.Name?.toLowerCase().includes(search)
        );
      }

      // Sort by name
      filtered.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));

      // Add "View all vulnerabilities" as the first option
      // Use a special marker object to identify it
      const viewAllOption = {
        Id: '__VIEW_ALL__',
        Name: '🔍 View all vulnerabilities (across all scans)',
        Technology: 'All',
        _isViewAll: true,
      };

      return [viewAllOption, ...filtered];
    }, [scans, debouncedSearchText, filterType, hideEmpty, appScanService]);

    // Auto-select the currently selected scan when modal opens
    useEffect(() => {
      if (selectedScan) {
        const index = filteredScans.findIndex(
          (scan) => scan.Id === selectedScan.Id
        );
        if (index !== -1) {
          setCursor(index);
        }
      }
    }, [selectedScan, filteredScans]); // Run when selectedScan or filteredScans changes

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
        setCursor((prev) => Math.min(filteredScans.length - 1, prev + 1));
        return;
      }

      if (key.return && filteredScans[cursor]) {
        onSelect(filteredScans[cursor]);
        return;
      }

      if (input === 'f') {
        // Cycle through filter types
        const currentIndex = filterType ? SCAN_TYPES.indexOf(filterType) : -1;
        const nextIndex = (currentIndex + 1) % (SCAN_TYPES.length + 1);
        setFilterType(
          nextIndex === SCAN_TYPES.length ? null : SCAN_TYPES[nextIndex]
        );
        setCursor(0);
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

    // Ensure cursor stays within bounds when the filtered list changes
    React.useEffect(() => {
      setCursor((prev) =>
        Math.min(prev, Math.max(0, filteredScans.length - 1))
      );
    }, [filteredScans.length]);

    const renderItem = useCallback(
      (scan, isSelected) => {
        // Special rendering for "View all vulnerabilities" option
        if (scan._isViewAll) {
          return (
            <Box>
              <Text color={isSelected ? 'cyan' : 'green'} bold>
                {isSelected ? '▶ ' : '  '}
                {scan.Name}
              </Text>
            </Box>
          );
        }

        const { critical, high, medium, low, info, total } =
          appScanService?.getScanIssueCounts(scan) || {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
            total: 0,
          };
        const tech = scan.Technology || 'Unknown';

        // Build array of non-zero severity counts with their labels and colors
        const severities = [];
        if (critical > 0)
          severities.push({ count: critical, label: 'C', color: 'red' });
        if (high > 0)
          severities.push({ count: high, label: 'H', color: 'yellow' });
        if (medium > 0)
          severities.push({ count: medium, label: 'M', color: 'white' });
        if (low > 0)
          severities.push({ count: low, label: 'L', color: 'white' });
        if (info > 0)
          severities.push({ count: info, label: 'I', color: 'white' });

        return (
          <Box>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}
              {scan.Name || 'Unnamed Scan'}
            </Text>
            <Text dimColor> [{tech}] </Text>
            {severities.length > 0 ? (
              <>
                {severities.map((sev, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Text dimColor>, </Text>}
                    <Text color={sev.color}>{sev.count}</Text>
                    <Text dimColor> {sev.label}</Text>
                  </React.Fragment>
                ))}
                <Text dimColor> </Text>
              </>
            ) : null}
            <Text dimColor>({total})</Text>
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
        <Panel title="Select Scan" borderColor="cyan">
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
              items={filteredScans}
              cursor={cursor}
              renderItem={renderItem}
              visibleRows={visibleRows}
              emptyMessage="No scans found"
            />

            {/* Footer */}
            <Box marginTop={1}>
              <Text dimColor>
                {filteredScans.length} of {scans.length} scans
              </Text>
            </Box>
          </Box>
        </Panel>
      </Modal>
    );
  }
);

ScanSelectionModal.displayName = 'ScanSelectionModal';
