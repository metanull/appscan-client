/**
 * LinksModal
 * Displays clickable hyperlinks using ink-link
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import Link from 'ink-link';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';

export const LinksModal = React.memo(({ 
  issue,
  config,
  onClose 
}) => {
  const [cursor, setCursor] = useState(0);

  if (!issue) {
    return null;
  }

  // Generate links
  const links = [];
  
  // AppScan issue link
  if (config?.asocApiUrl && issue.Id) {
    const baseUrl = config.asocApiUrl.replace('/api/v4', '');
    links.push({
      label: 'Open in AppScan',
      url: `${baseUrl}/issues/${issue.Id}`,
    });
  }

  // Jira link if available
  if (issue.ExternalId && config?.jiraUrl) {
    links.push({
      label: `Open Jira Issue (${issue.ExternalId})`,
      url: `${config.jiraUrl}/browse/${issue.ExternalId}`,
    });
  }

  // CVE link if available
  if (issue.CveId) {
    links.push({
      label: `CVE Details (${issue.CveId})`,
      url: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${issue.CveId}`,
    });
  }

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setCursor(prev => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setCursor(prev => Math.min(links.length - 1, prev + 1));
      return;
    }
  });

  if (links.length === 0) {
    return (
      <Modal width={60} height={30}>
        <Panel title="Links" borderColor="cyan">
          <Box flexDirection="column">
            <Text dimColor>No links available for this issue</Text>
            <Box marginTop={1}>
              <Text dimColor>Press ESC to close</Text>
            </Box>
          </Box>
        </Panel>
      </Modal>
    );
  }

  return (
    <Modal width={70} height={50}>
      <Panel title="Links" borderColor="cyan">
        <Box flexDirection="column">
          <Text dimColor>Click a link to open in browser:</Text>
          
          <Box flexDirection="column" marginTop={1}>
            {links.map((link, index) => (
              <Box key={index} marginY={0}>
                <Text color={cursor === index ? 'cyan' : undefined} bold={cursor === index}>
                  {cursor === index ? '▶ ' : '  '}
                </Text>
                <Link url={link.url}>
                  <Text color={cursor === index ? 'cyan' : 'blue'} underline>
                    {link.label}
                  </Text>
                </Link>
              </Box>
            ))}
          </Box>

          <Box marginTop={2}>
            <Text dimColor>↑/↓: Navigate | ESC: Close</Text>
          </Box>
        </Box>
      </Panel>
    </Modal>
  );
});

LinksModal.displayName = 'LinksModal';
