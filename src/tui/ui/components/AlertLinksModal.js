/**
 * LinksModal for Azure DevOps Alerts
 * Displays clickable hyperlinks for AzDO alerts
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import Link from 'ink-link';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import { parseAlertMetadata } from '../../utils/azdo-issue-utils.js';

/**
 * Modal dialog displaying related links for an Azure DevOps alert
 * Includes Azure DevOps alert URLs, repository links, and Jira if linked
 *
 * @param {Object} props
 * @param {Object} props.alert - Alert object with link information
 * @param {Object} props.project - Project object
 * @param {Object} props.repository - Repository object
 * @param {Object} props.config - Configuration for URL generation
 * @param {Object} props.azdoService - Service for URL generation
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const AlertLinksModal = React.memo(
  ({ alert, project, repository, config, azdoService, onClose }) => {
    const [cursor, setCursor] = useState(0);

    if (!alert) {
      return null;
    }

    // Parse metadata to get Jira ID if present
    const metadata = parseAlertMetadata(alert);

    // Generate links
    const links = [];

    // Azure DevOps Alert link (primary)
    if (alert.url) {
      links.push({
        label: '🔗 View Alert in Azure DevOps',
        url: alert.url,
        description: 'Open the alert details in Azure DevOps web interface',
      });
    }

    // Repository link
    if (repository && project) {
      const orgUrl =
        azdoService?.getBaseUrl() ||
        config?.getAzureDevOpsBaseUrl?.() ||
        'https://dev.azure.com';
      const repoUrl = `${orgUrl}/${encodeURIComponent(project.name)}/_git/${repository.id}`;
      links.push({
        label: '📁 View Repository',
        url: repoUrl,
        description: `Repository: ${repository.name}`,
      });
    }

    // File location link (if available)
    if (alert.physicalLocation?.filePath && repository && project) {
      const orgUrl =
        azdoService?.getBaseUrl() ||
        config?.getAzureDevOpsBaseUrl?.() ||
        'https://dev.azure.com';
      const filePath = alert.physicalLocation.filePath;
      const line = alert.physicalLocation.region?.startLine;

      let fileUrl = `${orgUrl}/${encodeURIComponent(project.name)}/_git/${repository.id}?path=${encodeURIComponent(filePath)}`;
      if (line) {
        fileUrl += `&line=${line}`;
      }

      links.push({
        label: '📄 View Source File',
        url: fileUrl,
        description: `File: ${filePath}${line ? ` (line ${line})` : ''}`,
      });
    }

    // Project link
    if (project) {
      const orgUrl =
        azdoService?.getBaseUrl() ||
        config?.getAzureDevOpsBaseUrl?.() ||
        'https://dev.azure.com';
      const projectUrl = `${orgUrl}/${encodeURIComponent(project.name)}`;
      links.push({
        label: '🏢 View Project',
        url: projectUrl,
        description: `Project: ${project.name}`,
      });
    }

    // Jira link (if linked)
    if (metadata.jiraId && config) {
      const jiraHost = config.getJiraHost?.() || config.jiraHost;
      if (jiraHost) {
        const jiraUrl = `${jiraHost}/browse/${metadata.jiraId}`;
        links.push({
          label: '🎫 View Jira Issue',
          url: jiraUrl,
          description: `Jira: ${metadata.jiraId}`,
        });
      }
    }

    // Additional properties links (if alert has additional data with URLs)
    if (alert.additionalProperties) {
      try {
        const additionalData =
          typeof alert.additionalProperties === 'string'
            ? JSON.parse(alert.additionalProperties)
            : alert.additionalProperties;

        // Check for tool-specific URLs
        if (additionalData.toolUrl) {
          links.push({
            label: '🔧 Tool Details',
            url: additionalData.toolUrl,
            description: 'Security scanning tool details',
          });
        }

        // Check for remediation URLs
        if (additionalData.remediationUrl) {
          links.push({
            label: '💡 Remediation Guide',
            url: additionalData.remediationUrl,
            description: 'How to fix this vulnerability',
          });
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // Help URL based on alert type
    if (alert.alertType === 2) {
      // Secret
      links.push({
        label: '📚 Secret Scanning Documentation',
        url: 'https://docs.github.com/en/code-security/secret-scanning',
        description: 'Learn about secret scanning',
      });
    } else if (alert.alertType === 3) {
      // Code
      links.push({
        label: '📚 Code Scanning Documentation',
        url: 'https://docs.github.com/en/code-security/code-scanning',
        description: 'Learn about code scanning with CodeQL',
      });
    } else if (alert.alertType === 1) {
      // Dependency
      links.push({
        label: '📚 Dependency Scanning Documentation',
        url: 'https://docs.github.com/en/code-security/supply-chain-security',
        description: 'Learn about dependency vulnerability detection',
      });
    }

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
    });

    return (
      <Modal width={80} height={60}>
        <Panel title="Related Links" borderColor="cyan">
          <Box flexDirection="column">
            <Box marginBottom={1}>
              <Text dimColor>
                Navigate: ↑↓ | Click links to open | ESC: Close
              </Text>
            </Box>

            {links.length === 0 && (
              <Box marginTop={1}>
                <Text color="yellow">No links available for this alert.</Text>
              </Box>
            )}

            {links.map((link, index) => (
              <Box
                key={index}
                flexDirection="column"
                marginY={1}
                borderStyle={cursor === index ? 'bold' : 'single'}
                borderColor={cursor === index ? 'cyan' : 'gray'}
                paddingX={1}
              >
                <Box>
                  <Link url={link.url}>
                    <Text
                      color={cursor === index ? 'cyan' : 'blue'}
                      bold={cursor === index}
                      underline
                    >
                      {link.label}
                    </Text>
                  </Link>
                </Box>
                <Box marginTop={0}>
                  <Text dimColor wrap="wrap">
                    {link.description}
                  </Text>
                </Box>
                <Box marginTop={0}>
                  <Text dimColor wrap="truncate">
                    {link.url}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Panel>
      </Modal>
    );
  }
);

AlertLinksModal.displayName = 'AlertLinksModal';
