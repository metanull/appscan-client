/**
 * CommandBar Component
 * Bottom status bar showing hints, active filters, and keyboard shortcuts
 */

import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';
import { getPackageInfo } from '../../utils/package-info.js';

const packageInfo = getPackageInfo();

export const CommandBar = () => {
  const view = useStore((state) => state.view);
  const hasActiveFiltersFunc = useStore((state) => state.hasActiveFilters);
  const hasActiveFilters = hasActiveFiltersFunc();
  const filterStatus = useStore((state) => state.filterStatus);
  const filterSeverity = useStore((state) => state.filterSeverity);
  const filterIssueType = useStore((state) => state.filterIssueType);
  const filterJira = useStore((state) => state.filterJira);
  const searchText = useStore((state) => state.searchText);
  const selectedIssueIds = useStore((state) => state.selectedIssueIds);
  const sortBy = useStore((state) => state.sortBy);

  const getHints = () => {
    switch (view) {
      case 'app-selection':
        return '↑↓ Navigate | Enter Select | q Quit | ? Help';
      case 'scan-selection':
        return '↑↓ Navigate | Enter Select | / Search | t Type | h Hide Empty | l Links | b/Back | q Quit | ? Help';
      case 'issue-list':
        return '↑↓ Navigate | Space Select | Enter View | l Links | s Sort | u Update | c Create Jira | f Filter | 1-9 Group | / Search | b/Back | q Quit | ? Help';
      case 'issue-details':
        return 'l Links | b/Backspace Back | q Quit';
      default:
        return '';
    }
  };

  const getFilterSummary = () => {
    const filters = [];
    if (filterStatus) filters.push(`Status:${filterStatus}`);
    if (filterSeverity) filters.push(`Severity:${filterSeverity}`);
    if (filterIssueType) filters.push(`Type:${filterIssueType}`);
    if (filterJira)
      filters.push(`Jira:${filterJira === 'with' ? 'Has' : 'None'}`);
    if (searchText) filters.push(`Search:"${searchText}"`);
    return filters.join(' | ');
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
    >
      {view === 'issue-list' && sortBy && (
        <Box>
          <Text color="cyan">📊 Sort: </Text>
          <Text color="yellow">
            {sortBy === 'severity'
              ? 'By Severity'
              : sortBy === 'name'
                ? 'By Name'
                : 'By Status'}
          </Text>
          <Text dimColor> (s to change)</Text>
        </Box>
      )}
      {hasActiveFilters && (
        <Box>
          <Text color="yellow">🔍 Filters: </Text>
          <Text color="cyan">{getFilterSummary()}</Text>
          <Text dimColor> (DEL to clear)</Text>
        </Box>
      )}
      {selectedIssueIds.length > 0 && (
        <Box>
          <Text color="green">
            ✓ Selected: {selectedIssueIds.length} issue(s)
          </Text>
        </Box>
      )}
      <Box justifyContent="space-between">
        <Text dimColor>{getHints()}</Text>
        <Text dimColor>
          Author: Pascal Havelange | v{packageInfo.version} | MIT License
        </Text>
      </Box>
    </Box>
  );
};

export default CommandBar;
