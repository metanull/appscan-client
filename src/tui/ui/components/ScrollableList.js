/**
 * ScrollableList component
 * Virtual scrolling list that only renders visible items
 * Handles cursor navigation
 */

import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import logger from '../../utils/logger.js';

export const ScrollableList = React.memo(
  ({
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
        visibleItems: visible,
      };
    }, [items, cursor, visibleRows]);

    if (!items || items.length === 0) {
      return (
        <Box>
          <Text dimColor>{emptyMessage}</Text>
        </Box>
      );
    }

    const debugList = process.env.TUI_DEBUG_LIST === '1';

    if (
      process.env.TUI_DEBUG_LIST === '1' ||
      process.env.TUI_ALWAYS_DEBUG_LIST === '1'
    ) {
      // Print diagnostics to console for troubleshooting vertical overlap
      try {
        const rows = visibleItems.map((it, idx) => {
          const actualIndex = startIndex + idx;
          const name = (it && (it.Name || it.name)) || String(it || '');
          return { index: actualIndex, name, id: it?.Id || it?.id };
        });
        logger.info('[ScrollableList] debug', {
          itemsLength: items.length,
          startIndex,
          visibleCount: visibleItems.length,
          visibleRows,
          rows,
        });
      } catch {
        // ignore
      }
    }

    return (
      <Box flexDirection="column">
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          const isSelected = actualIndex === cursor;

          return (
            <Box
              key={`${item?.Id || item?.id || ''}-${actualIndex}`}
              width="100%"
            >
              {debugList ? (
                <Box>
                  <Box width={4} marginRight={1}>
                    <Text dimColor>
                      #{String(actualIndex).padStart(2, '0')}
                    </Text>
                  </Box>
                  <Box flexGrow={1}>
                    {renderItem(item, isSelected, actualIndex)}
                  </Box>
                </Box>
              ) : (
                renderItem(item, isSelected, actualIndex)
              )}
            </Box>
          );
        })}
      </Box>
    );
  }
);

ScrollableList.displayName = 'ScrollableList';
