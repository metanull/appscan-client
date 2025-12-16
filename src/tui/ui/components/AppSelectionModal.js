/**
 * AppSelectionModal
 * Modal for selecting an application with search, sort, and filter options
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import { ScrollableList } from './ScrollableList.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

export const AppSelectionModal = React.memo(({ 
  applications, 
  onSelect, 
  onCancel,
  hideEmpty = false 
}) => {
  const [searchText, setSearchText] = useState('');
  const [cursor, setCursor] = useState(0);
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'issues'
  const { height } = useTerminalSize();

  // Filter and sort applications
  const filteredApps = useMemo(() => {
    let filtered = [...applications];

    // Hide empty if requested
    if (hideEmpty) {
      filtered = filtered.filter(app => {
        const issueCount = app.IssueCountTotal || 0;
        return issueCount > 0;
      });
    }

    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(app => 
        app.Name?.toLowerCase().includes(search) ||
        app.Description?.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.Name || '').localeCompare(b.Name || '');
      } else if (sortBy === 'issues') {
        const aCount = a.IssueCountTotal || 0;
        const bCount = b.IssueCountTotal || 0;
        return bCount - aCount; // Descending
      }
      return 0;
    });

    return filtered;
  }, [applications, searchText, sortBy, hideEmpty]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.upArrow) {
      setCursor(prev => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setCursor(prev => Math.min(filteredApps.length - 1, prev + 1));
      return;
    }

    if (key.return && filteredApps[cursor]) {
      onSelect(filteredApps[cursor]);
      return;
    }

    if (input === 's') {
      // Toggle sort
      setSortBy(prev => prev === 'name' ? 'issues' : 'name');
      return;
    }

    if (input === 'h') {
      // Toggle hide empty (not implemented in this simplified version)
      return;
    }
  });

  const renderItem = useCallback((app, isSelected) => {
    const issueCount = app.IssueCountTotal || 0;
    
    return (
      <Box>
        <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
          {isSelected ? '▶ ' : '  '}
          {app.Name || 'Unnamed App'}
        </Text>
        <Text dimColor> ({issueCount} issues)</Text>
      </Box>
    );
  }, []);

  const visibleRows = Math.max(10, height - 12);

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

          {/* Controls hint */}
          <Box marginBottom={1}>
            <Text dimColor>
              Sort: [s] {sortBy === 'name' ? 'Name' : 'Issues'} | ESC: Cancel | Enter: Select
            </Text>
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
});

AppSelectionModal.displayName = 'AppSelectionModal';
