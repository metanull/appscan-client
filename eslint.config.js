import react from 'eslint-plugin-react';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'src/generated/**', 'ink-triage/**']
  },
  {
    files: ['**/*.js'],
    plugins: {
      react
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^React$'
      }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    }
  }
];
