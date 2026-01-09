import { describe, it, expect } from 'vitest';
import { getPackageInfo } from '../../src/utils/package-info.js';
import { readFileSync } from 'fs';

describe('package-info', () => {
  it('reads package.json and returns version and name', () => {
    const pkg = getPackageInfo();
    const pkgRaw = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url))
    );

    expect(pkg).toHaveProperty('version');
    expect(pkg).toHaveProperty('name');
    // Verify names match repository package.json
    expect(pkg.name).toBe(pkgRaw.name);
  });
});
