import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ap from '../../src/tui/utils/article-processor.js';
import * as cliMarkdownModule from 'cli-markdown';

describe('article-processor', () => {
  it('sanitizeArticle removes scripts, styles and images', () => {
    const html =
      '<div><h1>Hi</h1><script>alert(1)</script><img src="x"/></div>';
    const clean = ap.sanitizeArticle(html);
    expect(clean).toContain('<h1>Hi</h1>');
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('<img');
  });

  it('htmlToMarkdown converts links to text (href) format and returns href when same', () => {
    const html =
      '<p><a href="https://ex">Link</a><a href="https://same">https://same</a></p>';
    const md = ap.htmlToMarkdown(html);
    expect(md).toContain('Link (https://ex)');
    expect(md).toContain('https://same');
  });

  it('renderMarkdown returns rendered value', () => {
    const res = ap.renderMarkdown('**x**');
    expect(typeof res).toBe('string');
  });

  it('processArticle chains sanitize->convert->render', () => {
    const html = '<div><h1>Title</h1><a href="/x">A</a></div>';
    const res = ap.processArticle(html);
    expect(res).toContain('Title');
  });

  it('truncateText truncates when longer than maxLength and leaves shorter text intact', () => {
    const t = 'a'.repeat(50);
    expect(ap.truncateText(t, 10)).toHaveLength(13); // 10 + '...'
    expect(ap.truncateText('short', 10)).toBe('short');
  });
});
