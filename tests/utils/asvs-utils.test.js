import { describe, it, expect } from 'vitest';
import { createAVSComment, parseAVSFromComments, hasAVSControl } from '../../src/utils/asvs-utils.js';

describe('asvs-utils', () => {
  it('creates formatted comment', () => {
    expect(createAVSComment('asvs1.2', 'https://confluence/x')).toBe(
      '[ASVS:asvs1.2:https://confluence/x]'
    );
  });

  it('parses comments array', () => {
    const comments = [
      { Comment: 'foo' },
      { Comment: "Something [ASVS:label:https://u] here" },
    ];

    expect(parseAVSFromComments(comments)).toEqual({
      label: 'label',
      url: 'https://u',
    });
  });

  it('returns null when no asvs', () => {
    expect(parseAVSFromComments([])).toBeNull();
  });

  it('detects asvs control on issue', () => {
    expect(hasAVSControl({ comments: [{ Comment: '[ASVS:a:b]' }] })).toBe(true);
    expect(hasAVSControl({ comments: [] })).toBe(false);
  });
});
