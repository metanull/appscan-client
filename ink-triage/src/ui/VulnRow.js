/**
 * VulnRow Component
 * Single vulnerability row in the list
 */

import React from 'react';
import { Box, Text } from 'ink';
import { getSeverityBadge, getStatusBadge } from '../utils/issue-utils.js';

export const VulnRow = ({ issue, isSelected: _isSelected, isCursor, isMultiSelected }) => {
  const severity = issue.Severity || 'Unknown';
  const status = issue.Status || 'Unknown';
  const type = issue.IssueType || 'Unknown';
  const location = issue.Location || issue.Api || issue.SourceFile || 'N/A';
  const jiraKey = issue.ExternalId || '';

  const getSeverityColor = () => {
    switch (severity) {
      case 'Critical':
        return 'redBright';
      case 'High':
        return 'red';
      case 'Medium':
        return 'yellow';
      case 'Low':
        return 'blue';
      case 'Informational':
        return 'gray';
      default:
        return 'white';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'Open':
        return 'red';
      case 'InProgress':
        return 'yellow';
      case 'Reopened':
        return 'yellow';
      case 'Noise':
        return 'gray';
      case 'Passed':
        return 'green';
      case 'Fixed':
        return 'green';
      default:
        return 'white';
    }
  };

  // Truncate long text
  const truncate = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <Box>
      <Text color={isCursor ? 'cyan' : 'white'} bold={isCursor}>
        {isCursor ? '> ' : '  '}
        {isMultiSelected ? '[✓] ' : '[ ] '}
      </Text>
      <Text color={getSeverityColor()} bold>
        {getSeverityBadge(severity)}
      </Text>
      <Text> </Text>
      <Text color={getStatusColor()}>{getStatusBadge(status)}</Text>
      <Text> </Text>
      <Text color={isCursor ? 'cyan' : 'white'} bold={isCursor}>
        {truncate(type, 30)}
      </Text>
      <Text dimColor> - </Text>
      <Text dimColor>{truncate(location, 40)}</Text>
      {jiraKey && (
        <>
          <Text> </Text>
          <Text color="green">[{jiraKey}]</Text>
        </>
      )}
    </Box>
  );
};

export default VulnRow;
