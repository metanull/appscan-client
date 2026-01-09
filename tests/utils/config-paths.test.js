import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let cp;
let origArg1;

describe('config-paths', () => {
  beforeEach(() => {
    origArg1 = process.argv[1];
  });

  afterEach(() => {
    process.argv[1] = origArg1;
    vi.restoreAllMocks();
  });

  it('returns project cwd when not installed', async () => {
    // Import module normally for this test
    cp = await import('../../src/utils/config-paths.js');
    process.argv[1] = '/usr/bin/node';
    const dir = cp.getConfigDir();
    expect(dir).toBe(process.cwd());
  });

  it('returns home .appscan-client when installed (mocks fs)', async () => {
    process.argv[1] = '/some/path/node_modules/.bin/appscan';

    // Mock fs before importing the module so the imports are affected
    vi.mock('fs', () => ({
      existsSync: vi.fn().mockReturnValue(false),
      mkdirSync: vi.fn(),
    }));

    // Re-import module to pick up mocked fs
    cp = await import('../../src/utils/config-paths.js');

    const dir = cp.getConfigDir();
    // Ensure we target the home-based config path and attempted to create it
    expect(dir).toContain('.appscan-client');

    // Access the mocked functions to assert they were called
    const fsMock = await import('fs');
    expect(fsMock.mkdirSync).toHaveBeenCalled();
  });

  it('isInstalledPackage checks argv', async () => {
    cp = await import('../../src/utils/config-paths.js');
    process.argv[1] = '/x/node_modules/foo';
    expect(cp.isInstalledPackage()).toBe(true);
    process.argv[1] = '/x/bin/node';
    expect(cp.isInstalledPackage()).toBe(false);
  });
});
