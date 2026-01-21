/**
 * AlertDetailsModal
 * Modal showing full Azure DevOps alert details
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import Link from 'ink-link';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';
import { parseAlertMetadata } from '../utils/issue.js';

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
 * Helper function to get logical location kind name
 * @param {number} kind - Kind code
 * @returns {string} Kind name
 */
function getLogicalLocationKind(kind) {
  const kinds = {
    0: 'Unknown',
    1: 'Package',
    2: 'Namespace',
    3: 'Type',
    4: 'Member',
    5: 'Resource',
  };
  return kinds[kind] || 'Unknown';
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
export const IssueModal = React.memo(
  ({ alert, project, repository, onClose }) => {
    const [viewMode, setViewMode] = useState('overview');

    useInput((input, key) => {
      if (key.escape) {
        onClose();
        return;
      }

      if (key.leftArrow) {
        setViewMode((prev) => {
          if (prev === 'tools') return 'overview';
          if (prev === 'locations') return 'tools';
          return prev;
        });
        return;
      }

      if (key.rightArrow) {
        setViewMode((prev) => {
          if (prev === 'overview') return 'tools';
          if (prev === 'tools') return 'locations';
          return prev;
        });
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
            {/* View mode tabs */}
            <Box flexDirection="row" marginBottom={1} flexShrink={0}>
              <Box marginRight={2}>
                <Text
                  bold={viewMode === 'overview'}
                  color={viewMode === 'overview' ? 'cyan' : 'gray'}
                >
                  [Overview]
                </Text>
              </Box>
              <Box marginRight={2}>
                <Text
                  bold={viewMode === 'tools'}
                  color={viewMode === 'tools' ? 'cyan' : 'gray'}
                >
                  [Tools]
                </Text>
              </Box>
              <Box>
                <Text
                  bold={viewMode === 'locations'}
                  color={viewMode === 'locations' ? 'cyan' : 'gray'}
                >
                  [Locations]
                </Text>
              </Box>
            </Box>

            {viewMode === 'overview' && (
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
                    <Text
                      wrap="wrap"
                      color={alert.state === 1 ? 'red' : 'green'}
                    >
                      {stateName}
                    </Text>
                  </Box>

                  {/* Truncated Secret for secret alerts */}
                  {alert.truncatedSecret && (
                    <Box>
                      <Box width={18}>
                        <Text bold color="cyan">
                          Truncated Secret:
                        </Text>
                      </Box>
                      <Text wrap="wrap" color="yellow" backgroundColor="black">
                        {alert.truncatedSecret}
                      </Text>
                    </Box>
                  )}

                  {/* Git ref */}
                  {alert.gitRef && (
                    <Box marginTop={1}>
                      <Box width={18}>
                        <Text bold color="cyan">
                          Git Ref:
                        </Text>
                      </Box>
                      <Text wrap="wrap">{alert.gitRef}</Text>
                    </Box>
                  )}

                  {/* Trusted source flag */}
                  {alert.hasTrustedSourceOrigin !== undefined && (
                    <Box>
                      <Box width={18}>
                        <Text bold color="cyan">
                          Trusted Source:
                        </Text>
                      </Box>
                      <Text
                        wrap="wrap"
                        color={
                          alert.hasTrustedSourceOrigin ? 'green' : 'yellow'
                        }
                      >
                        {alert.hasTrustedSourceOrigin ? 'Yes' : 'No'}
                      </Text>
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

                  {alert.lastSeenDate && (
                    <Box>
                      <Box width={18}>
                        <Text bold color="cyan">
                          Last Seen:
                        </Text>
                      </Box>
                      <Text wrap="wrap">
                        {new Date(alert.lastSeenDate).toLocaleString()}
                      </Text>
                    </Box>
                  )}

                  {alert.fixedDate && (
                    <Box>
                      <Box width={18}>
                        <Text bold color="cyan">
                          Fixed Date:
                        </Text>
                      </Box>
                      <Text wrap="wrap" color="green">
                        {new Date(alert.fixedDate).toLocaleString()}
                      </Text>
                    </Box>
                  )}

                  {/* Repository URL */}
                  {alert.repositoryUrl && (
                    <Box marginTop={1}>
                      <Box width={18}>
                        <Text bold color="cyan">
                          Repository URL:
                        </Text>
                      </Box>
                      <Link url={alert.repositoryUrl}>
                        <Text color="blue" underline wrap="truncate">
                          {alert.repositoryUrl}
                        </Text>
                      </Link>
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
                            <Text wrap="wrap">
                              {alert.dismissal.dismissedBy}
                            </Text>
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

                  {/* Remediation/Fix Information */}
                  {alert.fixReason && (
                    <Box
                      flexDirection="column"
                      borderStyle="single"
                      borderColor="green"
                      paddingX={1}
                      marginTop={1}
                    >
                      <Text color="green" bold>
                        Fix Information
                      </Text>
                      <Box marginTop={1}>
                        <Text wrap="wrap">{alert.fixReason}</Text>
                      </Box>
                    </Box>
                  )}

                  {/* Instances Count */}
                  {alert.instancesCount !== undefined &&
                    alert.instancesCount > 0 && (
                      <Box marginTop={1}>
                        <Box width={18}>
                          <Text bold color="cyan">
                            Instances:
                          </Text>
                        </Box>
                        <Text wrap="wrap" color="yellow" bold>
                          {alert.instancesCount} occurrence(s)
                        </Text>
                      </Box>
                    )}

                  {/* Locations Summary */}
                  {alert.physicalLocations &&
                    alert.physicalLocations.length > 0 && (
                      <Box
                        flexDirection="column"
                        borderStyle="single"
                        borderColor="cyan"
                        paddingX={1}
                        marginTop={1}
                      >
                        <Text color="cyan" bold>
                          Locations Summary
                        </Text>
                        <Box marginTop={1}>
                          <Box width={18}>
                            <Text bold>Total Locations:</Text>
                          </Box>
                          <Text wrap="wrap" color="yellow" bold>
                            {alert.physicalLocations.length}
                          </Text>
                        </Box>
                        <Box>
                          <Box width={18}>
                            <Text bold>Distinct Files:</Text>
                          </Box>
                          <Text wrap="wrap" color="yellow" bold>
                            {
                              new Set(
                                alert.physicalLocations.map(
                                  (loc) => loc.filePath
                                )
                              ).size
                            }
                          </Text>
                        </Box>
                        <Box marginTop={1}>
                          <Text dimColor>
                            View the [Locations] tab for details
                          </Text>
                        </Box>
                      </Box>
                    )}

                  {/* Tools/Remediation Preview */}
                  {alert.tools && alert.tools.length > 0 && (
                    <Box
                      flexDirection="column"
                      borderStyle="single"
                      borderColor="magenta"
                      paddingX={1}
                      marginTop={1}
                    >
                      <Text color="magenta" bold>
                        Remediation Information
                      </Text>
                      {alert.tools[0]?.rules?.[0]?.helpMessage && (
                        <Box marginTop={1} flexDirection="column">
                          <Text wrap="wrap">
                            {alert.tools[0].rules[0].helpMessage.substring(
                              0,
                              200
                            )}
                            {alert.tools[0].rules[0].helpMessage.length > 200
                              ? '...'
                              : ''}
                          </Text>
                          {alert.tools[0].rules[0].helpMessage.length > 200 && (
                            <Text dimColor marginTop={1}>
                              View the [Tools] tab for complete remediation
                              steps
                            </Text>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Additional Properties */}
                  {alert.additionalProperties && (
                    <Box
                      flexDirection="column"
                      borderStyle="single"
                      borderColor="magenta"
                      paddingX={1}
                      marginTop={1}
                    >
                      <Text color="magenta" bold>
                        Additional Information
                      </Text>
                      <Box marginTop={1} flexDirection="column">
                        {(() => {
                          try {
                            const additionalData =
                              typeof alert.additionalProperties === 'string'
                                ? JSON.parse(alert.additionalProperties)
                                : alert.additionalProperties;

                            return Object.entries(additionalData).map(
                              ([key, value]) => (
                                <Box key={key} marginY={0}>
                                  <Box width={20}>
                                    <Text bold dimColor>
                                      {key}:
                                    </Text>
                                  </Box>
                                  <Text wrap="wrap">
                                    {typeof value === 'object'
                                      ? JSON.stringify(value)
                                      : String(value)}
                                  </Text>
                                </Box>
                              )
                            );
                          } catch {
                            return (
                              <Text wrap="wrap" dimColor>
                                {typeof alert.additionalProperties === 'string'
                                  ? alert.additionalProperties
                                  : JSON.stringify(alert.additionalProperties)}
                              </Text>
                            );
                          }
                        })()}
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
                  <Text dimColor>←→: Switch tabs | ESC: Close</Text>
                </Box>
              </Box>
            )}

            {viewMode === 'tools' && (
              <Box flexDirection="column" height="100%">
                <Box flexDirection="column" flexGrow={1} minHeight={0}>
                  {alert.tools && alert.tools.length > 0 ? (
                    alert.tools.map((tool, toolIdx) => (
                      <Box
                        key={toolIdx}
                        flexDirection="column"
                        borderStyle="single"
                        borderColor="cyan"
                        paddingX={1}
                        marginBottom={1}
                      >
                        <Text color="cyan" bold>
                          Tool: {tool.name || 'Unknown'}
                        </Text>
                        {tool.rules && tool.rules.length > 0 && (
                          <Box flexDirection="column" marginTop={1}>
                            {tool.rules.map((rule, ruleIdx) => (
                              <Box
                                key={ruleIdx}
                                flexDirection="column"
                                borderStyle="single"
                                borderColor="magenta"
                                paddingX={1}
                                marginY={1}
                              >
                                <Box>
                                  <Box width={20}>
                                    <Text bold color="magenta">
                                      Rule Name:
                                    </Text>
                                  </Box>
                                  <Text wrap="wrap">
                                    {rule.friendlyName || 'N/A'}
                                  </Text>
                                </Box>
                                {rule.opaqueId && (
                                  <Box>
                                    <Box width={20}>
                                      <Text bold color="magenta">
                                        Opaque ID:
                                      </Text>
                                    </Box>
                                    <Text wrap="wrap">{rule.opaqueId}</Text>
                                  </Box>
                                )}
                                {rule.description && (
                                  <Box marginTop={1}>
                                    <Box width={20}>
                                      <Text bold color="magenta">
                                        Description:
                                      </Text>
                                    </Box>
                                    <Text wrap="wrap">{rule.description}</Text>
                                  </Box>
                                )}
                                {rule.helpMessage && (
                                  <Box marginTop={1}>
                                    <Box width={20}>
                                      <Text bold color="magenta">
                                        Help:
                                      </Text>
                                    </Box>
                                    <Text wrap="wrap">{rule.helpMessage}</Text>
                                  </Box>
                                )}
                                {rule.resources && (
                                  <Box marginTop={1}>
                                    <Box width={20}>
                                      <Text bold color="magenta">
                                        Resources:
                                      </Text>
                                    </Box>
                                    <Link url={rule.resources}>
                                      <Text color="blue" underline wrap="wrap">
                                        {rule.resources}
                                      </Text>
                                    </Link>
                                  </Box>
                                )}
                                {rule.additionalProperties &&
                                  Object.keys(rule.additionalProperties)
                                    .length > 0 && (
                                    <Box
                                      flexDirection="column"
                                      marginTop={1}
                                      borderStyle="single"
                                      borderColor="yellow"
                                      paddingX={1}
                                    >
                                      <Text color="yellow" bold>
                                        Additional Properties
                                      </Text>
                                      {Object.entries(
                                        rule.additionalProperties
                                      ).map(([key, value]) => (
                                        <Box key={key}>
                                          <Box width={15}>
                                            <Text dimColor>{key}:</Text>
                                          </Box>
                                          <Text wrap="wrap">
                                            {String(value)}
                                          </Text>
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Box marginTop={1}>
                      <Text color="yellow">No tool information available</Text>
                    </Box>
                  )}
                </Box>

                <Box marginTop={1} flexShrink={0}>
                  <Text dimColor>←→: Switch tabs | ESC: Close</Text>
                </Box>
              </Box>
            )}

            {viewMode === 'locations' && (
              <Box flexDirection="column" height="100%">
                <Box flexDirection="column" flexGrow={1} minHeight={0}>
                  {/* Physical Locations */}
                  {alert.physicalLocations &&
                  alert.physicalLocations.length > 0 ? (
                    <Box
                      flexDirection="column"
                      borderStyle="single"
                      borderColor="cyan"
                      paddingX={1}
                      marginBottom={1}
                    >
                      <Text color="cyan" bold>
                        Physical Locations
                      </Text>
                      <Box flexDirection="column" marginTop={1}>
                        {alert.physicalLocations.map((loc, idx) => (
                          <Box
                            key={idx}
                            flexDirection="column"
                            borderStyle="single"
                            borderColor="blue"
                            paddingX={1}
                            marginY={1}
                          >
                            <Text color="blue" bold>
                              Location {idx + 1}
                            </Text>
                            {loc.filePath && (
                              <Box marginTop={1}>
                                <Box width={18}>
                                  <Text bold>File Path:</Text>
                                </Box>
                                <Text wrap="wrap">{loc.filePath}</Text>
                              </Box>
                            )}
                            {loc.region && (
                              <Box>
                                <Box width={18}>
                                  <Text bold>Region:</Text>
                                </Box>
                                <Text wrap="wrap">
                                  {loc.region.startLine
                                    ? `Line ${loc.region.startLine}${loc.region.endLine && loc.region.endLine !== loc.region.startLine ? ` - ${loc.region.endLine}` : ''}`
                                    : 'N/A'}
                                </Text>
                              </Box>
                            )}
                            {loc.versionControl && (
                              <Box flexDirection="column" marginTop={1}>
                                {loc.versionControl.commitHash && (
                                  <Box>
                                    <Box width={18}>
                                      <Text bold>Commit Hash:</Text>
                                    </Box>
                                    <Text wrap="wrap">
                                      {loc.versionControl.commitHash}
                                    </Text>
                                  </Box>
                                )}
                                {loc.versionControl.itemUrl && (
                                  <Box marginTop={1}>
                                    <Box width={18}>
                                      <Text bold>Item URL:</Text>
                                    </Box>
                                    <Link url={loc.versionControl.itemUrl}>
                                      <Text
                                        color="blue"
                                        underline
                                        wrap="truncate"
                                      >
                                        {loc.versionControl.itemUrl}
                                      </Text>
                                    </Link>
                                  </Box>
                                )}
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Box marginTop={1}>
                      <Text color="yellow">
                        No physical locations available
                      </Text>
                    </Box>
                  )}

                  {/* Logical Locations */}
                  {alert.logicalLocations &&
                    alert.logicalLocations.length > 0 && (
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
                        <Box flexDirection="column" marginTop={1}>
                          {alert.logicalLocations.map((loc, idx) => (
                            <Box
                              key={idx}
                              flexDirection="column"
                              borderStyle="single"
                              borderColor="green"
                              paddingX={1}
                              marginY={1}
                            >
                              <Text color="green" bold>
                                Location {idx + 1}
                              </Text>
                              {loc.fullyQualifiedName && (
                                <Box marginTop={1}>
                                  <Box width={18}>
                                    <Text bold>Fully Qualified:</Text>
                                  </Box>
                                  <Text wrap="wrap">
                                    {loc.fullyQualifiedName}
                                  </Text>
                                </Box>
                              )}
                              {loc.kind !== undefined && (
                                <Box>
                                  <Box width={18}>
                                    <Text bold>Kind:</Text>
                                  </Box>
                                  <Text wrap="wrap">
                                    {getLogicalLocationKind(loc.kind)}
                                  </Text>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                </Box>

                <Box marginTop={1} flexShrink={0}>
                  <Text dimColor>←→: Switch tabs | ESC: Close</Text>
                </Box>
              </Box>
            )}
          </Box>
        </Panel>
      </Modal>
    );
  }
);

IssueModal.displayName = 'IssueModal';
