/**
 * MarkdownBox
 * Reusable component for displaying markdown content with scrolling support
 * Uses marked library for proper markdown tokenization
 */

import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { marked } from 'marked';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';

/**
 * Extract plain text from marked tokens (handles inline formatting)
 */
const extractText = (token) => {
  if (typeof token === 'string') return token;
  if (token.text) return token.text;
  if (token.tokens) return token.tokens.map(extractText).join('');
  return '';
};

/**
 * Convert marked tokens into renderable line elements
 */
const tokensToLines = (tokens) => {
  const lines = [];
  let lineCounter = 0;

  const addLine = (type, text, props = {}) => {
    lines.push({ id: lineCounter++, type, text, ...props });
  };

  const processToken = (token, depth = 0) => {
    const indent = '  '.repeat(depth);

    switch (token.type) {
      case 'heading':
        addLine(
          `h${token.depth}`,
          extractText(token),
          token.depth === 1
            ? { color: 'cyan', bold: true }
            : token.depth === 2
              ? { color: 'cyan', bold: true }
              : token.depth === 3
                ? { color: 'blue', bold: true }
                : token.depth === 4
                  ? { color: 'blue', bold: false }
                  : { color: 'white', bold: true }
        );
        addLine('space', '');
        break;

      case 'paragraph':
        if (token.tokens) {
          const text = extractText(token);
          if (text.trim()) {
            addLine('paragraph', text, { color: 'white' });
          }
        }
        addLine('space', '');
        break;

      case 'list': {
        const ordered = token.ordered;
        token.items.forEach((item, index) => {
          const prefix = ordered ? `${index + 1}. ` : '• ';
          const itemText = extractText(item);
          addLine('list-item', `${indent}${prefix}${itemText}`, {
            color: 'white',
          });

          // Handle nested lists
          if (item.tokens) {
            item.tokens.forEach((subToken) => {
              if (subToken.type === 'list') {
                processToken(subToken, depth + 1);
              }
            });
          }
        });
        addLine('space', '');
        break;
      }

      case 'code':
        addLine('code-fence-start', '╭─ Code ─────────────────────', {
          color: 'gray',
          dimColor: true,
        });
        token.text.split('\n').forEach((line) => {
          addLine('code', line, { color: 'gray', dimColor: true });
        });
        addLine('code-fence-end', '╰────────────────────────────', {
          color: 'gray',
          dimColor: true,
        });
        addLine('space', '');
        break;

      case 'blockquote':
        if (token.tokens) {
          token.tokens.forEach((subToken) => {
            const text = extractText(subToken);
            if (text.trim()) {
              addLine('blockquote', `│ ${text}`, {
                color: 'yellow',
                dimColor: true,
              });
            }
          });
        }
        addLine('space', '');
        break;

      case 'hr':
        addLine('hr', '─'.repeat(60), { color: 'gray' });
        addLine('space', '');
        break;

      case 'space':
        addLine('space', '');
        break;

      case 'text':
        // Standalone text (not in paragraph)
        if (token.text && token.text.trim()) {
          addLine('text', token.text, { color: 'white' });
        }
        break;

      default:
        // Handle other token types as plain text
        const text = extractText(token);
        if (text && text.trim()) {
          addLine('text', text, { color: 'white' });
        }
        break;
    }
  };

  tokens.forEach((token) => processToken(token));
  return lines;
};

export const MarkdownBox = React.memo(
  ({ markdown, maxHeight, enableScrolling = true, maxWidth }) => {
    const [scrollOffset, setScrollOffset] = useState(0);
    const { height: terminalHeight, width: terminalWidth } = useTerminalSize();

    // Parse markdown using marked tokenizer
    const elements = useMemo(() => {
      if (!markdown) return [];

      try {
        const tokens = marked.lexer(markdown);
        return tokensToLines(tokens);
      } catch {
        // Fallback to raw text if parsing fails
        return markdown.split('\n').map((line, index) => ({
          id: index,
          type: 'text',
          text: line,
          color: 'white',
        }));
      }
    }, [markdown]);

    // Calculate visible height
    const visibleLines = maxHeight || Math.max(15, terminalHeight - 10);

    // Calculate content width (90% of modal width minus padding)
    const contentWidth = maxWidth || Math.floor(terminalWidth * 0.9) - 10;

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
            Math.min(Math.max(0, elements.length - visibleLines), prev + 1)
          );
          return;
        }

        if (key.pageUp) {
          setScrollOffset((prev) => Math.max(0, prev - visibleLines));
          return;
        }

        if (key.pageDown) {
          setScrollOffset((prev) =>
            Math.min(
              Math.max(0, elements.length - visibleLines),
              prev + visibleLines
            )
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
      <Box flexDirection="column" width={contentWidth}>
        {visibleElements.map((element) => {
          if (element.type === 'space') {
            return <Text key={element.id}> </Text>;
          }

          return (
            <Text
              key={element.id}
              color={element.color}
              bold={element.bold}
              dimColor={element.dimColor}
              wrap="wrap"
            >
              {element.text}
            </Text>
          );
        })}

        {enableScrolling && elements.length > visibleLines && (
          <Box marginTop={1}>
            <Text dimColor wrap="wrap">
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
