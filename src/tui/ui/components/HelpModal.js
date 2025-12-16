/**
 * HelpModal
 * Displays keyboard shortcuts reference
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';

const SHORTCUTS = [
  { key: '↑/↓', description: 'Move cursor' },
  { key: 'PageUp/PageDown', description: 'Page navigation' },
  { key: 'Home/End', description: 'Go to first/last' },
  { key: 'Enter', description: 'Open details modal' },
  { key: 'Space', description: 'Toggle selection' },
  { key: 'Ctrl+A', description: 'Select all' },
  { key: 'Escape', description: 'Close modal / go back' },
  { key: 'a', description: 'Change application' },
  { key: 's', description: 'Change scan' },
  { key: 'f', description: 'Filter' },
  { key: '/', description: 'Search' },
  { key: 'l', description: 'Links' },
  { key: 'u', description: 'Update status' },
  { key: 'j', description: 'Create Jira' },
  { key: 'c', description: 'Toggle context pane' },
  { key: 'r', description: 'Refresh' },
  { key: 'h or ?', description: 'Help (this screen)' },
  { key: 'q', description: 'Quit' },
];

export const HelpModal = React.memo(({ onClose }) => {
  useInput((input, key) => {
    if (key.escape || input === 'h' || input === '?') {
      onClose();
    }
  });

  return (
    <Modal width={60} height={70}>
      <Panel title="Keyboard Shortcuts" borderColor="yellow">
        <Box flexDirection="column">
          {SHORTCUTS.map(({ key, description }) => (
            <Box key={key} marginY={0}>
              <Box width={20}>
                <Text bold color="cyan">
                  {key}
                </Text>
              </Box>
              <Text>{description}</Text>
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
