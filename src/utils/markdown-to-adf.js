/**
 * Markdown to Atlassian Document Format (ADF) converter
 * Uses marked library for consistent markdown parsing with MarkdownBox
 */

/**
 * Convert markdown tokens to ADF document
 * @param {Array} tokens - Marked tokens
 * @returns {Object} - ADF document structure
 */
export function markdownToADF(tokens) {
  const content = [];

  for (const token of tokens) {
    const adfNode = tokenToADF(token);
    if (adfNode) {
      if (Array.isArray(adfNode)) {
        content.push(...adfNode);
      } else {
        content.push(adfNode);
      }
    }
  }

  return {
    version: 1,
    type: 'doc',
    content,
  };
}

/**
 * Convert a single token to ADF node(s)
 * @private
 */
function tokenToADF(token) {
  switch (token.type) {
    case 'heading':
      return {
        type: 'heading',
        attrs: { level: Math.min(token.depth, 6) },
        content: inlineTokensToADF(token.tokens),
      };

    case 'paragraph':
      return {
        type: 'paragraph',
        content: inlineTokensToADF(token.tokens),
      };

    case 'list':
      return {
        type: token.ordered ? 'orderedList' : 'bulletList',
        content: token.items.map((item) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: inlineTokensToADF(item.tokens),
            },
          ],
        })),
      };

    case 'code':
      return {
        type: 'codeBlock',
        attrs: {
          language: token.lang || 'text',
        },
        content: [
          {
            type: 'text',
            text: token.text,
          },
        ],
      };

    case 'blockquote':
      return {
        type: 'blockquote',
        content: token.tokens.map(tokenToADF).filter(Boolean),
      };

    case 'hr':
      return {
        type: 'rule',
      };

    case 'table':
      return {
        type: 'table',
        attrs: { isNumberColumnEnabled: false, layout: 'default' },
        content: [
          // Header row
          {
            type: 'tableRow',
            content: token.header.map((cell) => ({
              type: 'tableHeader',
              content: [
                {
                  type: 'paragraph',
                  content: inlineTokensToADF(cell.tokens),
                },
              ],
            })),
          },
          // Body rows
          ...token.rows.map((row) => ({
            type: 'tableRow',
            content: row.map((cell) => ({
              type: 'tableCell',
              content: [
                {
                  type: 'paragraph',
                  content: inlineTokensToADF(cell.tokens),
                },
              ],
            })),
          })),
        ],
      };

    case 'space':
      return null; // Skip empty space tokens

    default:
      // Unknown token type - try to extract text
      if (token.text) {
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: token.text }],
        };
      }
      return null;
  }
}

/**
 * Convert inline tokens (bold, italic, links, etc.) to ADF content
 * @private
 */
function inlineTokensToADF(tokens) {
  if (!tokens || tokens.length === 0) {
    return [{ type: 'text', text: '' }];
  }

  const content = [];

  for (const token of tokens) {
    const adfNode = inlineTokenToADF(token);
    if (adfNode) {
      if (Array.isArray(adfNode)) {
        content.push(...adfNode);
      } else {
        content.push(adfNode);
      }
    }
  }

  return content.length > 0 ? content : [{ type: 'text', text: '' }];
}

/**
 * Convert a single inline token to ADF
 * @private
 */
function inlineTokenToADF(token) {
  switch (token.type) {
    case 'text':
      return {
        type: 'text',
        text: token.text,
      };

    case 'strong':
      return {
        type: 'text',
        text: extractText(token),
        marks: [{ type: 'strong' }],
      };

    case 'em':
      return {
        type: 'text',
        text: extractText(token),
        marks: [{ type: 'em' }],
      };

    case 'codespan':
      return {
        type: 'text',
        text: token.text,
        marks: [{ type: 'code' }],
      };

    case 'link':
      return {
        type: 'text',
        text: extractText(token),
        marks: [
          {
            type: 'link',
            attrs: {
              href: token.href,
              title: token.title || null,
            },
          },
        ],
      };

    case 'del':
      return {
        type: 'text',
        text: extractText(token),
        marks: [{ type: 'strike' }],
      };

    case 'br':
      return {
        type: 'hardBreak',
      };

    default:
      // Fallback: try to extract text
      const text = extractText(token);
      if (text) {
        return {
          type: 'text',
          text,
        };
      }
      return null;
  }
}

/**
 * Extract plain text from token recursively
 * @private
 */
function extractText(token) {
  if (typeof token === 'string') return token;
  if (token.text) return token.text;
  if (token.tokens) {
    return token.tokens.map(extractText).join('');
  }
  return '';
}

export default markdownToADF;
