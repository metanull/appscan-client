#!/usr/bin/env node
/**
 * detectify-00-connect.js
 *
 * Purpose: Test basic connection to Detectify API
 * API Endpoints: GET /rest/v2/assets/ (to verify authentication works)
 * Self-contained: Yes
 * 
 * Authentication Methods:
 * - X-Detectify-Key header (simplest, no signature required)
 * - Basic auth with API key as username
 * - HMAC signature for enhanced security (if secret key configured)
 */

import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.DETECTIFY_BASE_URL || 'https://api.detectify.com';
const API_KEY = process.env.DETECTIFY_API_KEY;

/**
 * Make a request to the Detectify API
 * @param {string} endpoint - API endpoint (e.g., '/rest/v2/assets/')
 * @param {object} options - Additional fetch options
 * @returns {Promise<object>} Response data
 */
async function detectifyRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'X-Detectify-Key': API_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

async function main() {
  try {
    if (!API_KEY) {
      throw new Error('Missing required environment variable: DETECTIFY_API_KEY');
    }

    console.log('Attempting to connect to Detectify API...');
    console.log('Base URL:', BASE_URL);
    console.log('API Key:', API_KEY.substring(0, 8) + '...');

    // Test connection by listing assets (paginated, first page only)
    const assetsResponse = await detectifyRequest('/rest/v2/assets/?pageSize=5');

    console.log('\n✅ Successfully connected to Detectify API!');
    console.log('\nAssets Response:');
    console.log('  Has More:', assetsResponse.has_more);
    console.log('  Current Marker:', assetsResponse.current_marker || 'N/A');
    console.log('  Next Marker:', assetsResponse.next_marker || 'N/A');
    
    if (assetsResponse.assets && assetsResponse.assets.length > 0) {
      console.log(`\n  Found ${assetsResponse.assets.length} asset(s):`);
      for (const asset of assetsResponse.assets) {
        console.log(`    - ${asset.name} (token: ${asset.token || asset.uuid || 'N/A'})`);
        console.log(`      Status: ${asset.status || 'N/A'}, Monitored: ${asset.monitored || false}`);
      }
    } else {
      console.log('\n  No assets found (empty team or new account)');
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Connection failed:', err.message);
    process.exit(1);
  }
}

main();
