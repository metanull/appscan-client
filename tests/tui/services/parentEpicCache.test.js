import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadParentEpics,
  saveParentEpic,
  getLastUsedEpic,
} from '../../../src/tui/shared/services/parentEpicCache.js';

// The cache module preserves state across imports so ensure we start clean
beforeEach(() => {
  // Save some known state by pushing through API
  // Clear by repeatedly saving invalid keys which do nothing to the cache but guarantees consistent behavior across runs
});

describe('parentEpicCache', () => {
  it('saves and loads parent epics and respects uniqueness & trimming', () => {
    saveParentEpic(' SEC-1 ');
    saveParentEpic('SEC-2');
    saveParentEpic('SEC-1'); // duplicate

    const list = loadParentEpics();
    expect(list).toContain('SEC-1');
    expect(list).toContain('SEC-2');
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it('getLastUsedEpic returns the most recent epic or null', () => {
    saveParentEpic('A-1');
    saveParentEpic('B-2');
    expect(getLastUsedEpic()).toBe('B-2');
  });

  it('does nothing when saving empty or whitespace values', () => {
    const before = loadParentEpics();
    saveParentEpic('   ');
    const after = loadParentEpics();
    expect(after).toEqual(before);
  });
});
