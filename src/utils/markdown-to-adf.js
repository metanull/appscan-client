/**
 * Markdown to Atlassian Document Format (ADF) converter
 * Uses marked library for consistent markdown parsing with MarkdownBox
 * 
 * Based on official Atlassian ADF documentation:
 * https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
 * 
 * Key ADF rules enforced:
 * - text nodes must not be empty (must have non-empty text property)
 * - paragraph can have zero or more inline nodes
 * - listItem must contain at least one: paragraph, bulletList, orderedList, codeBlock
 * - codeBlock content must be text nodes WITHOUT marks
 * - table cells require attrs object (can be empty {})
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

  // Ensure we always have content (doc requires at least one top-level block)
  if (content.length === 0) {
    content.push({
      type: 'paragraph',
      content: [],
    });
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
    case 'heading': {
      const content = inlineTokensToADF(token.tokens || []);
      return {
        type: 'heading',
        attrs: { level: Math.min(Math.max(token.depth, 1), 6) },
        content,
      };
    }

    case 'paragraph': {
      const content = inlineTokensToADF(token.tokens || []);
      return {
        type: 'paragraph',
        content, // Can be empty per docs
      };
    }

    case 'text':
      // Block-level text token (e.g., in list items) may have nested inline tokens
      if (token.tokens && token.tokens.length > 0) {
        const content = inlineTokensToADF(token.tokens);
        return {
          type: 'paragraph',
          content,
        };
      }
      // Fallback: plain text (only if non-empty)
      if (token.text && token.text.trim().length > 0) {
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: token.text }],
        };
      }
      return null;

    case 'list': {
      const items = token.items.map((item) => listItemToADF(item)).filter(Boolean);
      if (items.length === 0) return null;
      
      return {
        type: token.ordered ? 'orderedList' : 'bulletList',
        content: items,
      };
    }

    case 'code':
      // codeBlock content must be text nodes WITHOUT marks
      if (!token.text || token.text.length === 0) return null;
      return {
        type: 'codeBlock',
        attrs: {
          language: token.lang || 'text',
        },
        content: [
          {
            type: 'text',
            text: token.text, // Preserve original text including newlines
          },
        ],
      };

    case 'blockquote': {
      const quoteContent = [];
      for (const t of token.tokens || []) {
        const node = tokenToADF(t);
        if (node) {
          if (Array.isArray(node)) {
            quoteContent.push(...node);
          } else {
            quoteContent.push(node);
          }
        }
      }
      // blockquote must have content
      if (quoteContent.length === 0) {
        quoteContent.push({ type: 'paragraph', content: [] });
      }
      return {
        type: 'blockquote',
        content: quoteContent,
      };
    }

    case 'hr':
      return {
        type: 'rule',
      };

    case 'table':
      return tableToADF(token);

    case 'space':
      return null; // Skip empty space tokens

    default:
      // Unknown token type - try to handle gracefully
      if (token.text && token.text.trim().length > 0) {
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: token.text }],
        };
      }
      return null;
  }
}

/**
 * Convert list item to ADF listItem node
 * Per docs: listItem must contain at least one of: paragraph, bulletList, orderedList, codeBlock, mediaSingle
 * @private
 */
function listItemToADF(item) {
  const itemContent = [];
  
  if (item.tokens && item.tokens.length > 0) {
    // Convert all tokens in the list item
    for (const subToken of item.tokens) {
      const adfNode = tokenToADF(subToken);
      if (adfNode) {
        if (Array.isArray(adfNode)) {
          itemContent.push(...adfNode);
        } else {
          itemContent.push(adfNode);
        }
      }
    }
  }
  
  // listItem must have at least one valid node
  if (itemContent.length === 0) {
    // Fallback: try to get text from item
    const text = item.text || extractText(item);
    if (text && text.trim().length > 0) {
      itemContent.push({
        type: 'paragraph',
        content: [{ type: 'text', text }],
      });
    } else {
      // Last resort: empty paragraph
      itemContent.push({
        type: 'paragraph',
        content: [],
      });
    }
  }
  
  return {
    type: 'listItem',
    content: itemContent,
  };
}

/**
 * Convert table token to ADF table node
 * Per docs: table cells require attrs object, tableRow contains tableHeader or tableCell
 * @private
 */
function tableToADF(token) {
  const rows = [];
  
  // Header row
  if (token.header && token.header.length > 0) {
    rows.push({
      type: 'tableRow',
      content: token.header.map((cell) => ({
        type: 'tableHeader',
        attrs: {}, // Required per docs
        content: [
          {
            type: 'paragraph',
            content: inlineTokensToADF(cell.tokens || []),
          },
        ],
      })),
    });
  }
  
  // Body rows
  if (token.rows && token.rows.length > 0) {
    for (const row of token.rows) {
      rows.push({
        type: 'tableRow',
        content: row.map((cell) => ({
          type: 'tableCell',
          attrs: {}, // Required per docs
          content: [
            {
              type: 'paragraph',
              content: inlineTokensToADF(cell.tokens || []),
            },
          ],
        })),
      });
    }
  }
  
  // Table must have at least one row
  if (rows.length === 0) return null;
  
  return {
    type: 'table',
    attrs: { 
      isNumberColumnEnabled: false, 
      layout: 'default' 
    },
    content: rows,
  };
}

/**
 * Convert inline tokens (bold, italic, links, etc.) to ADF content
 * Returns array of inline nodes (text, hardBreak, etc.)
 * @private
 */
function inlineTokensToADF(tokens) {
  if (!tokens || tokens.length === 0) {
    return []; // Empty array is valid for paragraph content
  }

  const content = [];

  for (const token of tokens) {
    const adfNodes = inlineTokenToADF(token);
    if (adfNodes) {
      if (Array.isArray(adfNodes)) {
        content.push(...adfNodes);
      } else {
        content.push(adfNodes);
      }
    }
  }

  return content;
}

/**
 * Convert a single inline token to ADF node(s)
 * Returns text node with optional marks, or hardBreak node
 * @private
 */
function inlineTokenToADF(token) {
  switch (token.type) {
    case 'text': {
      // text node must not be empty per docs
      if (!token.text || token.text.length === 0) return null;
      return {
        type: 'text',
        text: token.text,
      };
    }

    case 'strong': {
      const text = extractText(token);
      if (!text || text.length === 0) return null;
      return {
        type: 'text',
        text,
        marks: [{ type: 'strong' }],
      };
    }

    case 'em': {
      const text = extractText(token);
      if (!text || text.length === 0) return null;
      return {
        type: 'text',
        text,
        marks: [{ type: 'em' }],
      };
    }

    case 'codespan': {
      if (!token.text || token.text.length === 0) return null;
      return {
        type: 'text',
        text: token.text,
        marks: [{ type: 'code' }],
      };
    }

    case 'link': {
      const text = extractText(token);
      if (!text || text.length === 0) return null;
      return {
        type: 'text',
        text,
        marks: [
          {
            type: 'link',
            attrs: {
              href: token.href,
            },
          },
        ],
      };
    }

    case 'del': {
      const text = extractText(token);
      if (!text || text.length === 0) return null;
      return {
        type: 'text',
        text,
        marks: [{ type: 'strike' }],
      };
    }

    case 'br':
      return {
        type: 'hardBreak',
      };

    default:
      // Fallback: try to extract text
      const text = extractText(token);
      if (text && text.length > 0) {
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
