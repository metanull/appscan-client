/**
 * Panel component
 * Bordered box with title
 */

import React from 'react';
import { Box, Text } from 'ink';

/**
 * Bordered panel container with optional title
 *
 * @param {Object} props
 * @param {string} [props.title] - Panel title
 * @param {JSX.Element} props.children - Panel content
 * @param {string} [props.borderColor='cyan'] - Border color
 * @param {string} [props.borderStyle='round'] - Border style
 * @param {boolean} [props.dimBorder=false] - Whether to dim the border
 * @param {Object} props.boxProps - Additional Box component props
 * @returns {JSX.Element}
 */
export const Panel = React.memo(
  ({
    title,
    children,
    borderColor = 'cyan',
    borderStyle = 'round',
    dimBorder = false,
    ...boxProps
  }) => {
    return (
      <Box
        flexDirection="column"
        borderStyle={borderStyle}
        borderColor={borderColor}
        paddingX={1}
        {...boxProps}
      >
        {title && (
          <Box marginBottom={0}>
            <Text bold color={borderColor} dimColor={dimBorder}>
              {title}
            </Text>
          </Box>
        )}
        <Box flexGrow={1} flexDirection="column">
          {children}
        </Box>
      </Box>
    );
  }
);

Panel.displayName = 'Panel';
