import { describe, it, expect } from 'vitest';
import {
  parseCommaSeparated,
  extractShortPath,
} from '../../src/utils/cli-common.js';

describe('parseCommaSeparated', () => {
  it('returns empty array for falsy or empty markers', () => {
    expect(parseCommaSeparated()).toEqual([]);
    expect(parseCommaSeparated('""')).toEqual([]);
    expect(parseCommaSeparated("''")).toEqual([]);
  });

  it('parses comma separated values and trims them', () => {
    expect(parseCommaSeparated('a,b,c')).toEqual(['a', 'b', 'c']);
    expect(parseCommaSeparated(' a , b , ')).toEqual(['a', 'b']);
  });
});

describe('extractShortPath', () => {
  it('returns N/A for empty input', () => {
    expect(extractShortPath()).toBe('N/A');
    expect(extractShortPath('')).toBe('N/A');
  });

  it('extracts path from query param and returns last three segments when long', () => {
    expect(extractShortPath('?path=/a/b/c/d')).toBe('b/c/d');
    expect(
      extractShortPath('https://example.com/path/one/two/three/four')
    ).toBe('two/three/four');
  });

  it('returns full path when short', () => {
    // For absolute URLs, the host is included in the returned label
    expect(extractShortPath('https://example.com/a/b')).toBe('example.com/a/b');
    expect(extractShortPath('/x/y')).toBe('x/y');
  });
});
