/**
 * App Selection View Component
 * Full-page view for selecting an application
 */

import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';

export const AppSelectionView = () => {
  const applications = useStore((state) => state.applications);
  const listCursor = useStore((state) => state.listCursor);

  return (
    <Box flexDirection="column" padding={1} flexGrow={1}>
      <Text bold color="blue">
        📱 Applications
      </Text>
      <Text dimColor marginBottom={1}>
        Select an application to view its scans
      </Text>
      <Box flexDirection="column">
        {applications.map((app, index) => (
          <Box key={app.Id}>
            <Text color={index === listCursor ? 'cyan' : 'white'} bold={index === listCursor}>
              {index === listCursor ? '> ' : '  '}
              {app.Name}
            </Text>
            <Text dimColor> ({app.TotalIssues || 0} issues)</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AppSelectionView;
