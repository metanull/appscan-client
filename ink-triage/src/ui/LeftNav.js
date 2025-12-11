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
  const getFilteredScans = useStore((state) => state.getFilteredScans);
  const filteredScans = view === 'scan-selection' ? getFilteredScans() : scans;
  const selectedApp = useStore((state) => state.selectedApp);
  const selectedScan = useStore((state) => state.selectedScan);
  const listCursor = useStore((state) => state.listCursor);
  const hideEmptyScans = useStore((state) => state.hideEmptyScans);
  const scanSearchText = useStore((state) => state.scanSearchText);
  const scanFilterType = useStore((state) => state.scanFilterType);

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
        <Box marginTop={1}>
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
        <Box flexDirection="column" marginTop={1}>
          {filteredScans.map((scan, index) => {
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
    const scanType = selectedScan ? Formatter.normalizeScanType(selectedScan.Technology) : null;
    const baseUrl = 'https://cloud.appscan.com'; // This should come from config
    
    return (
      <Box flexDirection="column" borderStyle="single" borderColor="blue" paddingX={1} width="20%">
        <Text bold color="blue">📋 Context</Text>
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
              <Text color="blue" underline>{baseUrl}/main/myapps/{selectedApp.Id}/scans/{selectedScan.Id}</Text>
            </Box>
          </>
        )}
      </Box>
    );
  }

  return null;
};

export default LeftNav;
