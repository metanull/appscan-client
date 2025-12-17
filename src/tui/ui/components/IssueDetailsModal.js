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

export const IssueDetailsModal = React.memo(
  ({ issue, articleContent, appScanService, _config, onClose }) => {
    const [focusedArticleUrl, setFocusedArticleUrl] = useState(null);

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

    // Handle keyboard input
    useInput((input, key) => {
      if (key.escape) {
        onClose();
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
            {/* Header section */}
            <Box flexDirection="column">
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
            </Box>

            {/* Article content */}
            {articleContent && (
              <Box
                flexDirection="column"
                marginTop={1}
                borderStyle="single"
                borderColor="cyan"
                paddingX={1}
                flexGrow={1}
                minHeight={0}
              >
                <Text color="cyan" bold>
                  Remediation Article
                </Text>
                <Box marginTop={1} flexGrow={1} minHeight={0}>
                  <MarkdownBox
                    markdown={articleContent}
                    enableScrolling={true}
                  />
                </Box>
              </Box>
            )}

            {/* Controls */}
            <Box marginTop={1} paddingTop={1}>
              <Text dimColor>ESC: Close</Text>
            </Box>
          </Box>
        </Panel>
      </Modal>
    );
  }
);

IssueDetailsModal.displayName = 'IssueDetailsModal';
