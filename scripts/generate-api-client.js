#!/usr/bin/env node

import { generateApi } from 'swagger-typescript-api';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../src/generated');
const SWAGGER_URL = 'https://eu.cloud.appscan.com/swagger/v4/swagger.json';
const TEMP_SWAGGER_PATH = path.resolve(__dirname, '../temp-swagger.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Downloading swagger.json from HCL AppScan Cloud...');

// Download swagger.json
const downloadSwagger = () => {
  return new Promise((resolve, reject) => {
    https.get(SWAGGER_URL, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download swagger.json: HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(TEMP_SWAGGER_PATH);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Swagger.json downloaded successfully!');
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(TEMP_SWAGGER_PATH, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

console.log('Generating API client from swagger.json...');

downloadSwagger()
  .then(() => generateApi({
    name: 'appscan-api.js',
    output: OUTPUT_DIR,
    input: TEMP_SWAGGER_PATH,
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
    
    // Clean up temporary swagger file
    if (fs.existsSync(TEMP_SWAGGER_PATH)) {
      fs.unlinkSync(TEMP_SWAGGER_PATH);
      console.log('Temporary swagger.json removed.');
    }
  })
  .catch((error) => {
    console.error('Error generating API client:', error);
    
    // Clean up temporary swagger file on error
    if (fs.existsSync(TEMP_SWAGGER_PATH)) {
      fs.unlinkSync(TEMP_SWAGGER_PATH);
    }
    
    process.exit(1);
  }));
