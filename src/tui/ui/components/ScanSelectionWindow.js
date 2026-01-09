/**
 * ScanSelectionWindow
 * Standalone window for selecting a scan with search, type filter, and sort options
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { ScrollableList } from './ScrollableList.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

const SCAN_TYPES = ['SAST', 'DAST', 'SCA', 'IAST', 'IAC'];

/**
 * Full-screen scan selection window with search, filtering, and type-based filtering
 * Includes a special "View All" option to see issues across all scans
 *
 * @param {Object} props
 * @param {Array} props.scans - List of scans to display
 * @param {Function} props.onSelect - Callback when a scan is selected
 * @param {Function} props.onCancel - Callback when selection is cancelled
 * @param {boolean} [props.hideEmpty=false] - Whether to hide scans with no issues
 * @param {Object} props.appScanService - Service for scan operations
 * @param {Object} props.selectedScan - Currently selected scan
 * @returns {JSX.Element}
 */
export const ScanSelectionWindow = React.memo(
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

      filtered.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));

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
    }, [selectedScan, filteredScans]);

    useInput((input, key) => {
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
            Select Scan
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
            items={filteredScans}
            cursor={cursor}
            renderItem={renderItem}
            visibleRows={availableRows}
            emptyMessage="No scans found"
          />

          {/* Footer */}
          <Box marginTop={1}>
            <Text dimColor>
              {filteredScans.length} of {scans.length} scans
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>↑↓: Navigate | Enter: Select | ESC: Cancel</Text>
          </Box>
        </Box>
      </Box>
    );
  }
);

ScanSelectionWindow.displayName = 'ScanSelectionWindow';
