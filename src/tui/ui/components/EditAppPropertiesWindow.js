/**
 * EditAppPropertiesWindow
 * Standalone full-screen window for editing application properties
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import {
  useKeyboardManager,
  KeyboardMode,
} from '../../utils/KeyboardManager.js';

/**
 * Full-screen window for selecting which application property to edit
 *
 * @param {Object} props
 * @param {Object} props.app - Application object with properties to edit
 * @param {number} [props.initialCursor=0] - Initial cursor position
 * @param {Function} props.onSelectField - Callback when a field is selected for editing
 * @param {Function} props.onCancel - Callback when window is cancelled
 * @returns {JSX.Element|null}
 */
export const EditAppPropertiesWindow = React.memo(
  ({ app, initialCursor = 0, onSelectField, onCancel }) => {
    const [cursor, setCursor] = useState(initialCursor);
    const { height } = useTerminalSize();
    const { setKeyboardMode } = useKeyboardManager();

    // Set keyboard mode on mount
    useEffect(() => {
      setKeyboardMode(KeyboardMode.MODAL);

      return () => {
        setKeyboardMode(KeyboardMode.NORMAL);
      };
    }, [setKeyboardMode]);

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
        onCancel();
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

    // Calculate visible area
    const headerHeight = 6; // Title + subtitle + instructions
    const footerHeight = 2; // Navigation help
    const availableHeight = height - headerHeight - footerHeight;
    const visibleRows = Math.max(5, availableHeight);

    // Calculate scroll window
    const scrollOffset = Math.max(
      0,
      Math.min(
        cursor - Math.floor(visibleRows / 2),
        fields.length - visibleRows
      )
    );
    const visibleFields = fields.slice(
      scrollOffset,
      scrollOffset + visibleRows
    );

    return (
      <Box
        width="100%"
        height="100%"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
      >
        {/* Header */}
        <Box flexDirection="column" marginBottom={1}>
          <Text bold color="cyan">
            Edit Application Properties
          </Text>
          <Text color="white">{app.Name}</Text>
          <Text dimColor>Select a field to edit:</Text>
        </Box>

        {/* Field List */}
        <Box flexDirection="column" flexGrow={1}>
          {visibleFields.map((field) => {
            const globalIndex = fields.indexOf(field);
            const isSelected = globalIndex === cursor;

            return (
              <Box key={field.key} marginY={0}>
                <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
                  {isSelected ? '▶ ' : '  '}
                </Text>
                <Box width={25}>
                  <Text
                    color={
                      isSelected ? 'cyan' : field.isCustom ? 'yellow' : 'white'
                    }
                    bold={isSelected || field.isCustom}
                  >
                    {field.label}:
                  </Text>
                </Box>
                <Text
                  color={field.value ? (isSelected ? 'cyan' : 'white') : 'gray'}
                  dimColor={!field.value}
                >
                  {field.value || '(not set)'}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Footer */}
        <Box marginTop={1}>
          <Text dimColor>↑/↓: Navigate | ENTER: Edit Field | ESC: Close</Text>
        </Box>
      </Box>
    );
  }
);

EditAppPropertiesWindow.displayName = 'EditAppPropertiesWindow';
