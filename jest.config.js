export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/generated/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testMatch: ['**/tests/**/*.test.js'],
};
