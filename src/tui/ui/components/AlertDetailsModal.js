/**
 * AlertDetailsModal
 * Modal showing full Azure DevOps alert details
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import Link from 'ink-link';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import { parseAlertMetadata } from '../../utils/azdo-issue-utils.js';

/**
 * Helper function to get alert type display name
 * @param {number} alertType - Alert type code
 * @returns {string} Alert type name
 */
function getAlertTypeName(alertType) {
  const types = {
    1: 'Dependency',
    2: 'Secret',
    3: 'Code',
  };
  return types[alertType] || 'Unknown';
}

/**
 * Helper function to get severity display name
 * @param {number} severity - Severity code
 * @returns {string} Severity name
 */
function getSeverityName(severity) {
  const severities = {
    0: 'Note',
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Critical',
  };
  return severities[severity] || 'Unknown';
}

/**
 * Helper function to get state display name
 * @param {number} state - State code
 * @returns {string} State name
 */
function getStateName(state) {
  const states = {
    1: 'Active',
    2: 'Dismissed',
    3: 'Resolved',
    4: 'Fixed',
  };
  return states[state] || 'Unknown';
}

/**
 * Modal dialog displaying detailed information about an Azure DevOps security alert
 * Includes alert metadata, location, and additional properties
 *
 * @param {Object} props
 * @param {Object} props.alert - Alert object with details
 * @param {Object} props.project - Project object
 * @param {Object} props.repository - Repository object
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element|null}
 */
