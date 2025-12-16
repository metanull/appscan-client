/**
 * Panel component
 * Bordered box with title
 */

import React from 'react';
import { Box, Text } from 'ink';

export const Panel = React.memo(({ 
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
});

Panel.displayName = 'Panel';
