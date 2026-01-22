/**
 * LinksModal for Azure DevOps Alerts
 * Displays clickable hyperlinks for AzDO alerts
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import Link from 'ink-link';
import open from 'open';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';
import { parseAlertMetadata } from '../utils/issue.js';

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
export const LinksModal = React.memo(
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

    // Repository URL from alert data (always include if present)
    if (alert.repositoryUrl) {
      links.push({
        label: '📁 Repository URL',
        url: alert.repositoryUrl,
        description: 'Direct repository link from alert',
      });
    }

    // Repository link (constructed) - only if repositoryUrl not available
    if (repository && project && !alert.repositoryUrl) {
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

    // Physical locations with version control URLs
    if (alert.physicalLocations && alert.physicalLocations.length > 0) {
      alert.physicalLocations.forEach((loc, idx) => {
        if (loc.versionControl?.itemUrl) {
          links.push({
            label: `📄 Source File ${alert.physicalLocations.length > 1 ? `(${idx + 1})` : ''}`,
            url: loc.versionControl.itemUrl,
            description: loc.filePath
              ? `File: ${loc.filePath}${loc.region?.startLine ? ` (line ${loc.region.startLine})` : ''}`
              : 'View source file in version control',
          });
        } else if (loc.filePath && repository && project) {
          // Construct file URL if not provided
          const orgUrl =
            azdoService?.getBaseUrl() ||
            config?.getAzureDevOpsBaseUrl?.() ||
            'https://dev.azure.com';
          const line = loc.region?.startLine;

          let fileUrl = `${orgUrl}/${encodeURIComponent(project.name)}/_git/${repository.id}?path=${encodeURIComponent(loc.filePath)}`;
          if (line) {
            fileUrl += `&line=${line}`;
          }

          links.push({
            label: `📄 Source File ${alert.physicalLocations.length > 1 ? `(${idx + 1})` : ''}`,
            url: fileUrl,
            description: `File: ${loc.filePath}${line ? ` (line ${line})` : ''}`,
          });
        }
      });
    }

    // Tool rules with resources
    if (alert.tools && alert.tools.length > 0) {
      alert.tools.forEach((tool) => {
        if (tool.rules && tool.rules.length > 0) {
          tool.rules.forEach((rule) => {
            if (rule.resources) {
              links.push({
                label: `📚 ${rule.friendlyName || 'Rule'} - Resources`,
                url: rule.resources,
                description: rule.description
                  ? rule.description.substring(0, 100) + '...'
                  : 'View rule resources and documentation',
              });
            }
          });
        }
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

      if (key.return && links[cursor]) {
        // Open the selected link in default browser
        const selectedLink = links[cursor];
        open(selectedLink.url).catch(() => {
          // Silently fail if we can't open the link
          // The terminal-based link should still be clickable
        });
        return;
      }
    });

    if (links.length === 0) {
      return (
        <Modal width={60} height={30}>
          <Panel title="Links" borderColor="cyan">
            <Box flexDirection="column">
              <Text dimColor>No links available for this alert</Text>
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
                  <Text
                    color={cursor === index ? 'cyan' : undefined}
                    bold={cursor === index}
                  >
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
              <Text dimColor>↑/↓: Navigate | ENTER: Open | ESC: Close</Text>
            </Box>
          </Box>
        </Panel>
      </Modal>
    );
  }
);

LinksModal.displayName = 'LinksModal';
