/**
 * HelpPanel Component
 * Modal overlay showing keyboard shortcuts and help
 */

import React from 'react';
import { Box, Text } from 'ink';

export const HelpPanel = ({ onClose: _onClose }) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      width="60%"
      marginX="auto"
    >
      <Text bold color="cyan">
        ⌨️ Keyboard Shortcuts
      </Text>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Navigation:</Text>
        <Text> ↑/k - Move up</Text>
        <Text> ↓/j - Move down</Text>
        <Text> Enter - Select / View details</Text>
        <Text> Backspace/b - Go back</Text>
        <Text> q - Quit</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Scan Selection:</Text>
        <Text> / - Search by name</Text>
        <Text> t - Filter by type (SAST/DAST/SCA/IAST)</Text>
        <Text> h - Toggle hide empty scans</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Issue Actions:</Text>
        <Text> Space - Toggle selection</Text>
        <Text> Ctrl+A - Select all</Text>
        <Text> u - Update status (single/bulk)</Text>
        <Text> c - Create Jira issue</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Issue Filtering:</Text>
        <Text> f - Filter menu</Text>
        <Text> / - Search</Text>
        <Text> 1-9 - Quick filter by group number</Text>
        <Text> s - Sort (cycle: severity/name/status)</Text>
        <Text> DEL - Clear all filters</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Other:</Text>
        <Text> r - Refresh</Text>
        <Text> l - Show all links (URLs)</Text>
        <Text> S - Setup wizard (reconfigure)</Text>
        <Text> ? - Toggle this help</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Press any key to close</Text>
      </Box>
    </Box>
  );
};

export default HelpPanel;
