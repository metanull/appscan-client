#!/usr/bin/env node
/**
 * detectify-01-list-vulnerabilities.js
 *
 * Purpose: List vulnerabilities from Detectify API with filtering
 * API Endpoints: GET /rest/v2/vulnerabilities/
 * Self-contained: Yes
 * 
 * Vulnerability Statuses:
 * - active: Currently active vulnerability
 * - new: Newly detected vulnerability
 * - patched: Vulnerability was patched
 * - regression: Vulnerability reappeared
 * - accepted_risk: Manually marked as accepted risk
 * - false_positive: Manually marked as false positive
 * 
 * Severities (CVSS v2): information, low, medium, high
 * Severities (CVSS v3.1): information, low, medium, high, critical
 * 
 * Scan Sources: application-scanning, surface-monitoring, api-scanning
 */

import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.DETECTIFY_BASE_URL || 'https://api.detectify.com';
const API_KEY = process.env.DETECTIFY_API_KEY;

/**
 * Make a request to the Detectify API
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

/**
 * Build query string from parameters
 */
function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      // Handle array parameters like severity[], status[]
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else {
      searchParams.append(key, value);
    }
  }
  
  return searchParams.toString();
}

async function main() {
  try {
    if (!API_KEY) {
      throw new Error('Missing required environment variable: DETECTIFY_API_KEY');
    }

    console.log('=== Detectify Vulnerability List ===\n');

    // Build query parameters (customizable)
    const queryParams = {
      pageSize: 20,
      // Filter examples (uncomment as needed):
      // 'severity[]': ['high', 'critical'],
      // 'severityV3[]': ['critical'],
      // 'status[]': ['active', 'new'],
      // 'scan_source[]': ['surface-monitoring'],
      // created_after: '2024-01-01T00:00:00Z',
    };

    const queryString = buildQueryString(queryParams);
    const endpoint = `/rest/v2/vulnerabilities/${queryString ? '?' + queryString : ''}`;
    
    console.log(`Fetching vulnerabilities...`);
    console.log(`Endpoint: ${endpoint}\n`);

    const response = await detectifyRequest(endpoint);

    console.log('Response Summary:');
    console.log(`  Total Vulnerabilities: ${response.total_vulnerabilities || 'N/A'}`);
    console.log(`  Has More: ${response.has_more}`);
    console.log(`  Current Marker: ${response.current_marker || 'N/A'}`);
    console.log(`  Next Marker: ${response.next_marker || 'N/A'}`);
    
    if (!response.vulnerabilities || response.vulnerabilities.length === 0) {
      console.log('\n  No vulnerabilities found with current filters.');
      process.exit(0);
    }

    console.log(`\n  Fetched ${response.vulnerabilities.length} vulnerability(ies):\n`);

    // Group by severity and status for summary
    const bySeverity = {};
    const byStatus = {};
    const byScanSource = {};
    const byHost = {};

    for (const vuln of response.vulnerabilities) {
      const severity = vuln.severity || 'unknown';
      const status = vuln.status || 'unknown';
      const scanSource = vuln.scan_source || 'unknown';
      const host = vuln.host || 'unknown';

      bySeverity[severity] = (bySeverity[severity] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;
      byScanSource[scanSource] = (byScanSource[scanSource] || 0) + 1;
      byHost[host] = (byHost[host] || 0) + 1;
    }

    console.log('Summary:');
    console.log('  By Severity:', JSON.stringify(bySeverity));
    console.log('  By Status:', JSON.stringify(byStatus));
    console.log('  By Scan Source:', JSON.stringify(byScanSource));
    console.log('  By Host:', JSON.stringify(byHost));

    // Display first 5 vulnerabilities with details
    console.log('\n--- First 5 Vulnerabilities ---\n');

    const displayVulns = response.vulnerabilities.slice(0, 5);
    for (const vuln of displayVulns) {
      console.log(`[${vuln.uuid}]`);
      console.log(`  Title: ${vuln.title || '(no title)'}`);
      console.log(`  Host: ${vuln.host || 'N/A'}`);
      console.log(`  Location: ${vuln.location || 'N/A'}`);
      console.log(`  Severity: ${vuln.severity || 'N/A'}`);
      console.log(`  Status: ${vuln.status || 'N/A'}`);
      console.log(`  Scan Source: ${vuln.scan_source || 'N/A'}`);
      console.log(`  Created At: ${vuln.created_at || 'N/A'}`);
      console.log(`  Updated At: ${vuln.updated_at || 'N/A'}`);
      if (vuln.cvss_scores) {
        console.log(`  CVSS Scores: v2=${vuln.cvss_scores.cvss_v2 || 'N/A'}, v3=${vuln.cvss_scores.cvss_v3 || 'N/A'}`);
      }
      if (vuln.cwe) {
        console.log(`  CWE: ${vuln.cwe}`);
      }
      console.log();
    }

    // Store first vulnerability UUID for other scripts
    if (response.vulnerabilities.length > 0) {
      console.log('=== For Testing ===');
      console.log(`First vulnerability UUID: ${response.vulnerabilities[0].uuid}`);
      console.log('Use this UUID in detectify-02-get-vulnerability.js and detectify-03-update-status.js');
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
