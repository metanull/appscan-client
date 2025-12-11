/**
 * LinksPanel Component
 * Displays all clickable links in one panel for easy access
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import useStore from '../state/AppContext.js';
import { convertToAbsoluteUrl } from '../../../src/utils/url-converter.js';

export const LinksPanel = ({ onClose }) => {
  const selectedApp = useStore((state) => state.selectedApp);
  const selectedScan = useStore((state) => state.selectedScan);
  const selectedIssue = useStore((state) => state.selectedIssue);
  const filteredIssues = useStore((state) => state.getFilteredIssues)();
  const listCursor = useStore((state) => state.listCursor);
  
  // Get current issue (selected or highlighted)
  const currentIssue = selectedIssue || (filteredIssues.length > 0 ? filteredIssues[listCursor] : null);
  
  const baseUrl = 'https://cloud.appscan.com';
  const jiraHost = process.env.JIRA_HOST || null;
  
  useInput((input, key) => {
    if (key.escape || input === 'l' || input === 'b') {
      onClose();
    }
  });

  const links = [];

  // App URL
  if (selectedApp) {
    links.push({
      label: 'AppScan Application',
      url: `${baseUrl}/main/myapps/${selectedApp.Id}`
    });
  }

  // Scan URL
  if (selectedApp && selectedScan) {
    links.push({
      label: 'AppScan Scan',
      url: `${baseUrl}/main/myapps/${selectedApp.Id}/scans/${selectedScan.Id}`
    });
  }

  // Issue URLs
  if (currentIssue) {
    // Article URL
    if (currentIssue.IssueTypeId) {
      links.push({
        label: 'Issue Documentation (Article)',
        url: `${baseUrl}/main/issuedetail/${currentIssue.IssueTypeId}`
      });
    }

    // Azure DevOps URL
    if (currentIssue.Location) {
      const azureUrl = convertToAbsoluteUrl(currentIssue.Location);
      if (azureUrl && azureUrl !== currentIssue.Location) {
        links.push({
          label: 'Azure DevOps Source File',
          url: azureUrl
        });
      }
    }

    // JIRA URL
    if (currentIssue.ExternalId) {
      if (jiraHost) {
        links.push({
          label: 'JIRA Issue',
          url: `${jiraHost}/browse/${currentIssue.ExternalId}`
        });
      } else {
        links.push({
          label: 'JIRA Issue',
          url: `${currentIssue.ExternalId} (configure JIRA_HOST for full URL)`
        });
      }
    }
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      width="80%"
      marginX="auto"
    >
      <Text bold color="cyan">🔗 Links Panel</Text>

      {links.length === 0 ? (
        <Box marginTop={1}>
          <Text dimColor>No links available in current context</Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          {links.map((link, index) => (
            <Box key={index} flexDirection="column" marginTop={1}>
              <Text bold color="yellow">{link.label}:</Text>
              <Box marginLeft={2} borderStyle="single" borderColor="blue" paddingX={1}>
                <Text color="blue">{link.url}</Text>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={2}>
        <Text dimColor>Press ESC or 'l' to close | Select and copy URLs from terminal</Text>
      </Box>
    </Box>
  );
};

export default LinksPanel;
