import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useKeyboardManager, KeyboardMode } from '../utils/KeyboardManager.js';

/**
 * Full-screen text input page replacing entire UI to avoid rendering lag
 * Used for collecting text input without interference from background components
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the input page
 * @param {string} props.subtitle - Subtitle/context information
 * @param {string} props.borderColor - Border color (green, yellow, cyan, etc.)
 * @param {string} props.placeholder - Placeholder text for input
 * @param {string} props.initialValue - Initial value for input
 * @param {Function} props.onSubmit - Callback when user submits with Enter key
 * @param {Function} props.onCancel - Callback when user cancels with ESC key
 * @returns {JSX.Element}
 */
export const TextInputPage = React.memo(
  ({
    title,
    subtitle,
    borderColor = 'cyan',
    placeholder = 'Enter text...',
    initialValue = '',
    onSubmit,
    onCancel,
  }) => {
    const [value, setValue] = useState(initialValue);
    const { setKeyboardMode } = useKeyboardManager();

    useEffect(() => {
      setKeyboardMode(KeyboardMode.INPUT);

      return () => {
        setKeyboardMode(KeyboardMode.NORMAL);
      };
    }, [setKeyboardMode]);

    useInput((input, key) => {
      if (key.escape) {
        onCancel();
      }
    });

    const handleSubmit = () => {
      onSubmit(value);
    };

    return (
      <Box
        width="100%"
        height="100%"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          flexDirection="column"
          width="60%"
          borderStyle="double"
          borderColor={borderColor}
          paddingX={2}
          paddingY={1}
        >
          <Text bold color={borderColor}>
            {title}
          </Text>

          {subtitle && (
            <Text marginTop={1} dimColor>
              {subtitle}
            </Text>
          )}

          <Text dimColor marginTop={1}>
            Enter text (press Enter to submit):
          </Text>

          <Box marginTop={1}>
            <Text color="cyan">&gt; </Text>
            <TextInput
              value={value}
              onChange={setValue}
              onSubmit={handleSubmit}
              placeholder={placeholder}
            />
          </Box>

          <Box marginTop={1}>
            <Text dimColor>Press ESC to cancel</Text>
          </Box>
        </Box>
      </Box>
    );
  }
);

TextInputPage.displayName = 'TextInputPage';

export default TextInputPage;
