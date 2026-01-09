import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle, debounceAsync } from '../../src/utils/debounce.js';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls function after delay with last arguments', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d(1);
    d(2);
    d(3);

    // Not called yet
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('cancel prevents call', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d('x');
    d.cancel();
    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();
  });
});

describe('throttle', () => {
  it('limits calls during the limit window', () => {
    vi.useFakeTimers();
    const fn = vi.fn((x) => x + 1);
    const t = throttle(fn, 100);

    const r1 = t(1);
    const r2 = t(2);
    vi.advanceTimersByTime(50);
    const r3 = t(3);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(r1).toBe(2);
    expect(r2).toBe(2);
    expect(r3).toBe(2);

    vi.advanceTimersByTime(100);
    const r4 = t(4);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(r4).toBe(5);
    vi.useRealTimers();
  });
});

describe('debounceAsync', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('resolves with async function result and debounces', async () => {
    const fn = vi.fn(async (v) => v * 2);
    const d = debounceAsync(fn, 100);

    const p1 = d(2);
    const p2 = d(3);

    // Advance timers to trigger
    // Run timers including async microtasks
    await vi.runAllTimersAsync();

    const r1 = await p1;
    const r2 = await p2;

    expect(fn).toHaveBeenCalledTimes(1);
    expect(r1).toBe(6);
    expect(r2).toBe(6);
  });
});
