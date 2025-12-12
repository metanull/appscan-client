/**
 * VulnList Component
 * Vulnerability list with virtual scrolling
 */

import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';
import VulnRow from './VulnRow.js';
import { calculateStats, groupIssuesBy } from '../utils/issue-utils.js';

export const VulnList = () => {
  const getFilteredIssues = useStore((state) => state.getFilteredIssues);
  const filteredIssues = getFilteredIssues();
  const selectedIssueIds = useStore((state) => state.selectedIssueIds);
  const listCursor = useStore((state) => state.listCursor);
  const view = useStore((state) => state.view);

  if (view !== 'issue-list') {
    return null;
  }

  // Calculate statistics
  const stats = useMemo(() => calculateStats(filteredIssues), [filteredIssues]);

  // Group issues for summary
  const groups = useMemo(() => groupIssuesBy(filteredIssues, 'IssueType'), [filteredIssues]);

  // Virtual scrolling - show only visible items
  const visibleCount = 25;
  const startIndex = Math.max(0, listCursor - Math.floor(visibleCount / 2));
  const endIndex = Math.min(filteredIssues.length, startIndex + visibleCount);
  const visibleIssues = filteredIssues.slice(startIndex, endIndex);

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="green" paddingX={1} flexGrow={1}>
      <Box flexDirection="column">
        <Text bold color="green">🔍 Vulnerabilities</Text>

        {/* Summary Stats */}
        <Box marginTop={1}>
          <Text dimColor>Total: {stats.total}</Text>
          {stats.Critical > 0 && <Text> | </Text>}
          {stats.Critical > 0 && <Text color="redBright">Critical: {stats.Critical}</Text>}
          {stats.High > 0 && <Text> | </Text>}
          {stats.High > 0 && <Text color="red">High: {stats.High}</Text>}
          {stats.Medium > 0 && <Text> | </Text>}
          {stats.Medium > 0 && <Text color="yellow">Medium: {stats.Medium}</Text>}
          {stats.Low > 0 && <Text> | </Text>}
          {stats.Low > 0 && <Text color="blue">Low: {stats.Low}</Text>}
        </Box>

        {/* Status Summary */}
        <Box marginTop={1}>
          <Text dimColor>Status: </Text>
          {Object.entries(stats.byStatus).map(([status, count], idx) => (
            <React.Fragment key={status}>
              {idx > 0 && <Text dimColor> | </Text>}
              <Text>{status}: {count}</Text>
            </React.Fragment>
          ))}
        </Box>

        {/* Grouped Summary */}
        <Box marginTop={1} flexDirection="column">
          <Text bold color="cyan">📊 Groups by Type:</Text>
          {groups.slice(0, 5).map((group, index) => (
            <Box key={index}>
              <Text dimColor>{index + 1}. </Text>
              <Text>{group.name}</Text>
              <Text dimColor> ({group.issues.length})</Text>
            </Box>
          ))}
          {groups.length > 5 && (
            <Text dimColor>... and {groups.length - 5} more</Text>
          )}
        </Box>
      </Box>

      {/* Issue List */}
      <Box flexDirection="column" marginTop={1}>
        <Text bold>Issues:</Text>
        {filteredIssues.length === 0 ? (
          <Text dimColor>No issues found</Text>
        ) : (
          <>
            {visibleIssues.map((issue, index) => {
              const actualIndex = startIndex + index;
              return (
                <VulnRow
                  key={issue.Id}
                  issue={issue}
                  isCursor={actualIndex === listCursor}
                  isMultiSelected={selectedIssueIds.includes(issue.Id)}
                />
              );
            })}
            {startIndex > 0 && <Text dimColor>... {startIndex} more above</Text>}
            {endIndex < filteredIssues.length && (
              <Text dimColor>... {filteredIssues.length - endIndex} more below</Text>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default VulnList;
