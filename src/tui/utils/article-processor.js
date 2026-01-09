/**
 * Article processing utilities
 * Handles sanitization and conversion of HTML articles to Markdown
 */

import sanitizeHtml from 'sanitize-html';
import TurndownService from 'turndown';
import cliMarkdown from 'cli-markdown';

/**
 * Sanitize HTML article removing scripts, styles, and images
 * @param {string} htmlContent - HTML to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeArticle(htmlContent) {
  if (!htmlContent) return '';

  const cleanHtml = sanitizeHtml(htmlContent, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ]),
    allowedAttributes: {
      a: ['href'],
    },
    disallowedTagsMode: 'discard',
    exclusiveFilter: (frame) => {
      return (
        frame.tag === 'img' || frame.tag === 'script' || frame.tag === 'style'
      );
    },
  });

  return cleanHtml;
}

/**
 * Convert HTML to Markdown with console-friendly link format
 * @param {string} htmlContent - HTML to convert
 * @returns {string} Markdown text
 */
export function htmlToMarkdown(htmlContent) {
  if (!htmlContent) return '';

  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  // Custom rule to preserve URLs in a console-friendly format
  turndown.addRule('links', {
    filter: 'a',
    replacement: function (content, node) {
      const href = node.getAttribute('href');
      if (!href) return content;

      // For console, show both text and URL
      if (content && content !== href) {
        return `${content} (${href})`;
      }
      return href;
    },
  });

  return turndown.turndown(htmlContent);
}

/**
 * Render Markdown with terminal formatting (colors, styles)
 * @param {string} markdown - Markdown to render
 * @returns {string} Styled text for terminal
 */
export function renderMarkdown(markdown) {
  if (!markdown) return '';

  try {
    // cli-markdown can fail on certain markdown, use with caution
    const rendered = cliMarkdown(markdown);
    // If it returns the same as input, it might have failed
    return rendered;
  } catch {
    // If rendering fails, return markdown with manual formatting
    return markdown;
  }
}

/**
 * Process HTML article for terminal display (sanitize → markdown → render)
 * @param {string} htmlContent - HTML article content
 * @returns {string} Terminal-ready formatted text
 */
export function processArticle(htmlContent) {
  if (!htmlContent) return '';

  const sanitized = sanitizeArticle(htmlContent);
  const markdown = htmlToMarkdown(sanitized);
  const rendered = renderMarkdown(markdown);

  return rendered;
}

/**
 * Truncate text with ellipsis if exceeds max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string} Truncated text with ... if needed
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export default {
  sanitizeArticle,
  htmlToMarkdown,
  renderMarkdown,
  processArticle,
  truncateText,
};
