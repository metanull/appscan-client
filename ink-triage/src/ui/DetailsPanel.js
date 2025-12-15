/**
 * DetailsPanel Component
 * Right panel showing detailed issue information and remediation article
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';
import { getSeverityBadge } from '../utils/issue-utils.js';
import { convertToAbsoluteUrl } from '../../../src/utils/url-converter.js';
import { AppScanService } from '../services/appscan.js';

export const DetailsPanel = () => {
  const view = useStore((state) => state.view);
  const selectedIssue = useStore((state) => state.selectedIssue);
  const issueDetails = useStore((state) => state.issueDetails);
  const articleContent = useStore((state) => state.articleContent);
  const getFilteredIssues = useStore((state) => state.getFilteredIssues);
  const filteredIssues = getFilteredIssues();
  const listCursor = useStore((state) => state.listCursor);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Determine which issue to show
  let issue = selectedIssue || issueDetails;
  if (view === 'issue-list' && filteredIssues.length > 0) {
    issue = filteredIssues[listCursor];
  }

  // Fetch comments when issue changes
  useEffect(() => {
    let isMounted = true;

    async function fetchComments() {
      if (!issue || !issue.Id) {
        setComments([]);
        return;
      }

      setLoadingComments(true);
      try {
        const service = new AppScanService();
        const issueComments = await service.getIssueComments(issue.Id);
        if (isMounted) {
          setComments(issueComments || []);
        }
      } catch {
        if (isMounted) {
          setComments([]);
        }
      } finally {
        if (isMounted) {
          setLoadingComments(false);
        }
      }
    }

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [issue?.Id]);

  if (view !== 'issue-list' && view !== 'issue-details') {
    return null;
  }

  if (!issue) {
    return (
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="magenta"
        paddingX={1}
        width="30%"
      >
        <Text bold color="magenta">
          📖 Details
        </Text>
        <Text dimColor marginTop={1}>
          Select an issue to view details
        </Text>
      </Box>
    );
  }

  const severity = issue.Severity || 'Unknown';
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

  // Truncate long content for preview
  const truncate = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="magenta" paddingX={1} width="30%">
      <Text bold color="magenta">
        📖 Details
      </Text>

      {/* Top Half: Issue Info */}
      <Box flexDirection="column" marginTop={1} height="50%" overflow="hidden">
        <Text bold color={getSeverityColor()}>
          {getSeverityBadge(severity)} {issue.IssueType || 'Unknown'}
        </Text>

        {issue.Id && (
          <Box marginTop={1}>
            <Text dimColor>ID: </Text>
            <Text color="gray">{issue.Id}</Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text dimColor>Severity: </Text>
          <Text color={getSeverityColor()} bold>
            {severity}
          </Text>
        </Box>

        <Box>
          <Text dimColor>Status: </Text>
          <Text>{issue.Status || 'Unknown'}</Text>
        </Box>

        {issue.SourceFileUri && (
          <Box marginTop={1}>
            <Text dimColor>🔗 Source:</Text>
            <Text color="blue"> {truncate(issue.SourceFileUri, 80)}</Text>
          </Box>
        )}

        {issue.Location && (
          <>
            <Box marginTop={1}>
              <Text dimColor>Location:</Text>
              <Text> {truncate(issue.Location, 100)}</Text>
            </Box>
            {(() => {
              const absoluteUrl = convertToAbsoluteUrl(issue.Location);
              if (absoluteUrl && absoluteUrl !== issue.Location) {
                return (
                  <Box marginLeft={1}>
                    <Text dimColor>🔗 </Text>
                    <Text color="blue">{truncate(absoluteUrl, 80)}</Text>
                  </Box>
                );
              }
              return null;
            })()}
          </>
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

        {issue.Context && (
          <Box flexDirection="column" marginTop={1}>
            <Text dimColor>Code:</Text>
            <Box marginLeft={1} borderStyle="single" borderColor="gray" paddingX={1} paddingY={1}>
              <Text>{truncate(issue.Context, 150)}</Text>
            </Box>
          </Box>
        )}

        {issue.Cwe && (
          <Box marginTop={1}>
            <Text dimColor>CWE: </Text>
            <Text>{issue.Cwe}</Text>
          </Box>
        )}

        {issue.IssueTypeId && (
          <Box marginTop={1}>
            <Text dimColor>📚 Article: </Text>
            <Text color="blue">https://cloud.appscan.com/main/issuedetail/{issue.IssueTypeId}</Text>
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

      {/* Bottom Half: User Comments */}
      <Box
        flexDirection="column"
        marginTop={1}
        borderStyle="single"
        borderColor="cyan"
        paddingX={1}
        height={6}
      >
        <Text bold color="cyan">
          💬 User Comments
        </Text>
        {loadingComments && <Text dimColor>Loading...</Text>}
        {!loadingComments && comments.length === 0 && <Text dimColor>No comments</Text>}
        {!loadingComments && comments.length > 0 && (
          <Box flexDirection="column">
            {comments.map((comment, index) => (
              <Text key={comment.Id || index}>{comment.Comment}</Text>
            ))}
          </Box>
        )}
      </Box>

      {/* Article Content (only in details view) */}
      {view === 'issue-details' && articleContent && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="cyan">
            📚 Remediation Article
          </Text>
          <Box marginTop={1}>
            <Text>{truncate(articleContent, 500)}</Text>
          </Box>
          <Text dimColor marginTop={1}>
            (Scroll down for full article)
          </Text>
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
