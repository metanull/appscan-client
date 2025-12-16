/**
 * IssueDetailsModal
 * Modal showing full issue details and article content
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

export const IssueDetailsModal = React.memo(({ 
  issue, 
  articleContent,
  onClose 
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const { height } = useTerminalSize();

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setScrollOffset(prev => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setScrollOffset(prev => prev + 1);
      return;
    }

    if (key.pageUp) {
      setScrollOffset(prev => Math.max(0, prev - 10));
      return;
    }

    if (key.pageDown) {
      setScrollOffset(prev => prev + 10);
      return;
    }
  });

  if (!issue) {
    return null;
  }

  const visibleLines = Math.max(15, height - 10);

  // Prepare content lines
  const contentLines = [];
  
  contentLines.push(`Issue Type: ${issue.IssueType || 'N/A'}`);
  contentLines.push(`Severity: ${issue.Severity || 'N/A'}`);
  contentLines.push(`Status: ${issue.Status || 'N/A'}`);
  contentLines.push(`Location: ${issue.Location || 'N/A'}`);
  if (issue.Api) contentLines.push(`API: ${issue.Api}`);
  if (issue.ExternalId) contentLines.push(`External ID: ${issue.ExternalId}`);
  contentLines.push('');
  
  if (articleContent) {
    contentLines.push('--- Remediation Article ---');
    contentLines.push('');
    // Split article content by lines
    const articleLines = articleContent.split('\n');
    contentLines.push(...articleLines);
  }

  // Get visible slice
  const visibleContent = contentLines.slice(scrollOffset, scrollOffset + visibleLines);

  return (
    <Modal width={90} height={85}>
      <Panel title={`Issue Details - ${issue.IssueType || 'Unknown'}`} borderColor="cyan">
        <Box flexDirection="column">
          {/* Content */}
          <Box flexDirection="column" flexGrow={1}>
            {visibleContent.map((line, index) => (
              <Text key={scrollOffset + index}>{line}</Text>
            ))}
          </Box>

          {/* Controls */}
          <Box marginTop={1} borderStyle="single" borderTop paddingTop={1}>
            <Text dimColor>
              ↑/↓: Scroll | PgUp/PgDn: Page | ESC: Close | Line {scrollOffset + 1}/{contentLines.length}
            </Text>
          </Box>
        </Box>
      </Panel>
    </Modal>
  );
});

IssueDetailsModal.displayName = 'IssueDetailsModal';
