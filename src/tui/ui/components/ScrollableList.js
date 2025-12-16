/**
 * ScrollableList component
 * Virtual scrolling list that only renders visible items
 * Handles cursor navigation
 */

import React, { useMemo } from 'react';
import { Box, Text } from 'ink';

export const ScrollableList = React.memo(({ 
  items,
  cursor,
  renderItem,
  visibleRows = 10,
  onCursorChange: _onCursorChange,
  emptyMessage = 'No items',
}) => {
  // Calculate visible window
  const { startIndex, visibleItems } = useMemo(() => {
    if (!items || items.length === 0) {
      return { startIndex: 0, visibleItems: [] };
    }

    // Calculate the visible window
    const halfWindow = Math.floor(visibleRows / 2);
    let start = Math.max(0, cursor - halfWindow);
    const end = Math.min(items.length, start + visibleRows);

    // Adjust start if we're near the end
    if (end - start < visibleRows && items.length >= visibleRows) {
      start = Math.max(0, end - visibleRows);
    }

    const visible = items.slice(start, end);

    return { 
      startIndex: start, 
      visibleItems: visible 
    };
  }, [items, cursor, visibleRows]);

  if (!items || items.length === 0) {
    return (
      <Box>
        <Text dimColor>{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {visibleItems.map((item, index) => {
        const actualIndex = startIndex + index;
        const isSelected = actualIndex === cursor;
        
        return (
          <Box key={item.id || item.Id || actualIndex}>
            {renderItem(item, isSelected, actualIndex)}
          </Box>
        );
      })}
    </Box>
  );
});

ScrollableList.displayName = 'ScrollableList';
