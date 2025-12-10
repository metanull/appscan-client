/**
 * LeftNav Component
 * Left navigation panel showing applications and scans
 */

import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';
import { Formatter } from '../../../src/utils/formatter.js';

export const LeftNav = () => {
  const view = useStore((state) => state.view);
  const applications = useStore((state) => state.applications);
  const scans = useStore((state) => state.scans);
  const selectedApp = useStore((state) => state.selectedApp);
  const selectedScan = useStore((state) => state.selectedScan);
  const listCursor = useStore((state) => state.listCursor);

  if (view === 'app-selection') {
    return (
      <Box flexDirection="column" borderStyle="single" borderColor="blue" paddingX={1} width="25%">
        <Text bold color="blue">📱 Applications</Text>
        <Box flexDirection="column" marginTop={1}>
          {applications.map((app, index) => (
            <Box key={app.Id}>
              <Text color={index === listCursor ? 'cyan' : 'white'} bold={index === listCursor}>
                {index === listCursor ? '> ' : '  '}
                {app.Name}
              </Text>
              <Text dimColor> ({app.TotalIssues || 0})</Text>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (view === 'scan-selection') {
    return (
      <Box flexDirection="column" borderStyle="single" borderColor="blue" paddingX={1} width="25%">
        <Text bold color="blue">📊 Scans</Text>
        {selectedApp && (
          <Text dimColor>App: {selectedApp.Name}</Text>
        )}
        <Box flexDirection="column" marginTop={1}>
          {scans.map((scan, index) => {
            const scanType = Formatter.normalizeScanType(scan.Technology);
            const issueCount = scan.LatestExecution?.NIssuesFound || 0;
            const highCount = scan.LatestExecution?.NHighIssues || 0;
            
            return (
              <Box key={scan.Id} flexDirection="column">
                <Box>
                  <Text color={index === listCursor ? 'cyan' : 'white'} bold={index === listCursor}>
                    {index === listCursor ? '> ' : '  '}
                    {scan.Name}
                  </Text>
                </Box>
                <Box marginLeft={2}>
                  <Text dimColor>
                    [{scanType}] {issueCount} issues
                    {highCount > 0 && ` (${highCount} High)`}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  // For issue-list and issue-details, show summary
  if (view === 'issue-list' || view === 'issue-details') {
    return (
      <Box flexDirection="column" borderStyle="single" borderColor="blue" paddingX={1} width="20%">
        <Text bold color="blue">📋 Context</Text>
        {selectedApp && (
          <Box marginTop={1}>
            <Text dimColor>App:</Text>
            <Text> {selectedApp.Name}</Text>
          </Box>
        )}
        {selectedScan && (
          <Box marginTop={1}>
            <Text dimColor>Scan:</Text>
            <Text> {selectedScan.Name}</Text>
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default LeftNav;
