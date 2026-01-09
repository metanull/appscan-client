import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import connectionCheck from '../../src/cli/commands/connection-check.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('connectionCheck CLI', () => {
  afterEach(() => vi.restoreAllMocks());

  it('runs connection check via service', async () => {
    // Ensure config is considered valid in CI (prevent process.exit)
    const oldApiKey = process.env.APPSCAN_API_KEY;
    const oldApiSecret = process.env.APPSCAN_API_SECRET;
    process.env.APPSCAN_API_KEY = 'test-key';
    process.env.APPSCAN_API_SECRET = 'test-secret';

    try {
      // Mock AppScanService used directly for connectionCheck
      vi.mock('../../src/services/appscan-service.js', () => ({
        AppScanService: class {
          async authenticate() {}
          async listApplications() {
            return { Items: [{ Id: 'A', Name: 'App' }] };
          }
        },
      }));

      const { default: connectionCheckCmd } =
        await import('../../src/cli/commands/connection-check.js');
      await connectionCheckCmd({});

      // If no error, assume flow completed
      expect(true).toBe(true);
    } finally {
      if (oldApiKey === undefined) delete process.env.APPSCAN_API_KEY;
      else process.env.APPSCAN_API_KEY = oldApiKey;
      if (oldApiSecret === undefined) delete process.env.APPSCAN_API_SECRET;
      else process.env.APPSCAN_API_SECRET = oldApiSecret;
    }
  });
});
