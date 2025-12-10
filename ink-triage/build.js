import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/index.js',
  loader: {
    '.js': 'jsx'
  },
  external: [
    'ink',
    'react',
    'ink-text-input',
    'ink-select-input',
    'ink-spinner',
    'ink-box',
    'chalk',
    'sanitize-html',
    'turndown',
    'cli-markdown',
    'zustand',
    'meow'
  ],
  // Don't bundle parent package imports
  packages: 'external',
  jsx: 'automatic',
  jsxImportSource: 'react',
  banner: {
    js: '#!/usr/bin/env node\nimport { createRequire } from "module"; const require = createRequire(import.meta.url);'
  }
});

console.log('Build complete!');
