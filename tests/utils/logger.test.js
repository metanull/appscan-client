import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import logger from '../../src/utils/logger.js';
import fs from 'fs';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(fs, 'appendFileSync').mockImplementation(() => {});
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('error writes and returns formatted message', () => {
    const res = logger.error('boom', new Error('x'), { a: 1 });
    expect(res).toContain('[ERROR]');
    expect(fs.appendFileSync).toHaveBeenCalled();
  });

  it('warn writes and returns formatted message', () => {
    const res = logger.warn('msg');
    expect(res).toContain('[WARN]');
    expect(fs.appendFileSync).toHaveBeenCalled();
  });

  it('debug calls debug callback and may not log to console by default', () => {
    const cb = vi.fn();
    logger.setDebugCallback(cb);
    const res = logger.debug('d');
    expect(cb).toHaveBeenCalled();
    expect(res).toContain('[DEBUG]');
    logger.setDebugCallback(null);
  });

  it('clearLogs writes file and calls info', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    logger.clearLogs();
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
  });
});
