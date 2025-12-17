/**
 * CommandBar Component
 * Bottom status bar showing hints, active filters, and keyboard shortcuts
 */

import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';
import { useCommandBarHints } from '../hooks/useKeyboardShortcuts.js';
import { getPackageInfo } from '../../utils/package-info.js';

const packageInfo = getPackageInfo();

export const CommandBar = () => {
  const view = useStore((state) => state.view);
  const sortBy = useStore((state) => state.sortBy);

  // Get auto-generated hints for current view
  const hints = useCommandBarHints(view);

  // Format sort display
  const getSortLabel = () => {
    switch (sortBy) {
      case 'severity':
        return 'Severity';
      case 'name':
        return 'Name';
      case 'status':
        return 'Status';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
    >
      {/* Show sort indicator in issue-list view */}
      {view === 'issue-list' && (
        <Box>
          <Text color="cyan">📊 Sort: </Text>
          <Text color="yellow" bold>
            {getSortLabel()}
          </Text>
          <Text dimColor> (o: cycle)</Text>
        </Box>
      )}
      <Box justifyContent="space-between">
        <Text dimColor>{hints || 'Loading...'}</Text>
        <Text dimColor>
          Author: Pascal Havelange | {packageInfo.name} v
          {packageInfo.version} |{' '}
          <Link url="https://opensource.org/licenses/MIT">MIT License</Link>
        </Text>
      </Box>
    </Box>
  );
};

export default CommandBar;
