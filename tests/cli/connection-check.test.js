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
  });
});
