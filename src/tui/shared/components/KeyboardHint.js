/**
 * KeyboardHint Component
 * Displays a keyboard shortcut as a styled key button
 */

import React from 'react';
import { Box, Text } from 'ink';

/**
 * Display a keyboard shortcut as styled key buttons with description
 * Parses key combinations and renders each key in a bordered box
 *
 * @param {Object} props
 * @param {string} props.keyString - Key combination string (e.g., "Ctrl+S", "Enter", "↑")
 * @param {string} props.description - Description of what the shortcut does
 * @returns {JSX.Element}
 */
export const KeyboardHint = React.memo(({ keyString, description }) => {
  // Split the key string into individual keys
  const parts = keyString.toLowerCase().split('+');

  // Format and calculate width for each key
  const keys = parts.map((part) => {
    let formatted = '';
    let width = 3; // Default width for single characters and arrows

    if (part === 'ctrl' || part === 'control') {
      formatted = 'Ctrl';
      width = 6;
    } else if (part === 'alt' || part === 'meta') {
      formatted = 'Alt';
      width = 5;
    } else if (part === 'shift') {
      formatted = 'Shift';
      width = 7;
    } else if (part === 'escape' || part === 'esc') {
      formatted = 'Esc';
      width = 5;
    } else if (part === 'return' || part === 'enter') {
      formatted = 'Enter';
      width = 7;
    } else if (part === 'backspace') {
      formatted = 'Backsp';
      width = 8;
    } else if (part === 'delete' || part === 'del') {
      formatted = 'Del';
      width = 5;
    } else if (part === 'tab') {
      formatted = 'Tab';
      width = 5;
    } else if (part === 'space') {
      formatted = 'Space';
      width = 7;
    } else if (part === 'uparrow' || part === 'up') {
      formatted = '↑';
      width = 3;
    } else if (part === 'downarrow' || part === 'down') {
      formatted = '↓';
      width = 3;
    } else if (part === 'leftarrow' || part === 'left') {
      formatted = '←';
      width = 3;
    } else if (part === 'rightarrow' || part === 'right') {
      formatted = '→';
      width = 3;
    } else if (part === 'pageup' || part === 'pgup') {
      formatted = 'PgUp';
      width = 6;
    } else if (part === 'pagedown' || part === 'pgdown') {
      formatted = 'PgDn';
      width = 6;
    } else if (part === 'home') {
      formatted = 'Home';
      width = 6;
    } else if (part === 'end') {
      formatted = 'End';
      width = 5;
    } else if (/^f([1-9]|1[0-2])$/.test(part)) {
      formatted = part.toUpperCase();
      width = 3;
    } else {
      formatted = part === '?' ? '?' : part.toUpperCase();
      width = 3;
    }

    return { formatted, width };
  });

  return (
    <Box flexDirection="row" gap={0}>
      {keys.map((key, index) => (
        <Box
          key={index}
          borderStyle="single"
          borderColor="gray"
          width={key.width}
          justifyContent="center"
        >
          <Text color="gray">{key.formatted}</Text>
        </Box>
      ))}
      <Text> • {description}</Text>
    </Box>
  );
});

KeyboardHint.displayName = 'KeyboardHint';
