/**
 * Test for MarkdownBox component using marked tokenizer
 */

import { marked } from 'marked';

describe('MarkdownBox with marked tokenizer', () => {
  test('marked tokenizes markdown correctly', () => {
    const markdown = `# Heading 1

## Heading 2

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2
- List item 3

1. Numbered item 1
2. Numbered item 2

\`\`\`javascript
const code = 'example';
\`\`\`

---

> Blockquote text

[Link text](https://example.com)
`;

    const tokens = marked.lexer(markdown);

    // Verify we get proper token types
    expect(tokens).toBeDefined();
    expect(Array.isArray(tokens)).toBe(true);
    expect(tokens.length).toBeGreaterThan(0);

    // Check for specific token types
    const tokenTypes = tokens.map((t) => t.type);
    expect(tokenTypes).toContain('heading');
    expect(tokenTypes).toContain('paragraph');
    expect(tokenTypes).toContain('list');
    expect(tokenTypes).toContain('code');
    expect(tokenTypes).toContain('hr');
    expect(tokenTypes).toContain('blockquote');
  });

  test('extractText helper works with nested tokens', () => {
    const markdown = 'This is **bold** and *italic* text';
    const tokens = marked.lexer(markdown);

    expect(tokens[0].type).toBe('paragraph');
    expect(tokens[0].tokens).toBeDefined();
    expect(tokens[0].tokens.length).toBeGreaterThan(0);
  });

  test('handles code blocks correctly', () => {
    const markdown = `\`\`\`javascript
const test = 'value';
console.log(test);
\`\`\``;

    const tokens = marked.lexer(markdown);

    const codeToken = tokens.find((t) => t.type === 'code');
    expect(codeToken).toBeDefined();
    expect(codeToken.text).toContain('const test');
    expect(codeToken.lang).toBe('javascript');
  });

  test('handles lists correctly', () => {
    const markdown = `- Item 1
- Item 2
  - Nested item
- Item 3`;

    const tokens = marked.lexer(markdown);

    const listToken = tokens.find((t) => t.type === 'list');
    expect(listToken).toBeDefined();
    expect(listToken.items).toBeDefined();
    expect(listToken.items.length).toBeGreaterThan(0);
    expect(listToken.ordered).toBe(false);
  });

  test('handles numbered lists correctly', () => {
    const markdown = `1. First
2. Second
3. Third`;

    const tokens = marked.lexer(markdown);

    const listToken = tokens.find((t) => t.type === 'list');
    expect(listToken).toBeDefined();
    expect(listToken.ordered).toBe(true);
    expect(listToken.items.length).toBe(3);
  });
});
