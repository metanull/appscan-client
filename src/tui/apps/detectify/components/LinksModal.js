/**
 * LinksModal for Detectify Vulnerabilities
 * Displays clickable hyperlinks for Detectify vulnerabilities
 * Following the same pattern as AZDO LinksModal
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import Link from 'ink-link';
import open from 'open';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';
import { truncate } from '../utils/vulnerability.js';

/**
 * Modal dialog displaying related links for a Detectify vulnerability
 * Includes Detectify URLs, references, and Jira if linked
 *
 * @param {Object} props
 * @param {Object} props.vulnerability - Vulnerability object with link information
 * @param {Object} props.config - Configuration for URL generation
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const LinksModal = React.memo(({ vulnerability, _config, onClose }) => {
  const [cursor, setCursor] = useState(0);

  if (!vulnerability) {
    return null;
  }

  // Generate links
  const links = [];

  // Detectify Details Page (primary - in first position)
  if (vulnerability.links?.details_page) {
    links.push({
      label: '🔗 Detectify Details Page',
      url: vulnerability.links.details_page,
      description: 'Open the vulnerability details in Detectify web interface',
    });
  }

  // Location URL
  if (vulnerability.location && vulnerability.location.startsWith('http')) {
    links.push({
      label: '🌐 Vulnerability Location',
      url: vulnerability.location,
      description: `Location: ${vulnerability.host}`,
    });
  }

  // Host URL (construct if not available)
  if (vulnerability.host) {
    const hostUrl = vulnerability.host.startsWith('http')
      ? vulnerability.host
      : `https://${vulnerability.host}`;
    links.push({
      label: '🖥️ Target Host',
      url: hostUrl,
      description: `Host: ${vulnerability.host}`,
    });
  }

  // References
  const references = vulnerability.references || [];
  references.slice(0, 5).forEach((ref, idx) => {
    if (ref.link) {
      links.push({
        label: `📚 Reference: ${ref.name || `Reference ${idx + 1}`}`,
        url: ref.link,
        description: ref.name || 'Reference documentation',
      });
    }
  });

  // Jira link if available (from external tracking)
  // Note: Detectify doesn't store Jira metadata internally, so this would come from external tracking
  // For now, we'll check if config has any Jira URL pattern

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setCursor((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setCursor((prev) => Math.min(links.length - 1, prev + 1));
      return;
    }

    if (key.return || input === 'o') {
      if (links[cursor]?.url) {
        open(links[cursor].url);
      }
      return;
    }

    // Number shortcuts to open links directly
    const num = parseInt(input, 10);
    if (num >= 1 && num <= Math.min(9, links.length)) {
      if (links[num - 1]?.url) {
        open(links[num - 1].url);
      }
    }
  });

  return (
    <Modal width={80} height={70}>
      <Panel title="🔗 Related Links" borderColor="blue">
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold color="cyan">
              {vulnerability.title || 'Unknown'}
            </Text>
          </Box>
          <Box marginBottom={1}>
            <Text dimColor>Host: {vulnerability.host || 'N/A'}</Text>
          </Box>

          {links.length === 0 ? (
            <Text dimColor>No links available for this vulnerability</Text>
          ) : (
            <Box flexDirection="column">
              {links.map((link, index) => (
                <Box
                  key={index}
                  marginBottom={1}
                  flexDirection="column"
                  borderStyle={cursor === index ? 'single' : undefined}
                  borderColor={cursor === index ? 'cyan' : undefined}
                  paddingX={cursor === index ? 1 : 0}
                >
                  <Box>
                    <Text color={cursor === index ? 'cyan' : 'white'}>
                      {cursor === index ? '▶ ' : '  '}
                      <Text bold>{index + 1}. </Text>
                      {link.label}
                    </Text>
                  </Box>
                  <Box marginLeft={4}>
                    <Link url={link.url}>
                      <Text color="blue">{truncate(link.url, 65)}</Text>
                    </Link>
                  </Box>
                  {link.description && (
                    <Box marginLeft={4}>
                      <Text dimColor>{truncate(link.description, 65)}</Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          <Box
            marginTop={2}
            borderStyle="single"
            borderColor="gray"
            paddingX={1}
          >
            <Text dimColor>
              ↑↓: Navigate | Enter/o: Open in browser | 1-9: Quick open | Esc:
              Close
            </Text>
          </Box>
        </Box>
      </Panel>
    </Modal>
  );
});

LinksModal.displayName = 'LinksModal';

export default LinksModal;
