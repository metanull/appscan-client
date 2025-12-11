/**
 * CommandBar Component
 * Bottom status bar showing hints, active filters, and keyboard shortcuts
 */

import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';

export const CommandBar = () => {
  const view = useStore((state) => state.view);
  const hasActiveFilters = useStore((state) => state.hasActiveFilters());
  const filterStatus = useStore((state) => state.filterStatus);
  const filterSeverity = useStore((state) => state.filterSeverity);
  const filterIssueType = useStore((state) => state.filterIssueType);
  const filterJira = useStore((state) => state.filterJira);
  const searchText = useStore((state) => state.searchText);
  const selectedIssueIds = useStore((state) => state.selectedIssueIds);

  const getHints = () => {
    switch (view) {
      case 'app-selection':
        return '↑↓ Navigate | Enter Select | q Quit | ? Help';
      case 'scan-selection':
        return '↑↓ Navigate | Enter Select | Backspace Back | q Quit | ? Help';
      case 'issue-list':
        return '↑↓ Navigate | Space Select | Enter View | u Update | c Create Jira | f Filter | / Search | Backspace Back | q Quit | ? Help';
      case 'issue-details':
        return 'Backspace Back | q Quit';
      default:
        return '';
    }
  };

  const getFilterSummary = () => {
    const filters = [];
    if (filterStatus) filters.push(`Status:${filterStatus}`);
    if (filterSeverity) filters.push(`Severity:${filterSeverity}`);
    if (filterIssueType) filters.push(`Type:${filterIssueType}`);
    if (filterJira) filters.push(`Jira:${filterJira === 'with' ? 'Has' : 'None'}`);
    if (searchText) filters.push(`Search:"${searchText}"`);
    return filters.join(' | ');
  };

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
      {hasActiveFilters && (
        <Box>
          <Text color="yellow">🔍 Filters: </Text>
          <Text color="cyan">{getFilterSummary()}</Text>
          <Text dimColor> (DEL to clear)</Text>
        </Box>
      )}
      {selectedIssueIds.length > 0 && (
        <Box>
          <Text color="green">✓ Selected: {selectedIssueIds.length} issue(s)</Text>
        </Box>
      )}
      <Box>
        <Text dimColor>{getHints()}</Text>
      </Box>
    </Box>
  );
};

export default CommandBar;
