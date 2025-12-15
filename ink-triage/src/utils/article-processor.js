/**
 * Article processing utilities
 * Handles sanitization and conversion of HTML articles to Markdown
 */

import sanitizeHtml from 'sanitize-html';
import TurndownService from 'turndown';
import cliMarkdown from 'cli-markdown';

/**
 * Sanitize HTML article content
 * Removes scripts, styles, images, and other potentially harmful content
 */
export function sanitizeArticle(htmlContent) {
  if (!htmlContent) return '';

  const cleanHtml = sanitizeHtml(htmlContent, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
    allowedAttributes: {
      a: ['href'],
    },
    disallowedTagsMode: 'discard',
    exclusiveFilter: (frame) => {
      return frame.tag === 'img' || frame.tag === 'script' || frame.tag === 'style';
    },
  });

  return cleanHtml;
}

/**
 * Convert HTML to Markdown
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
 * Render Markdown for terminal display
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
 * Process article HTML for terminal display
 * Full pipeline: sanitize → convert to markdown → render for terminal
 */
export function processArticle(htmlContent) {
  if (!htmlContent) return '';

  const sanitized = sanitizeArticle(htmlContent);
  const markdown = htmlToMarkdown(sanitized);
  const rendered = renderMarkdown(markdown);

  return rendered;
}

/**
 * Truncate text to a maximum length
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
