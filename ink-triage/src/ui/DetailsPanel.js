/**
 * DetailsPanel Component
 * Right panel showing detailed issue information and remediation article
 */

import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';
import { getSeverityBadge } from '../utils/issue-utils.js';

export const DetailsPanel = () => {
  const view = useStore((state) => state.view);
  const selectedIssue = useStore((state) => state.selectedIssue);
  const issueDetails = useStore((state) => state.issueDetails);
  const articleContent = useStore((state) => state.articleContent);
  const filteredIssues = useStore((state) => state.getFilteredIssues());
  const listCursor = useStore((state) => state.listCursor);

  if (view !== 'issue-list' && view !== 'issue-details') {
    return null;
  }

  // In issue-list view, show preview of current cursor item
  let issue = selectedIssue || issueDetails;
  if (view === 'issue-list' && filteredIssues.length > 0) {
    issue = filteredIssues[listCursor];
  }

  if (!issue) {
    return (
      <Box flexDirection="column" borderStyle="single" borderColor="magenta" paddingX={1} width="30%">
        <Text bold color="magenta">📖 Details</Text>
        <Text dimColor marginTop={1}>Select an issue to view details</Text>
      </Box>
    );
  }

  const severity = issue.Severity || 'Unknown';
  const getSeverityColor = () => {
    switch (severity) {
      case 'Critical': return 'redBright';
      case 'High': return 'red';
      case 'Medium': return 'yellow';
      case 'Low': return 'blue';
      case 'Informational': return 'gray';
      default: return 'white';
    }
  };

  // Truncate long content for preview
  const truncate = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="magenta" paddingX={1} width="30%">
      <Text bold color="magenta">📖 Details</Text>

      {/* Issue Info */}
      <Box flexDirection="column" marginTop={1}>
        <Text bold color={getSeverityColor()}>
          {getSeverityBadge(severity)} {issue.IssueType || 'Unknown'}
        </Text>

        <Box marginTop={1}>
          <Text dimColor>Severity: </Text>
          <Text color={getSeverityColor()} bold>{severity}</Text>
        </Box>

        <Box>
          <Text dimColor>Status: </Text>
          <Text>{issue.Status || 'Unknown'}</Text>
        </Box>

        {issue.Location && (
          <Box marginTop={1}>
            <Text dimColor>Location:</Text>
            <Text> {truncate(issue.Location, 100)}</Text>
          </Box>
        )}

        {issue.Api && (
          <Box marginTop={1}>
            <Text dimColor>API:</Text>
            <Text> {truncate(issue.Api, 100)}</Text>
          </Box>
        )}

        {issue.SourceFile && (
          <Box marginTop={1}>
            <Text dimColor>File:</Text>
            <Text> {truncate(issue.SourceFile, 80)}</Text>
          </Box>
        )}

        {issue.Line && (
          <Box>
            <Text dimColor>Line: </Text>
            <Text>{issue.Line}</Text>
          </Box>
        )}

        {issue.Cwe && (
          <Box marginTop={1}>
            <Text dimColor>CWE: </Text>
            <Text>{issue.Cwe}</Text>
          </Box>
        )}

        {issue.ExternalId && (
          <Box marginTop={1}>
            <Text dimColor>Jira: </Text>
            <Text color="green">{issue.ExternalId}</Text>
          </Box>
        )}

        {issue.DateCreated && (
          <Box marginTop={1}>
            <Text dimColor>Created: </Text>
            <Text>{new Date(issue.DateCreated).toLocaleDateString()}</Text>
          </Box>
        )}

        {issue.LastUpdated && (
          <Box>
            <Text dimColor>Updated: </Text>
            <Text>{new Date(issue.LastUpdated).toLocaleDateString()}</Text>
          </Box>
        )}
      </Box>

      {/* Article Content (only in details view) */}
      {view === 'issue-details' && articleContent && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="cyan">📚 Remediation Article</Text>
          <Box marginTop={1}>
            <Text>{truncate(articleContent, 500)}</Text>
          </Box>
          <Text dimColor marginTop={1}>(Scroll down for full article)</Text>
        </Box>
      )}

      {view === 'issue-list' && (
        <Box marginTop={1}>
          <Text dimColor>Press Enter to view full details with article</Text>
        </Box>
      )}
    </Box>
  );
};

export default DetailsPanel;
