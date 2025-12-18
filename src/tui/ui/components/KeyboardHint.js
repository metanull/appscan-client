/**
 * KeyboardHint Component
 * Displays a keyboard shortcut as a styled key button
 */

import React from 'react';
import { Box, Text } from 'ink';

/**
 * Format keyboard shortcut for display
 * @param {string} keyString - Key string like 'ctrl+a', 'leftarrow', 'escape'
 * @returns {string} - Formatted key for display
 */
function formatKeyString(keyString) {
  const parts = keyString.toLowerCase().split('+');
  const formatted = parts.map((part) => {
    // Special formatting for specific keys
    if (part === 'ctrl' || part === 'control') return 'Ctrl';
    if (part === 'alt' || part === 'meta') return 'Alt';
    if (part === 'shift') return 'Shift';
    if (part === 'escape' || part === 'esc') return 'Esc';
    if (part === 'return' || part === 'enter') return 'Enter';
    if (part === 'backspace') return 'Backsp';
    if (part === 'delete' || part === 'del') return 'Del';
    if (part === 'tab') return 'Tab';
    if (part === 'space') return 'Space';
    if (part === 'uparrow' || part === 'up') return '↑';
    if (part === 'downarrow' || part === 'down') return '↓';
    if (part === 'leftarrow' || part === 'left') return '←';
    if (part === 'rightarrow' || part === 'right') return '→';
    if (part === 'pageup' || part === 'pgup') return 'PgUp';
    if (part === 'pagedown' || part === 'pgdown') return 'PgDn';
    if (part === 'home') return 'Home';
    if (part === 'end') return 'End';
    // Function keys
    if (/^f([1-9]|1[0-2])$/.test(part)) return part.toUpperCase();
    // Regular keys - capitalize
    return part.toUpperCase();
  });

  return formatted.join('+');
}

/**
 * KeyboardHint - Display a keyboard shortcut in a key-like box
 */
export const KeyboardHint = React.memo(({ keyString, description }) => {
  const formattedKey = formatKeyString(keyString);
  const keyWidth = 12;
  const padding = Math.max(0, Math.floor((keyWidth - formattedKey.length) / 2));
  const paddedKey = ' '.repeat(padding) + formattedKey;

  return (
    <Box flexDirection="row" gap={1}>
      <Box borderStyle="round" borderColor="gray" paddingX={1} width={keyWidth}>
        <Text color="gray">{paddedKey}</Text>
      </Box>
      <Text>• {description}</Text>
    </Box>
  );
});

KeyboardHint.displayName = 'KeyboardHint';
