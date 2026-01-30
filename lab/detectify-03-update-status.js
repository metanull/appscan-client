#!/usr/bin/env node
/**
 * detectify-03-update-status.js
 *
 * Purpose: Test updating vulnerability status in Detectify
 * API Endpoints:
 *   - POST /rest/v2/vulnerabilities/uuid/{uuid}/setacceptedriskstatus/
 *   - POST /rest/v2/vulnerabilities/uuid/{uuid}/setfalsepositivestatus/
 *   - POST /rest/v2/vulnerabilities/uuid/{uuid}/setfixedstatus/
 *   - POST /rest/v2/vulnerabilities/uuid/{uuid}/unsetacceptedriskstatus/
 *   - POST /rest/v2/vulnerabilities/uuid/{uuid}/unsetfalsepositivestatus/
 *   - POST /rest/v2/vulnerabilities/uuid/{uuid}/unsetfixedstatus/
 * Self-contained: Yes
 * 
 * Detectify Vulnerability Statuses:
 *   - active: Currently active vulnerability (scanner detected it)
 *   - new: Newly detected vulnerability
 *   - patched: Vulnerability was patched (scanner no longer detects it, or manually set via setfixedstatus)
 *   - regression: Vulnerability reappeared after being patched
 *   - accepted_risk: Manually marked as accepted risk
 *   - false_positive: Manually marked as false positive
 * 
 * Status Transitions (SET operations):
 *   - From any status -> accepted_risk (via setacceptedriskstatus)
 *   - From any status -> false_positive (via setfalsepositivestatus)
 *   - From any status -> patched (via setfixedstatus - note: results in "patched" status, not "fixed")
 * 
 * Status Transitions (UNSET operations - revert to previous/active state):
 *   - accepted_risk -> active (via unsetacceptedriskstatus)
 *   - false_positive -> active (via unsetfalsepositivestatus)
 *   - patched (manual) -> active (via unsetfixedstatus)
 * 
 * Important Notes:
 *   - setfixedstatus results in "patched" status (not "fixed")
 *   - Cannot directly transition between accepted_risk/false_positive/patched - must unset first
 *   - API may have rate limiting; add delays between rapid successive calls
 * 
 * Usage: node detectify-03-update-status.js [uuid] [action]
 *   action: set-accepted | unset-accepted | set-fp | unset-fp | set-fixed | unset-fixed | demo
 *   If no UUID is provided, fetches first "active" vulnerability for testing
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

  // Note: Status update endpoints return 200 with no content on success
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  
  return { success: true, status: response.status };
}

/**
 * Get vulnerability details
 */
async function getVulnerability(uuid) {
  const response = await detectifyRequest(`/rest/v2/vulnerabilities/uuid/${uuid}/`);
  return response.vulnerability;
}

/**
 * Set vulnerability status to "accepted_risk"
 */
async function setAcceptedRisk(uuid) {
  return detectifyRequest(`/rest/v2/vulnerabilities/uuid/${uuid}/setacceptedriskstatus/`, {
    method: 'POST',
  });
}

/**
 * Unset "accepted_risk" status (revert to previous state)
 */
async function unsetAcceptedRisk(uuid) {
  return detectifyRequest(`/rest/v2/vulnerabilities/uuid/${uuid}/unsetacceptedriskstatus/`, {
    method: 'POST',
  });
}

/**
 * Set vulnerability status to "false_positive"
 */
async function setFalsePositive(uuid) {
  return detectifyRequest(`/rest/v2/vulnerabilities/uuid/${uuid}/setfalsepositivestatus/`, {
    method: 'POST',
  });
}

/**
 * Unset "false_positive" status (revert to previous state)
 */
async function unsetFalsePositive(uuid) {
  return detectifyRequest(`/rest/v2/vulnerabilities/uuid/${uuid}/unsetfalsepositivestatus/`, {
    method: 'POST',
  });
}

/**
 * Set vulnerability status to "fixed" (manual)
 */
async function setFixed(uuid) {
  return detectifyRequest(`/rest/v2/vulnerabilities/uuid/${uuid}/setfixedstatus/`, {
    method: 'POST',
  });
}

/**
 * Unset "fixed" status (revert to previous state)
 */
async function unsetFixed(uuid) {
  return detectifyRequest(`/rest/v2/vulnerabilities/uuid/${uuid}/unsetfixedstatus/`, {
    method: 'POST',
  });
}

/**
 * Display current vulnerability status
 */
