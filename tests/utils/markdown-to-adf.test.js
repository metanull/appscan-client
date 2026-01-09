import { describe, it, expect } from 'vitest';
import { markdownToADF } from '../../src/utils/markdown-to-adf.js';

describe('markdownToADF', () => {
  it('returns empty paragraph when no tokens', () => {
    const doc = markdownToADF([]);
    expect(doc).toHaveProperty('type', 'doc');
    expect(doc.content.length).toBeGreaterThan(0);
    expect(doc.content[0].type).toBe('paragraph');
  });

  it('converts heading and code tokens', () => {
    const tokens = [
      { type: 'heading', depth: 2, tokens: [{ type: 'text', text: 'Title' }] },
      { type: 'code', lang: 'js', text: "console.log('x')" },
    ];

    const doc = markdownToADF(tokens);
    expect(doc.content.some((n) => n.type === 'heading')).toBe(true);
    expect(doc.content.some((n) => n.type === 'codeBlock')).toBe(true);
  });
});
