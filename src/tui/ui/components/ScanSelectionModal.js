/**
 * ScanSelectionModal
 * Modal for selecting a scan with search, type filter, and sort options
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import { ScrollableList } from './ScrollableList.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

const SCAN_TYPES = ['SAST', 'DAST', 'SCA', 'IAST', 'IAC'];

export const ScanSelectionModal = React.memo(
  ({ scans, onSelect, onCancel, hideEmpty = false }) => {
    const [searchText, setSearchText] = useState('');
    const [cursor, setCursor] = useState(0);
    const [filterType, setFilterType] = useState(null); // null | 'SAST' | 'DAST' | etc.
    const { height } = useTerminalSize();

    // Filter and sort scans
    const filteredScans = useMemo(() => {
      let filtered = [...scans];

      // Hide empty if requested
      if (hideEmpty) {
        filtered = filtered.filter((scan) => {
          const issueCount =
            (scan.LatestExecution?.NIssuesFound || 0) +
            (Number(scan.CriticalIssues) || 0) +
            (Number(scan.HighIssues) || 0) +
            (Number(scan.MediumIssues) || 0) +
            (Number(scan.LowIssues) || 0) +
            (Number(scan.InformationalIssues) || 0);
          return issueCount > 0;
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
      if (searchText) {
        const search = searchText.toLowerCase();
        filtered = filtered.filter((scan) =>
          scan.Name?.toLowerCase().includes(search)
        );
      }

      // Sort by name
      filtered.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));

      return filtered;
    }, [scans, searchText, filterType, hideEmpty]);

    // Handle keyboard input
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
    });

    // Ensure cursor stays within bounds when the filtered list changes
    React.useEffect(() => {
      setCursor((prev) =>
        Math.min(prev, Math.max(0, filteredScans.length - 1))
      );
    }, [filteredScans.length]);

    const renderItem = useCallback((scan, isSelected) => {
      const issueCount =
        (scan.LatestExecution?.NIssuesFound || 0) +
        (Number(scan.CriticalIssues) || 0) +
        (Number(scan.HighIssues) || 0) +
        (Number(scan.MediumIssues) || 0) +
        (Number(scan.LowIssues) || 0) +
        (Number(scan.InformationalIssues) || 0);
      const tech = scan.Technology || 'Unknown';

      return (
        <Box>
          <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
            {isSelected ? '▶ ' : '  '}
            {scan.Name || 'Unnamed Scan'}
          </Text>
          <Text dimColor>
            {' '}
            [{tech}] ({issueCount} issues)
          </Text>
        </Box>
      );
    }, []);

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
