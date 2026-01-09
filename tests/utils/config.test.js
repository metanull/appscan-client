import { describe, it, expect, vi } from 'vitest';
import Config from '../../src/utils/config.js';
import fs from 'fs';

describe('Config', () => {
  it('reads environment variables and validates', () => {
    process.env.APPSCAN_API_KEY = 'k';
    process.env.APPSCAN_API_SECRET = 's';
    const cfg = new Config();
    expect(cfg.isValid()).toBe(true);
    delete process.env.APPSCAN_API_KEY;
    delete process.env.APPSCAN_API_SECRET;
  });

  it('loadFromFile merges values from file', () => {
    const tmp = './tmp-test-config.json';
    fs.writeFileSync(tmp, JSON.stringify({ apiKey: 'a', apiSecret: 'b' }));
    const c = Config.loadFromFile(tmp);
    expect(c.getApiKey()).toBe('a');
    fs.unlinkSync(tmp);
  });
});
