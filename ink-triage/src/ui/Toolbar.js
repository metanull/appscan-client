/**
 * Toolbar Component
 * Top toolbar showing current context and quick actions
 */

import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';

export const Toolbar = () => {
  const view = useStore((state) => state.view);
  const selectedApp = useStore((state) => state.selectedApp);
  const selectedScan = useStore((state) => state.selectedScan);
  const issues = useStore((state) => state.issues);
  const getFilteredIssues = useStore((state) => state.getFilteredIssues);
  const filteredIssues = getFilteredIssues();

  const getTitle = () => {
    switch (view) {
      case 'app-selection':
        return 'Select Application';
      case 'scan-selection':
        return `Select Scan - ${selectedApp?.Name || 'Unknown App'}`;
      case 'issue-list':
        return `Vulnerabilities - ${selectedScan?.Name || 'Unknown Scan'}`;
      case 'issue-details':
        return `Issue Details - ${selectedScan?.Name || 'Unknown Scan'}`;
      default:
        return 'AppScan Triage UI';
    }
  };

  const getStats = () => {
    if (view === 'issue-list') {
      const total = issues.length;
      const filtered = filteredIssues.length;
      if (total !== filtered) {
        return `(${filtered}/${total} issues)`;
      }
      return `(${total} issues)`;
    }
    return '';
  };

  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={1}>
      <Box flexGrow={1}>
        <Text bold color="cyan">
          🔍 AppScan Triage UI
        </Text>
        <Text> - </Text>
        <Text bold>{getTitle()}</Text>
        {getStats() && (
          <>
            <Text> </Text>
            <Text color="gray">{getStats()}</Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Toolbar;