export const AlertDetailsModal = React.memo(
  ({ alert, project, repository, onClose }) => {
    useInput((input, key) => {
      if (key.escape) {
        onClose();
        return;
      }
    });

    if (!alert) {
      return null;
    }

    const metadata = parseAlertMetadata(alert);
    const severityName = getSeverityName(alert.severity);
    const stateName = getStateName(alert.state);
    const alertTypeName = getAlertTypeName(alert.alertType);

    const severityColor =
      {
        Critical: 'red',
        High: 'red',
        Medium: 'yellow',
        Low: 'blue',
        Note: 'gray',
      }[severityName] || 'white';

    return (
      <Modal width={90} height={80}>
        <Panel title={`Alert Details - ${alertTypeName}`} borderColor="cyan">
          <Box flexDirection="column" height="100%">
            {/* Header section - fixed height, no growth */}
            <Box flexDirection="column" flexShrink={0}>
              <Box>
                <Box width={18}>
                  <Text bold color="cyan">
                    Alert ID:
                  </Text>
                </Box>
                <Text wrap="wrap">{alert.alertId || 'N/A'}</Text>
              </Box>
              <Box>
                <Box width={18}>
                  <Text bold color="cyan">
                    Title:
                  </Text>
                </Box>
                <Text wrap="wrap">
                  {alert.title || alert.ruleName || 'N/A'}
                </Text>
              </Box>
              <Box>
                <Box width={18}>
                  <Text bold color="cyan">
                    Type:
                  </Text>
                </Box>
                <Text wrap="wrap">{alertTypeName}</Text>
              </Box>
              <Box>
                <Box width={18}>
                  <Text bold color="cyan">
                    Severity:
                  </Text>
                </Box>
                <Text wrap="wrap" color={severityColor} bold>
                  {severityName}
                </Text>
              </Box>
              <Box>
                <Box width={18}>
                  <Text bold color="cyan">
                    State:
                  </Text>
                </Box>
                <Text wrap="wrap" color={alert.state === 1 ? 'red' : 'green'}>
                  {stateName}
                </Text>
              </Box>

              {/* Location information */}
              {alert.physicalLocation?.filePath && (
                <Box flexDirection="column" marginTop={1}>
                  <Box>
                    <Box width={18}>
                      <Text bold color="cyan">
                        File:
                      </Text>
                    </Box>
                    <Text wrap="wrap">{alert.physicalLocation.filePath}</Text>
                  </Box>
                  {alert.physicalLocation.region?.startLine && (
                    <Box>
                      <Box width={18}>
                        <Text bold color="cyan">
                          Line:
                        </Text>
                      </Box>
                      <Text wrap="wrap">
                        {alert.physicalLocation.region.startLine}
                        {alert.physicalLocation.region.endLine &&
                          alert.physicalLocation.region.endLine !==
                            alert.physicalLocation.region.startLine &&
                          ` - ${alert.physicalLocation.region.endLine}`}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}

              {/* Project and repository info */}
              {project && (
                <Box marginTop={1}>
                  <Box width={18}>
                    <Text bold color="cyan">
                      Project:
                    </Text>
                  </Box>
                  <Text wrap="wrap">{project.name || 'N/A'}</Text>
                </Box>
              )}
              {repository && (
                <Box>
                  <Box width={18}>
                    <Text bold color="cyan">
                      Repository:
                    </Text>
                  </Box>
                  <Text wrap="wrap">{repository.name || 'N/A'}</Text>
                </Box>
              )}

              {/* Jira information */}
              {metadata.jiraId && (
                <Box marginTop={1}>
                  <Box width={18}>
                    <Text bold color="cyan">
                      Jira ID:
                    </Text>
                  </Box>
                  <Text wrap="wrap" color="green">
                    {metadata.jiraId}
                  </Text>
                </Box>
              )}

              <Text> </Text>

              {/* Additional properties */}
              {alert.ruleName && alert.ruleName !== alert.title && (
                <Box>
                  <Box width={18}>
                    <Text bold color="cyan">
                      Rule Name:
                    </Text>
                  </Box>
                  <Text wrap="wrap">{alert.ruleName}</Text>
                </Box>
              )}

              {alert.introducedDate && (
                <Box>
                  <Box width={18}>
                    <Text bold color="cyan">
                      Introduced:
                    </Text>
                  </Box>
                  <Text wrap="wrap">
                    {new Date(alert.introducedDate).toLocaleString()}
                  </Text>
                </Box>
              )}

              {alert.firstSeenDate && (
                <Box>
                  <Box width={18}>
                    <Text bold color="cyan">
                      First Seen:
                    </Text>
                  </Box>
                  <Text wrap="wrap">
                    {new Date(alert.firstSeenDate).toLocaleString()}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Content area - grows to fill available space */}
            <Box flexDirection="column" flexGrow={1} minHeight={0}>
              {/* Dismissal information */}
              {alert.dismissal && (
                <Box
                  flexDirection="column"
                  borderStyle="single"
                  borderColor="yellow"
                  paddingX={1}
                  marginTop={1}
                >
                  <Text color="yellow" bold>
                    Dismissal Information
                  </Text>
                  <Box marginTop={1} flexDirection="column">
                    {alert.dismissal.message && (
                      <Box marginBottom={1}>
                        <Box width={18}>
                          <Text bold>Message:</Text>
                        </Box>
                        <Text wrap="wrap">{alert.dismissal.message}</Text>
                      </Box>
                    )}
                    {alert.dismissal.dismissedBy && (
                      <Box>
                        <Box width={18}>
                          <Text bold>Dismissed By:</Text>
                        </Box>
                        <Text wrap="wrap">{alert.dismissal.dismissedBy}</Text>
                      </Box>
                    )}
                    {alert.dismissal.dismissedDate && (
                      <Box>
                        <Box width={18}>
                          <Text bold>Dismissed Date:</Text>
                        </Box>
                        <Text wrap="wrap">
                          {new Date(
                            alert.dismissal.dismissedDate
                          ).toLocaleString()}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Description */}
              {alert.description && (
                <Box
                  flexDirection="column"
                  borderStyle="single"
                  borderColor="cyan"
                  paddingX={1}
                  marginTop={1}
                >
                  <Text color="cyan" bold>
                    Description
                  </Text>
                  <Box marginTop={1}>
                    <Text wrap="wrap">{alert.description}</Text>
                  </Box>
                </Box>
              )}

              {/* Logical Locations (e.g., function names, etc.) */}
              {alert.logicalLocations && alert.logicalLocations.length > 0 && (
                <Box
                  flexDirection="column"
                  borderStyle="single"
                  borderColor="cyan"
                  paddingX={1}
                  marginTop={1}
                >
                  <Text color="cyan" bold>
                    Logical Locations
                  </Text>
                  <Box marginTop={1} flexDirection="column">
                    {alert.logicalLocations.map((loc, idx) => (
                      <Text key={idx} wrap="wrap">
                        • {loc.fullyQualifiedName || loc.name || 'Unknown'}
                      </Text>
                    ))}
                  </Box>
                </Box>
              )}

              {/* External links */}
              {alert.url && (
                <Box marginTop={1}>
                  <Link url={alert.url}>
                    <Text color="blue" underline wrap="wrap">
                      🔗 View in Azure DevOps
                    </Text>
                  </Link>
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

AlertDetailsModal.displayName = 'AlertDetailsModal';
