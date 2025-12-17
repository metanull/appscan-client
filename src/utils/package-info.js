import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Robustly locate and read package.json for the running package.
 * Tries a relative URL-based lookup first, then walks up directories as a fallback.
 */
export function getPackageInfo() {
  try {
    // Prefer URL resolution (works well with ESM and bundlers)
    const pkgUrl = new URL('../../package.json', import.meta.url);
    return JSON.parse(readFileSync(fileURLToPath(pkgUrl), 'utf8'));
  } catch {
    // Fallback: walk up the directory tree from this file until package.json is found
    let dir = dirname(fileURLToPath(import.meta.url));
    while (true) {
      const candidate = join(dir, 'package.json');
      if (existsSync(candidate)) {
        try {
          return JSON.parse(readFileSync(candidate, 'utf8'));
        } catch {
          break;
        }
      }
      const parent = dirname(dir);
      if (parent === dir) break; // reached filesystem root
      dir = parent;
    }
  }

  // Fallback minimal info
  return { version: '0.0.0' };
}
