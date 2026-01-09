import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'node',
    globals: true,
  },
  coverage: {
    provider: 'c8',
    reports: ['text', 'lcov'],
    include: ['src/**/*.js'],
    exclude: ['src/index.js', 'src/generated/**'],
    statements: 50,
    branches: 50,
    functions: 50,
    lines: 50,
  },
});
