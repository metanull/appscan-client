/**
 * Layout component
 * Full-screen container with header and footer slots
 */

import React from 'react';
import { Box } from 'ink';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

export const Layout = React.memo(({ header, children, footer }) => {
  const { height } = useTerminalSize();

  return (
    <Box flexDirection="column" height={height}>
      {header && (
        <Box flexShrink={0}>
          {header}
        </Box>
      )}
      <Box flexGrow={1} flexDirection="column">
        {children}
      </Box>
      {footer && (
        <Box flexShrink={0}>
          {footer}
        </Box>
      )}
    </Box>
  );
});

Layout.displayName = 'Layout';