async function displayStatus(uuid, label = 'Current') {
  const vuln = await getVulnerability(uuid);
  console.log(`\n${label} Status:`);
  console.log(`  UUID: ${vuln.uuid}`);
  console.log(`  Title: ${vuln.title}`);
  console.log(`  Status: ${vuln.status}`);
  console.log(`  Modified At: ${vuln.modified_at}`);
  return vuln;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    if (!API_KEY) {
      throw new Error('Missing required environment variable: DETECTIFY_API_KEY');
    }

    let vulnerabilityUUID = process.argv[2];
    const action = process.argv[3] || 'demo';

    console.log('=== Detectify Status Update Test ===\n');

    // Find a suitable test vulnerability if none provided
    if (!vulnerabilityUUID) {
      console.log('No UUID provided, searching for an "active" vulnerability...\n');
      const listResponse = await detectifyRequest('/rest/v2/vulnerabilities/?status[]=active&pageSize=5');
      
      if (!listResponse.vulnerabilities || listResponse.vulnerabilities.length === 0) {
        // Try finding any vulnerability
        console.log('No active vulnerabilities found, trying any vulnerability...');
        const anyResponse = await detectifyRequest('/rest/v2/vulnerabilities/?pageSize=5');
        if (!anyResponse.vulnerabilities || anyResponse.vulnerabilities.length === 0) {
          throw new Error('No vulnerabilities found to test with');
        }
        vulnerabilityUUID = anyResponse.vulnerabilities[0].uuid;
      } else {
        vulnerabilityUUID = listResponse.vulnerabilities[0].uuid;
      }
      console.log(`Using vulnerability UUID: ${vulnerabilityUUID}\n`);
    }

    // Show current status
    const initialVuln = await displayStatus(vulnerabilityUUID, 'Initial');
    const initialStatus = initialVuln.status;

    console.log('\n--- Available Actions ---');
    console.log('  set-accepted  : Set status to accepted_risk');
    console.log('  unset-accepted: Revert accepted_risk status');
    console.log('  set-fp        : Set status to false_positive');
    console.log('  unset-fp      : Revert false_positive status');
    console.log('  set-fixed     : Set status to fixed (manual)');
    console.log('  unset-fixed   : Revert fixed status');
    console.log('  demo          : Demo all status changes (default)');

    console.log(`\nAction: ${action}`);

    switch (action) {
      case 'set-accepted':
        console.log('\n--- Setting Accepted Risk ---');
        await setAcceptedRisk(vulnerabilityUUID);
        await displayStatus(vulnerabilityUUID, 'After setAcceptedRisk');
        break;

      case 'unset-accepted':
        console.log('\n--- Unsetting Accepted Risk ---');
        await unsetAcceptedRisk(vulnerabilityUUID);
        await displayStatus(vulnerabilityUUID, 'After unsetAcceptedRisk');
        break;

      case 'set-fp':
        console.log('\n--- Setting False Positive ---');
        await setFalsePositive(vulnerabilityUUID);
        await displayStatus(vulnerabilityUUID, 'After setFalsePositive');
        break;

      case 'unset-fp':
        console.log('\n--- Unsetting False Positive ---');
        await unsetFalsePositive(vulnerabilityUUID);
        await displayStatus(vulnerabilityUUID, 'After unsetFalsePositive');
        break;

      case 'set-fixed':
        console.log('\n--- Setting Fixed ---');
        await setFixed(vulnerabilityUUID);
        await displayStatus(vulnerabilityUUID, 'After setFixed');
        break;

      case 'unset-fixed':
        console.log('\n--- Unsetting Fixed ---');
        await unsetFixed(vulnerabilityUUID);
        await displayStatus(vulnerabilityUUID, 'After unsetFixed');
        break;

      case 'demo':
      default:
        console.log('\n=== Demo: Testing All Status Transitions ===');
        console.log('(Adding small delays between API calls to avoid rate limiting)\n');
        
        // 1. Set to Accepted Risk
        console.log('--- Step 1: Set to Accepted Risk ---');
        try {
          await setAcceptedRisk(vulnerabilityUUID);
          console.log('✅ setAcceptedRisk succeeded');
          await displayStatus(vulnerabilityUUID, 'After setAcceptedRisk');
        } catch (err) {
          console.log(`❌ setAcceptedRisk failed: ${err.message}`);
        }
        await sleep(500);

        // 2. Unset Accepted Risk
        console.log('\n--- Step 2: Unset Accepted Risk ---');
        try {
          await unsetAcceptedRisk(vulnerabilityUUID);
          console.log('✅ unsetAcceptedRisk succeeded');
          await displayStatus(vulnerabilityUUID, 'After unsetAcceptedRisk');
        } catch (err) {
          console.log(`❌ unsetAcceptedRisk failed: ${err.message}`);
        }
        await sleep(500);

        // 3. Set to False Positive
        console.log('\n--- Step 3: Set to False Positive ---');
        try {
          await setFalsePositive(vulnerabilityUUID);
          console.log('✅ setFalsePositive succeeded');
          await displayStatus(vulnerabilityUUID, 'After setFalsePositive');
        } catch (err) {
          console.log(`❌ setFalsePositive failed: ${err.message}`);
        }
        await sleep(500);

        // 4. Unset False Positive
        console.log('\n--- Step 4: Unset False Positive ---');
        try {
          await unsetFalsePositive(vulnerabilityUUID);
          console.log('✅ unsetFalsePositive succeeded');
          await displayStatus(vulnerabilityUUID, 'After unsetFalsePositive');
        } catch (err) {
          console.log(`❌ unsetFalsePositive failed: ${err.message}`);
        }
        await sleep(500);

        // 5. Set to Fixed/Patched (manual)
        console.log('\n--- Step 5: Set to Fixed (results in "patched" status) ---');
        try {
          await setFixed(vulnerabilityUUID);
          console.log('✅ setFixed succeeded');
          await displayStatus(vulnerabilityUUID, 'After setFixed');
        } catch (err) {
          console.log(`❌ setFixed failed: ${err.message}`);
        }
        await sleep(500);

        // 6. Unset Fixed
        console.log('\n--- Step 6: Unset Fixed ---');
        try {
          await unsetFixed(vulnerabilityUUID);
          console.log('✅ unsetFixed succeeded');
          await displayStatus(vulnerabilityUUID, 'After unsetFixed');
        } catch (err) {
          console.log(`❌ unsetFixed failed: ${err.message}`);
        }

        // Final status
        const finalVuln = await displayStatus(vulnerabilityUUID, 'Final');
        
        console.log('\n=== Demo Summary ===');
        console.log(`Initial status: ${initialStatus}`);
        console.log(`Final status: ${finalVuln.status}`);
        console.log('\nStatus mapping:');
        console.log('  setacceptedriskstatus  -> accepted_risk');
        console.log('  setfalsepositivestatus -> false_positive');
        console.log('  setfixedstatus         -> patched');
        console.log('\nAll unset operations revert to "active" status.');
        break;
    }

    console.log('\n✅ Status update test completed.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
