import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cliOutput } from '../../src/utils/cli-output.js';
import logger from '../../src/utils/logger.js';

describe('cli-output', () => {
  let origJson;

  beforeEach(() => {
    origJson = cliOutput.jsonMode;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cliOutput.jsonMode = origJson;
    vi.restoreAllMocks();
  });

  it('status/success suppressed in json mode', () => {
    cliOutput.setJsonMode(true);
    cliOutput.status('s');
    cliOutput.success('ok');
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('s'));
  });

  it('warning logs and prints when not json', () => {
    cliOutput.setJsonMode(false);
    cliOutput.warning('warn');
    expect(logger.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('error always logs and prints', () => {
    cliOutput.setJsonMode(true);
    cliOutput.error('bad', new Error('x'));
    expect(logger.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('result and json output go to stdout', () => {
    cliOutput.result('r');
    cliOutput.json({ a: 1 }, 2);
    expect(console.log).toHaveBeenCalled();
  });
});
