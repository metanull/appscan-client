import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

const cliDir = path.resolve('src/cli/commands');

function getFiles(dir) {
  return fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? files.concat(getFiles(name)) : files.concat(name);
  }, []);
}

const files = getFiles(cliDir).filter((f) => f.endsWith('.js'));

describe('CLI commands console usage', () => {
  it('no direct console.* usages in cli commands', () => {
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toMatch(/console\.(log|error|warn|info|debug)/);
    }
  });
});
