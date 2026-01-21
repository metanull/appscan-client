/**
 * HelpModal
 * Displays keyboard shortcuts reference
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import { useGroupedShortcuts } from '../../shared/hooks/useKeyboardShortcuts.js';
import { formatKeyForDisplay } from '../../shared/utils/keyboard-shortcuts.js';

/**
 * Modal dialog that displays available keyboard shortcuts for the current view
 *
 * @param {Object} props
 * @param {string} props.view - Current view name for context-specific shortcuts
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const HelpModal = React.memo(({ view, onClose }) => {
  const groupedShortcuts = useGroupedShortcuts(view || 'issue-list');

  useInput((input, key) => {
    if (key.escape || input === 'h' || input === '?') {
      onClose();
    }
  });

  return (
    <Modal width={60} height={70}>
      <Panel title="Keyboard Shortcuts" borderColor="yellow">
        <Box flexDirection="column">
          {Object.entries(groupedShortcuts).map(([groupName, shortcuts]) => (
            <Box key={groupName} flexDirection="column" marginBottom={1}>
              <Text bold color="green">
                {groupName}
              </Text>
              {shortcuts.map((shortcut) => (
                <Box key={shortcut.key} marginY={0}>
                  <Box width={20}>
                    <Text bold color="cyan">
                      {formatKeyForDisplay(shortcut.key)}
                    </Text>
                  </Box>
                  <Text>{shortcut.description}</Text>
                </Box>
              ))}
            </Box>
          ))}

          <Box marginTop={2}>
            <Text dimColor>Press ESC, h, or ? to close</Text>
          </Box>
        </Box>
      </Panel>
    </Modal>
  );
});

HelpModal.displayName = 'HelpModal';
