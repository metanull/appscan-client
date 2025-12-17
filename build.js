import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Building AppScan Client...');

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
    'ink-link',
    'ink-use-stdout-dimensions',
    'chalk',
    'sanitize-html',
    'turndown',
    'cli-markdown',
    'zustand',
    'meow',
    'commander',
    'axios',
    'dotenv',
    'marked',
    '@inquirer/prompts',
    'jira.js'
  ],
  // Don't bundle node_modules
  packages: 'external',
  jsx: 'automatic',
  jsxImportSource: 'react',
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
  },
  minify: false,
  sourcemap: false,
});

console.log('Build complete! Output: dist/index.js');
