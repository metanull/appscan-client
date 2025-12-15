/**
 * Scan Selection View Component
 * Full-page view for selecting a scan
 */

import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';
import { Formatter } from '../../../src/utils/formatter.js';

export const ScanSelectionView = () => {
  const selectedApp = useStore((state) => state.selectedApp);
  const scans = useStore((state) => state.scans);
  const getFilteredScans = useStore((state) => state.getFilteredScans);
  const filteredScans = getFilteredScans();
  const listCursor = useStore((state) => state.listCursor);
  const hideEmptyScans = useStore((state) => state.hideEmptyScans);
  const scanSearchText = useStore((state) => state.scanSearchText);
  const scanFilterType = useStore((state) => state.scanFilterType);

  return (
    <Box flexDirection="column" padding={1} flexGrow={1}>
      <Text bold color="blue">
        📊 Scans
      </Text>
      {selectedApp && (
        <Text dimColor>
          Application: {selectedApp.Name}
        </Text>
      )}
      <Box marginBottom={1}>
        <Text dimColor>
          {filteredScans.length}/{scans.length} scans
          {hideEmptyScans && ' (hiding empty)'}
        </Text>
        {(scanSearchText || scanFilterType) && (
          <Text color="yellow">
            {scanSearchText && ` /${scanSearchText}/`}
            {scanFilterType && ` [${scanFilterType}]`}
          </Text>
        )}
      </Box>
      <Box flexDirection="column">
        {filteredScans.map((scan, index) => {
          const scanType = Formatter.normalizeScanType(scan.Technology);
          const issueCount = scan.LatestExecution?.NIssuesFound || 0;
          const highCount = scan.LatestExecution?.NHighIssues || 0;

          return (
            <Box key={scan.Id}>
              <Text color={index === listCursor ? 'cyan' : 'white'} bold={index === listCursor}>
                {index === listCursor ? '> ' : '  '}
                {scan.Name}
              </Text>
              <Text dimColor>
                {' '}([{scanType}] {issueCount} issues
                {highCount > 0 && `, ${highCount} High`})
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ScanSelectionView;
