/**
 * IssueDetailsView Component
 * Full-screen view showing detailed issue information with article
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';
import { getSeverityBadge } from '../utils/issue-utils.js';
import { AppScanService } from '../services/appscan.js';

export const IssueDetailsView = () => {
  const selectedIssue = useStore((state) => state.selectedIssue);
  const articleContent = useStore((state) => state.articleContent);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const issue = selectedIssue;

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

  if (!issue) {
    return (
      <Box flexDirection="column" padding={1} flexGrow={1}>
        <Text dimColor>No issue selected</Text>
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

  return (
    <Box
      flexDirection="column"
      padding={1}
      flexGrow={1}
      borderStyle="single"
      borderColor="magenta"
    >
      {/* Header */}
      <Box flexDirection="column">
        <Text bold color={getSeverityColor()}>
          {getSeverityBadge(severity)} {issue.IssueType || 'Unknown Issue'}
        </Text>
        <Box marginTop={1}>
          <Text dimColor>ID: </Text>
          <Text color="gray">{issue.Id}</Text>
          <Text dimColor> | Severity: </Text>
          <Text color={getSeverityColor()} bold>
            {severity}
          </Text>
          <Text dimColor> | Status: </Text>
          <Text>{issue.Status || 'Unknown'}</Text>
        </Box>
      </Box>

      {/* Details Section */}
      <Box
        flexDirection="column"
        marginTop={1}
        borderStyle="single"
        paddingX={1}
      >
        <Text bold color="cyan">
          📍 Location Details
        </Text>

        {/* Show absolute SourceFileUri first if available */}
        {issue.SourceFileUri && (
          <Box marginTop={1}>
            <Text dimColor>🔗 Source: </Text>
            <Text color="blue">{issue.SourceFileUri}</Text>
          </Box>
        )}

        {issue.Location && (
          <Box marginTop={1}>
            <Text dimColor>File: </Text>
            <Text>{issue.Location}</Text>
          </Box>
        )}

        {issue.Api && (
          <Box marginTop={1}>
            <Text dimColor>API: </Text>
            <Text>{issue.Api}</Text>
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
            <Text dimColor>Code Context:</Text>
            <Box
              marginLeft={1}
              borderStyle="single"
              borderColor="gray"
              paddingX={1}
            >
              <Text>{issue.Context}</Text>
            </Box>
          </Box>
        )}
      </Box>

      {/* Metadata */}
      <Box
        flexDirection="column"
        marginTop={1}
        borderStyle="single"
        paddingX={1}
      >
        <Text bold color="cyan">
          📋 Metadata
        </Text>

        {issue.Cwe && (
          <Box marginTop={1}>
            <Text dimColor>CWE: </Text>
            <Text>{issue.Cwe}</Text>
          </Box>
        )}

        {issue.IssueTypeId && (
          <Box>
            <Text dimColor>📚 Article: </Text>
            <Text color="blue">
              https://cloud.appscan.com/main/issuedetail/{issue.IssueTypeId}
            </Text>
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

      {/* User Comments Section */}
      <Box
        flexDirection="column"
        marginTop={1}
        borderStyle="single"
        paddingX={1}
      >
        <Text bold color="cyan">
          💬 User Comments
        </Text>

        {loadingComments && (
          <Text dimColor marginTop={1}>
            Loading comments...
          </Text>
        )}

        {!loadingComments && comments.length === 0 && (
          <Text dimColor marginTop={1}>
            No comments for this issue.
          </Text>
        )}

        {!loadingComments && comments.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            {comments.map((comment, index) => (
              <Box
                key={comment.Id || index}
                flexDirection="column"
                marginBottom={1}
                borderStyle="single"
                borderColor="gray"
                paddingX={1}
              >
                <Box>
                  <Text dimColor>Date: </Text>
                  <Text>{new Date(comment.CreatedAt).toLocaleString()}</Text>
                </Box>
                <Box>
                  <Text dimColor>Author: </Text>
                  <Text bold>{comment.Author || 'Unknown'}</Text>
                </Box>
                {comment.ModifiedAt &&
                  comment.ModifiedAt !== comment.CreatedAt && (
                    <Box>
                      <Text dimColor>Modified: </Text>
                      <Text>
                        {new Date(comment.ModifiedAt).toLocaleString()}
                      </Text>
                    </Box>
                  )}
                <Box marginTop={1}>
                  <Text>{comment.Comment}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Remediation Article */}
      {articleContent && (
        <Box
          flexDirection="column"
          marginTop={1}
          borderStyle="single"
          paddingX={1}
          flexGrow={1}
        >
          <Text bold color="cyan">
            📚 Remediation Article
          </Text>
          <Box marginTop={1} flexDirection="column">
            <Text>{articleContent}</Text>
          </Box>
        </Box>
      )}

      {!articleContent && (
        <Box marginTop={1}>
          <Text dimColor>Loading article...</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press 'b' or Backspace to return to issue list</Text>
      </Box>
    </Box>
  );
};

export default IssueDetailsView;
