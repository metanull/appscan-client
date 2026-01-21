/**
 * EditAppPropertiesModal
 * Modal for selecting and editing application properties
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';

/**
 * Modal dialog for selecting which application property to edit
 *
 * @param {Object} props
 * @param {Object} props.app - Application object with properties to edit
 * @param {number} [props.initialCursor=0] - Initial cursor position
 * @param {Function} props.onSelectField - Callback when a field is selected for editing
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element|null}
 */
export const EditAppPropertiesModal = React.memo(
  ({ app, initialCursor = 0, onSelectField, onClose }) => {
    const [cursor, setCursor] = useState(initialCursor);

    if (!app) {
      return null;
    }

    // Define editable fields
    const fields = [
      // Standard fields
      { key: 'Name', label: 'Name', value: app.Name || '' },
      {
        key: 'Description',
        label: 'Description',
        value: app.Description || '',
      },
      { key: 'Type', label: 'Type', value: app.Type || '' },
      { key: 'Url', label: 'URL', value: app.Url || '' },
      { key: 'Technology', label: 'Technology', value: app.Technology || '' },
      {
        key: 'DevelopmentContact',
        label: 'Development Contact',
        value: app.DevelopmentContact || '',
      },
      {
        key: 'BusinessOwner',
        label: 'Business Owner',
        value: app.BusinessOwner || '',
      },
      { key: 'Tester', label: 'Tester', value: app.Tester || '' },
      {
        key: 'RiskRating',
        label: 'Risk Rating',
        value: app.RiskRating || 'Unknown',
      },
      {
        key: 'BusinessImpact',
        label: 'Business Impact',
        value: app.BusinessImpact || 'Unknown',
      },
      {
        key: 'TestingStatus',
        label: 'Testing Status',
        value: app.TestingStatus || 'NotStarted',
      },

      // Custom fields (if present)
      ...(app.customFields
        ? [
            {
              key: 'DevOpsProject',
              label: 'DevOps Project',
              value: app.customFields.DevOpsProject || '',
              isCustom: true,
            },
            {
              key: 'JiraProject',
              label: 'Jira Project',
              value: app.customFields.JiraProject || '',
              isCustom: true,
            },
            {
              key: 'DevOpsRepo',
              label: 'DevOps Repo',
              value: app.customFields.DevOpsRepo || '',
              isCustom: true,
            },
            {
              key: 'ConfluenceSpace',
              label: 'Confluence Space',
              value: app.customFields.ConfluenceSpace || '',
              isCustom: true,
            },
            {
              key: 'JiraParentEpic',
              label: 'Jira Parent Epic',
              value: app.customFields.JiraParentEpic || '',
              isCustom: true,
            },
          ]
        : []),
    ];

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
        setCursor((prev) => Math.min(fields.length - 1, prev + 1));
        return;
      }

      if (key.return && fields[cursor]) {
        const selectedField = fields[cursor];
        onSelectField(selectedField, cursor);
        return;
      }
    });

    return (
      <Modal width={80} height={40}>
        <Panel
          title={`Edit Application Properties - ${app.Name}`}
          borderColor="cyan"
        >
          <Box flexDirection="column">
            <Text dimColor>Select a field to edit:</Text>

            <Box flexDirection="column" marginTop={1} marginBottom={1}>
              {fields.map((field, index) => (
                <Box key={field.key} marginY={0}>
                  <Text
                    color={cursor === index ? 'cyan' : undefined}
                    bold={cursor === index}
                  >
                    {cursor === index ? '▶ ' : '  '}
                  </Text>
                  <Box width={25}>
                    <Text
                      color={
                        cursor === index
                          ? 'cyan'
                          : field.isCustom
                            ? 'yellow'
                            : 'white'
                      }
                      bold={cursor === index || field.isCustom}
                    >
                      {field.label}:
                    </Text>
                  </Box>
                  <Text
                    color={field.value ? 'white' : 'gray'}
                    dimColor={!field.value}
                  >
                    {field.value || '(not set)'}
                  </Text>
                </Box>
              ))}
            </Box>

            <Box marginTop={1}>
              <Text dimColor>
                ↑/↓: Navigate | ENTER: Edit Field | ESC: Close
              </Text>
            </Box>
          </Box>
        </Panel>
      </Modal>
    );
  }
);

EditAppPropertiesModal.displayName = 'EditAppPropertiesModal';
