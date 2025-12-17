/**
 * MarkdownBox
 * Reusable component for displaying markdown content with scrolling support
 */

import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

// Parse markdown line for TUI display
const parseMarkdownLine = (line) => {
  const trimmed = line.trim();

  // Headings
  if (trimmed.startsWith('##### ')) {
    return {
      type: 'h5',
      text: trimmed.substring(6),
      color: 'white',
      bold: true,
    };
  }
  if (trimmed.startsWith('#### ')) {
    return {
      type: 'h4',
      text: trimmed.substring(5),
      color: 'blue',
      bold: false,
    };
  }
  if (trimmed.startsWith('### ')) {
    return {
      type: 'h3',
      text: trimmed.substring(4),
      color: 'blue',
      bold: true,
    };
  }
  if (trimmed.startsWith('## ')) {
    return {
      type: 'h2',
      text: trimmed.substring(3),
      color: 'cyan',
      bold: true,
    };
  }
  if (trimmed.startsWith('# ')) {
    return {
      type: 'h1',
      text: trimmed.substring(2),
      color: 'cyan',
      bold: true,
    };
  }

  // Horizontal rule
  if (trimmed.match(/^[-*_]{3,}$/)) {
    return { type: 'hr', text: '─'.repeat(60), color: 'gray' };
  }

  // List items
  if (trimmed.match(/^[\s]*[-*+]\s/)) {
    return {
      type: 'list',
      text: line.replace(/^(\s*)[-*+]\s/, '$1• '),
      color: 'white',
    };
  }

  // Numbered list
  if (trimmed.match(/^\d+\.\s/)) {
    return { type: 'list', text: line, color: 'white' };
  }

  // Code fence
  if (trimmed.startsWith('```')) {
    return { type: 'code-fence', text: trimmed };
  }

  // Empty line
  if (!trimmed) {
    return { type: 'empty', text: '' };
  }

  // Regular text
  return { type: 'text', text: line, color: 'white' };
};

export const MarkdownBox = React.memo(
  ({ markdown, maxHeight, enableScrolling = true }) => {
    const [scrollOffset, setScrollOffset] = useState(0);
    const { height: terminalHeight } = useTerminalSize();

    // Parse markdown into renderable elements
    const elements = useMemo(() => {
      if (!markdown) return [];

      const lines = markdown.split('\n');
      const parsed = [];
      let inCodeBlock = false;

      for (const line of lines) {
        const trimmed = line.trim();

        // Handle code fences
        if (trimmed.startsWith('```')) {
          if (!inCodeBlock) {
            parsed.push({
              type: 'code-fence-start',
              text: '╭─ Code ─────────────────────',
              color: 'gray',
            });
            inCodeBlock = true;
          } else {
            parsed.push({
              type: 'code-fence-end',
              text: '╰────────────────────────────',
              color: 'gray',
            });
            inCodeBlock = false;
          }
          continue;
        }

        // Inside code block
        if (inCodeBlock) {
          parsed.push({ type: 'code', text: line, color: 'gray' });
          continue;
        }

        // Parse markdown
        parsed.push(parseMarkdownLine(line));
      }

      return parsed;
    }, [markdown]);

    // Calculate visible height
    const visibleLines = maxHeight || Math.max(15, terminalHeight - 10);

    // Handle scrolling
    useInput(
      (input, key) => {
        if (!enableScrolling) return;

        if (key.upArrow) {
          setScrollOffset((prev) => Math.max(0, prev - 1));
          return;
        }

        if (key.downArrow) {
          setScrollOffset((prev) =>
            Math.min(elements.length - visibleLines, prev + 1)
          );
          return;
        }

        if (key.pageUp) {
          setScrollOffset((prev) => Math.max(0, prev - visibleLines));
          return;
        }

        if (key.pageDown) {
          setScrollOffset((prev) =>
            Math.min(elements.length - visibleLines, prev + visibleLines)
          );
          return;
        }
      },
      { isActive: enableScrolling }
    );

    // Get visible slice
    const visibleElements = elements.slice(
      scrollOffset,
      scrollOffset + visibleLines
    );

    return (
      <Box flexDirection="column">
        {visibleElements.map((element, index) => {
          const key = scrollOffset + index;

          if (element.type === 'empty') {
            return <Text key={key}> </Text>;
          }

          if (
            element.type === 'code-fence-start' ||
            element.type === 'code-fence-end'
          ) {
            return (
              <Text key={key} color={element.color} dimColor>
                {element.text}
              </Text>
            );
          }

          if (element.type === 'code') {
            return (
              <Text key={key} color={element.color} dimColor>
                {element.text}
              </Text>
            );
          }

          if (element.type === 'hr') {
            return (
              <Text key={key} color={element.color}>
                {element.text}
              </Text>
            );
          }

          return (
            <Text
              key={key}
              color={element.color}
              bold={element.bold}
              dimColor={!element.text.trim()}
            >
              {element.text}
            </Text>
          );
        })}

        {enableScrolling && elements.length > visibleLines && (
          <Box marginTop={1}>
            <Text dimColor>
              Line {scrollOffset + 1}/{elements.length} (↑/↓: Scroll |
              PgUp/PgDn: Page)
            </Text>
          </Box>
        )}
      </Box>
    );
  }
);

MarkdownBox.displayName = 'MarkdownBox';
