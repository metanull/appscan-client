import { existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolveTuiEntry() {
  const candidates = [
    resolve(__dirname, 'tui/index.js'),
    resolve(__dirname, '../tui/index.js'),
    resolve(__dirname, '../../dist/tui/index.js'),
    resolve(__dirname, '../../ink-triage/dist/index.js')
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function startTUI(args = []) {
  const entry = resolveTuiEntry();

  if (!entry) {
    console.error('Error: Ink TUI not built.');
    console.error('Please run: npm run build');
    process.exit(1);
  }

  const child = spawn('node', [entry, ...args], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  return new Promise((resolvePromise, reject) => {
    child.on('exit', (code) => {
      if (code && code !== 0) {
        reject(new Error(`TUI exited with code ${code}`));
      } else {
        resolvePromise();
      }
    });
    child.on('error', reject);
  });
}
