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
const PATCHED_SWAGGER_PATH = path.resolve(__dirname, '../doc/appscan-swagger-v4-patched.json');
const TEMP_SWAGGER_PATH = path.resolve(__dirname, '../temp-swagger.json');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldDownload = args.includes('--download');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Download swagger.json from API
const downloadSwagger = () => {
  return new Promise((resolve, reject) => {
    console.log('Downloading swagger.json from HCL AppScan Cloud...');
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

// Determine which swagger file to use
const getSwaggerPath = async () => {
  if (shouldDownload) {
    await downloadSwagger();
    return TEMP_SWAGGER_PATH;
  } else {
    if (!fs.existsSync(PATCHED_SWAGGER_PATH)) {
      console.error('Error: Patched swagger file not found:', PATCHED_SWAGGER_PATH);
      console.error('Please run with --download to fetch the original, or ensure the patched file exists.');
      process.exit(1);
    }
    console.log('Using local patched swagger file:', PATCHED_SWAGGER_PATH);
    return PATCHED_SWAGGER_PATH;
  }
};

console.log('Generating API client from swagger.json...');

getSwaggerPath()
  .then((swaggerPath) => generateApi({
    name: 'appscan-api.js',
    output: OUTPUT_DIR,
    input: swaggerPath,
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
    console.log('\n✅ API client generated successfully!');
    
    // Clean up temporary swagger file if it was downloaded
    if (shouldDownload && fs.existsSync(TEMP_SWAGGER_PATH)) {
      fs.unlinkSync(TEMP_SWAGGER_PATH);
      console.log('Temporary swagger.json removed.');
    }
    
    console.log('\n💡 Tip: Use --download flag to fetch latest swagger from API instead of using local patched version.');
  })
  .catch((error) => {
    console.error('Error generating API client:', error);
    
    // Clean up temporary swagger file on error
    if (fs.existsSync(TEMP_SWAGGER_PATH)) {
      fs.unlinkSync(TEMP_SWAGGER_PATH);
    }
    
    process.exit(1);
  }));
