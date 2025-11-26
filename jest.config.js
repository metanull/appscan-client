export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/api/generated/**',
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
