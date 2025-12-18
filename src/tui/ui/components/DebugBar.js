/**
 * DebugBar Component
 * Displays the last debug message from the logger
 * Only shown when debug mode is enabled
 */

import React from 'react';
import { Box, Text } from 'ink';

export const DebugBar = React.memo(({ message, visible = false }) => {
  if (!visible) {
    return null;
  }

  return (
    <Box
      width="100%"
      paddingX={1}
      paddingY={0}
      backgroundColor="yellow"
      borderTop
      height={2}
    >
      <Text color="black" wrap="wrap">
        {message || '[waiting for debug messages]'}
      </Text>
    </Box>
  );
});

DebugBar.displayName = 'DebugBar';

export default DebugBar;
