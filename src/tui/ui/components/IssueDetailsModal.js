/**
 * IssueDetailsModal
 * Modal showing full issue details and article content
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Link from 'ink-link';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import { MarkdownBox } from './MarkdownBox.js';
import { Formatter } from '../../../utils/formatter.js';

export const IssueDetailsModal = React.memo(
  ({ issue, app, articleContent, appScanService, _config, onClose }) => {
    const [focusedArticleUrl, setFocusedArticleUrl] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [viewMode, setViewMode] = useState('article'); // 'comments' | 'article'

    // Fetch focused article URL
    useEffect(() => {
      if (issue && appScanService) {
        appScanService
          .getFocusedArticleUrl(issue)
          .then((url) => setFocusedArticleUrl(url))
          .catch(() => {
            // Silently fail, URL will remain null
          });
      }
    }, [issue?.Id, appScanService]);

    // Fetch issue comments
    useEffect(() => {
      if (issue && issue.Id && appScanService) {
        setLoadingComments(true);
        appScanService
          .getIssueComments(issue.Id)
          .then((commentsList) => {
            setComments(commentsList || []);
            setLoadingComments(false);
          })
          .catch((err) => {
            console.error('Failed to load comments:', err);
            setComments([]);
            setLoadingComments(false);
          });
      }
    }, [issue?.Id, appScanService]);

    // Handle keyboard input
    useInput((input, key) => {
      if (key.escape) {
        onClose();
        return;
      }

      // Toggle between comments and article with arrow keys
      if (key.leftArrow || key.rightArrow) {
        setViewMode((prev) => (prev === 'comments' ? 'article' : 'comments'));
        return;
      }
    });

    if (!issue) {
      return null;
    }

    return (
      <Modal width={90} height={80}>
        <Panel
          title={`Issue Details - ${issue.IssueType || 'Unknown'}`}
          borderColor="cyan"
        >
          <Box flexDirection="column" height="100%">
            {/* Header section - fixed height, no growth */}
            <Box flexDirection="column" flexShrink={0}>
              <Box>
                <Box width={15}>
                  <Text bold color="cyan">
                    Issue Type:
                  </Text>
                </Box>
                <Text wrap="wrap">{issue.IssueType || 'N/A'}</Text>
              </Box>
              <Box>
                <Box width={15}>
                  <Text bold color="cyan">
                    Severity:
                  </Text>
                </Box>
                <Text
                  wrap="wrap"
                  color={
                    issue.Severity === 'High'
                      ? 'red'
                      : issue.Severity === 'Medium'
                        ? 'yellow'
                        : 'green'
                  }
                >
                  {issue.Severity || 'N/A'}
                </Text>
              </Box>
              <Box>
                <Box width={15}>
                  <Text bold color="cyan">
                    Status:
                  </Text>
                </Box>
                <Text
                  wrap="wrap"
                  color={issue.Status === 'Open' ? 'red' : 'green'}
                >
                  {issue.Status || 'N/A'}
                </Text>
              </Box>
              <Box>
                <Box width={15}>
                  <Text bold color="cyan">
                    Location:
                  </Text>
                </Box>
                <Text wrap="wrap">{issue.Location || 'N/A'}</Text>
              </Box>
              <Box>
                <Box width={15}>
                  <Text bold color="cyan">
                    App Name:
                  </Text>
                </Box>
                <Text wrap="wrap">{app?.Name || 'N/A'}</Text>
              </Box>
              <Box>
                <Box width={15}>
                  <Text bold color="cyan">
                    App ID:
                  </Text>
                </Box>
                <Text wrap="wrap">{issue.ApplicationId || 'N/A'}</Text>
              </Box>
              <Box>
                <Box width={15}>
                  <Text bold color="cyan">
                    Scan Name:
                  </Text>
                </Box>
                <Text wrap="wrap">{issue.ScanName || 'N/A'}</Text>
              </Box>
              {issue.Scanner && (
                <Box>
                  <Box width={15}>
                    <Text bold color="cyan">
                      Type of Scan:
                    </Text>
                  </Box>
                  <Text
                    wrap="wrap"
                    color={Formatter.getScanTypeColor(
                      Formatter.scannerToTechnology(issue.Scanner)
                    )}
                  >
                    {Formatter.normalizeScanType(
                      Formatter.scannerToTechnology(issue.Scanner)
                    )}
                  </Text>
                </Box>
              )}
              <Box>
                <Box width={15}>
                  <Text bold color="cyan">
                    Vuln ID:
                  </Text>
                </Box>
                <Text wrap="wrap">{issue.Id || 'N/A'}</Text>
              </Box>

              {Formatter.getIssueContext(issue) && (
                <Box flexDirection="column" marginTop={1}>
                  <Box width={15}>
                    <Text bold color="cyan">
                      Context:
                    </Text>
                  </Box>
                  <Box
                    borderStyle="single"
                    borderColor="gray"
                    paddingX={1}
                    marginTop={1}
                  >
                    <Text wrap="wrap" dimColor>
                      {Formatter.getIssueContext(issue)}
                    </Text>
                  </Box>
                </Box>
              )}

              {issue.ExternalId && (
                <Box>
                  <Box width={15}>
                    <Text bold color="cyan">
                      External ID:
                    </Text>
                  </Box>
                  <Text wrap="wrap">{issue.ExternalId}</Text>
                </Box>
              )}

              <Text> </Text>

              {/* Links */}
              {issue.SourceFileUri && (
                <Box>
                  <Link url={issue.SourceFileUri}>
                    <Text color="blue" underline wrap="wrap">
                      🔗 Azure DevOps Source
                    </Text>
                  </Link>
                </Box>
              )}

              {focusedArticleUrl && (
                <Box>
                  <Link url={focusedArticleUrl}>
                    <Text color="blue" underline wrap="wrap">
                      📚 AppScan Article
                    </Text>
                  </Link>
                </Box>
              )}

              {(issue.SourceFileUri || focusedArticleUrl) && <Text> </Text>}

              {/* View mode indicator */}
              <Box>
                <Text dimColor>
                  View:{' '}
                  <Text
                    bold
                    color={viewMode === 'comments' ? 'yellow' : 'cyan'}
                  >
                    {viewMode === 'comments' ? '💬 Comments' : '📚 Article'}
                  </Text>
                  <Text dimColor> (←/→ to switch)</Text>
                </Text>
              </Box>
              <Text> </Text>
            </Box>

            {/* Content area - grows to fill available space */}
            <Box flexDirection="column" flexGrow={1} minHeight={0}>
              {/* Comments view */}
              {viewMode === 'comments' && (
                <Box flexDirection="column" height="100%">
                  {loadingComments && <Text dimColor>Loading comments...</Text>}
                  {!loadingComments && comments.length === 0 && (
                    <Text dimColor>No comments available</Text>
                  )}
                  {!loadingComments && comments.length > 0 && (
                    <Box
                      flexDirection="column"
                      borderStyle="single"
                      borderColor="yellow"
                      paddingX={1}
                      height="100%"
                    >
                      <Text color="yellow" bold>
                        💬 Comments ({comments.length})
                      </Text>
                      <Box flexDirection="column" marginTop={1}>
                        {comments.map((comment, idx) => (
                          <Box
                            key={idx}
                            flexDirection="column"
                            marginBottom={1}
                          >
                            <Box>
                              <Text color="cyan" bold>
                                {comment.Author || 'Unknown'}
                              </Text>
                              <Text dimColor>
                                {' '}
                                -{' '}
                                {comment.CreatedAt
                                  ? new Date(comment.CreatedAt).toLocaleString()
                                  : 'No date'}
                              </Text>
                            </Box>
                            <Text wrap="wrap">
                              {comment.Comment || '(no text)'}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Article view */}
              {viewMode === 'article' && (
                <Box flexDirection="column" height="100%">
                  {articleContent && (
                    <Box
                      flexDirection="column"
                      borderStyle="single"
                      borderColor="cyan"
                      paddingX={1}
                      height="100%"
                    >
                      <Text color="cyan" bold>
                        📚 Remediation Article
                      </Text>
                      <Box marginTop={1} flexGrow={1} minHeight={0}>
                        <MarkdownBox
                          markdown={articleContent}
                          enableScrolling={true}
                        />
                      </Box>
                    </Box>
                  )}
                  {!articleContent && (
                    <Text dimColor>No article available</Text>
                  )}
                </Box>
              )}
            </Box>

            {/* Footer - fixed, no growth */}
            <Box marginTop={1} flexShrink={0}>
              <Text dimColor>ESC: Close</Text>
            </Box>
          </Box>
        </Panel>
      </Modal>
    );
  }
);

IssueDetailsModal.displayName = 'IssueDetailsModal';
