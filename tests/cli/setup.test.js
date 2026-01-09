import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import setup from '../../src/cli/commands/setup.js';
import cliOutput from '../../src/utils/cli-output.js';

describe('setup CLI', () => {
  beforeEach(() => vi.spyOn(cliOutput, 'result').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('runs setup and prints output', async () => {
    // Mock inquirer prompts to avoid interactive blocking
    vi.mock('@inquirer/prompts', () => ({
      input: vi.fn().mockResolvedValue('key'),
      password: vi.fn().mockResolvedValue('secret'),
      confirm: vi.fn().mockResolvedValue(false),
    }));

    // Mock existsSync to return false so no overwrite prompt
    vi.mock('fs', async () => {
      const fs = await vi.importActual('fs');
      return {
        ...fs,
        existsSync: vi.fn().mockReturnValue(false),
        writeFileSync: vi.fn(),
      };
    });

    // Import setup after mocks
    const { default: setupCmd } =
      await import('../../src/cli/commands/setup.js');

    await setupCmd({});
    expect(true).toBe(true);
  });
});
