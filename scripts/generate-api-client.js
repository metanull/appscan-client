#!/usr/bin/env node

import { generateApi } from 'swagger-typescript-api';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../src/generated');
const TEMPLATES_DIR = path.resolve(__dirname, '../resource');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Generating API client from swagger.json...');

generateApi({
  name: 'appscan-api.js',
  output: OUTPUT_DIR,
  input: path.resolve(TEMPLATES_DIR, 'swagger.json'),
  httpClientType: 'axios',
  generateClient: true,
  generateRouteTypes: false,
  generateResponses: true,
  toJS: true,
  moduleNameIndex: 1,
  extractRequestParams: false,
  extractRequestBody: false,
  extractEnums: true,
  unwrapResponseData: true,
  singleHttpClient: true,
  cleanOutput: true,
  enumNamesAsValues: false,
  moduleNameFirstTag: false,
  generateUnionEnums: false,
  hooks: {
    onFormatRouteName: (routeInfo) => {
      return routeInfo.operationId || routeInfo.route;
    },
  },
})
  .then(({ files }) => {
    console.log('API client generated successfully!');
    console.log('Generated files:');
    files.forEach((file) => {
      console.log(`  - ${file.name}`);
    });
  })
  .catch((error) => {
    console.error('Error generating API client:', error);
    process.exit(1);
  });
