import * as esbuild from 'esbuild';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sharedOptions = {
  bundle: true,
  platform: 'node',
  format: 'esm',
  sourcemap: true,
  logLevel: 'info',
  loader: {
    '.js': 'jsx'
  },
  external: [
    'ink',
    'react',
    'ink-text-input',
    'ink-select-input',
    'ink-spinner',
    'ink-link',
    'ink-use-stdout-dimensions',
    'chalk',
    'sanitize-html',
    'turndown',
    'cli-markdown',
    'zustand',
    'meow'
  ],
  packages: 'external',
  jsx: 'automatic',
  jsxImportSource: 'react',
  banner: {
    js: '#!/usr/bin/env node'
  }
};

await esbuild.build({
  ...sharedOptions,
  entryPoints: [
    { in: resolve(__dirname, 'src/index.js'), out: 'index' },
    {
      in: (() => {
        const tuiEntry = resolve(__dirname, 'ink-triage/src/index.js');
        if (!existsSync(tuiEntry)) {
          throw new Error(`TUI entry point not found: ${tuiEntry}`);
        }
        return tuiEntry;
      })(),
      out: 'tui/index'
    }
  ],
  outdir: 'dist'
});

console.log('Build complete!');
