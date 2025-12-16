/**
 * LeftNav Component
 * Left navigation panel for issue list view showing context/summary
 */

import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';
import { Formatter } from '../../../src/utils/formatter.js';

export const LeftNav = () => {
  const selectedApp = useStore((state) => state.selectedApp);
  const selectedScan = useStore((state) => state.selectedScan);

  const scanType = selectedScan ? Formatter.normalizeScanType(selectedScan.Technology) : null;
  const baseUrl = 'https://cloud.appscan.com'; // This should come from config

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="blue" paddingX={1} width="20%">
      <Text bold color="blue">
        📋 Context
      </Text>
      {selectedApp && (
        <>
          <Box marginTop={1}>
            <Text dimColor>App:</Text>
            <Text> {selectedApp.Name}</Text>
          </Box>
          <Box>
            <Text dimColor>ID:</Text>
            <Text color="gray"> {selectedApp.Id}</Text>
          </Box>
        </>
      )}
      {selectedScan && (
        <>
          <Box marginTop={1}>
            <Text dimColor>Scan:</Text>
            <Text> {selectedScan.Name}</Text>
          </Box>
          <Box>
            <Text dimColor>ID:</Text>
            <Text color="gray"> {selectedScan.Id}</Text>
          </Box>
          {scanType && (
            <Box marginTop={1}>
              <Text dimColor>Type:</Text>
              <Text color="cyan"> {scanType}</Text>
            </Box>
          )}
          <Box marginTop={1}>
            <Text dimColor>🔗 URL:</Text>
          </Box>
          <Box marginLeft={1}>
            <Text color="blue" underline>
              {baseUrl}/main/myapps/{selectedApp.Id}/scans/{selectedScan.Id}
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
};

export default LeftNav;
