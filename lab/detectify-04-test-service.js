#!/usr/bin/env node
/**
 * detectify-04-test-service.js
 *
 * Purpose: Test the DetectifyService class
 * Self-contained: Yes
 * 
 * Tests all major service methods:
 * - testConnection
 * - listAssets
 * - listVulnerabilities
 * - getVulnerability
 * - setAcceptedRisk / unsetAcceptedRisk
 * - setFalsePositive / unsetFalsePositive
 * - setFixed / unsetFixed
 * - setStatus / unsetStatus convenience methods
 */

import dotenv from 'dotenv';
import { DetectifyService, VulnerabilityStatus, Severity, StatusAction } from '../src/services/detectify-service.js';

dotenv.config();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== DetectifyService Test ===\n');

  const service = new DetectifyService();

  // Test 1: Connection
  console.log('--- Test 1: Connection ---');
  try {
    const connected = await service.testConnection();
    console.log(`✅ Connection test: ${connected ? 'SUCCESS' : 'FAILED'}`);
  } catch (err) {
    console.log(`❌ Connection test failed: ${err.message}`);
    process.exit(1);
  }

  // Test 2: List Assets
  console.log('\n--- Test 2: List Assets ---');
  try {
    const assetsResponse = await service.listAssets({ pageSize: 5 });
    console.log(`✅ Listed ${assetsResponse.assets?.length || 0} assets`);
    if (assetsResponse.assets && assetsResponse.assets.length > 0) {
      console.log(`   First asset: ${assetsResponse.assets[0].name}`);
    }
  } catch (err) {
    console.log(`❌ List assets failed: ${err.message}`);
  }

  // Test 3: List Vulnerabilities
  console.log('\n--- Test 3: List Vulnerabilities ---');
  let testVulnUuid;
  try {
    const vulnsResponse = await service.listVulnerabilities({
      pageSize: 5,
      status: [VulnerabilityStatus.Active],
    });
    console.log(`✅ Listed ${vulnsResponse.vulnerabilities?.length || 0} vulnerabilities`);
    console.log(`   Total available: ${vulnsResponse.total_vulnerabilities}`);
    
    if (vulnsResponse.vulnerabilities && vulnsResponse.vulnerabilities.length > 0) {
      testVulnUuid = vulnsResponse.vulnerabilities[0].uuid;
      console.log(`   First vulnerability: ${vulnsResponse.vulnerabilities[0].title}`);
      console.log(`   UUID: ${testVulnUuid}`);
    }
  } catch (err) {
    console.log(`❌ List vulnerabilities failed: ${err.message}`);
  }

  // Test 4: Get Vulnerability
  console.log('\n--- Test 4: Get Vulnerability ---');
  if (testVulnUuid) {
    try {
      const vuln = await service.getVulnerability(testVulnUuid);
      console.log(`✅ Got vulnerability: ${vuln.title}`);
      console.log(`   Status: ${vuln.status}`);
      console.log(`   Severity: ${vuln.severity}`);
      console.log(`   Host: ${vuln.host}`);
    } catch (err) {
      console.log(`❌ Get vulnerability failed: ${err.message}`);
    }
  } else {
    console.log('⏭️  Skipped (no test vulnerability available)');
  }

  // Test 5: Status Updates
  console.log('\n--- Test 5: Status Updates ---');
  if (testVulnUuid) {
    const initialVuln = await service.getVulnerability(testVulnUuid);
    const initialStatus = initialVuln.status;
    console.log(`   Initial status: ${initialStatus}`);

    // Test setAcceptedRisk
    console.log('\n   Testing setAcceptedRisk...');
    try {
      await service.setAcceptedRisk(testVulnUuid);
      const vuln = await service.getVulnerability(testVulnUuid);
      console.log(`   ✅ setAcceptedRisk: status = ${vuln.status}`);
    } catch (err) {
      console.log(`   ❌ setAcceptedRisk failed: ${err.message}`);
    }
    await sleep(300);

    // Test unsetAcceptedRisk
    console.log('   Testing unsetAcceptedRisk...');
    try {
      await service.unsetAcceptedRisk(testVulnUuid);
      const vuln = await service.getVulnerability(testVulnUuid);
      console.log(`   ✅ unsetAcceptedRisk: status = ${vuln.status}`);
    } catch (err) {
      console.log(`   ❌ unsetAcceptedRisk failed: ${err.message}`);
    }
    await sleep(300);

    // Test setFalsePositive
    console.log('   Testing setFalsePositive...');
    try {
      await service.setFalsePositive(testVulnUuid);
      const vuln = await service.getVulnerability(testVulnUuid);
      console.log(`   ✅ setFalsePositive: status = ${vuln.status}`);
    } catch (err) {
      console.log(`   ❌ setFalsePositive failed: ${err.message}`);
    }
    await sleep(300);

    // Test unsetFalsePositive
    console.log('   Testing unsetFalsePositive...');
    try {
      await service.unsetFalsePositive(testVulnUuid);
      const vuln = await service.getVulnerability(testVulnUuid);
      console.log(`   ✅ unsetFalsePositive: status = ${vuln.status}`);
    } catch (err) {
      console.log(`   ❌ unsetFalsePositive failed: ${err.message}`);
    }
    await sleep(300);

    // Test setFixed
    console.log('   Testing setFixed...');
    try {
      await service.setFixed(testVulnUuid);
      const vuln = await service.getVulnerability(testVulnUuid);
      console.log(`   ✅ setFixed: status = ${vuln.status} (note: results in "patched")`);
    } catch (err) {
      console.log(`   ❌ setFixed failed: ${err.message}`);
    }
    await sleep(300);

    // Test unsetFixed
    console.log('   Testing unsetFixed...');
    try {
      await service.unsetFixed(testVulnUuid);
      const vuln = await service.getVulnerability(testVulnUuid);
      console.log(`   ✅ unsetFixed: status = ${vuln.status}`);
    } catch (err) {
      console.log(`   ❌ unsetFixed failed: ${err.message}`);
    }
    await sleep(300);

    // Test convenience methods
    console.log('\n   Testing convenience methods...');
    
    // setStatus('accepted_risk')
    try {
      await service.setStatus(testVulnUuid, 'accepted_risk');
      const vuln = await service.getVulnerability(testVulnUuid);
      console.log(`   ✅ setStatus('accepted_risk'): status = ${vuln.status}`);
    } catch (err) {
      console.log(`   ❌ setStatus('accepted_risk') failed: ${err.message}`);
    }
    await sleep(300);

    // unsetStatus('accepted_risk')
    try {
      await service.unsetStatus(testVulnUuid, 'accepted_risk');
      const vuln = await service.getVulnerability(testVulnUuid);
      console.log(`   ✅ unsetStatus('accepted_risk'): status = ${vuln.status}`);
    } catch (err) {
      console.log(`   ❌ unsetStatus('accepted_risk') failed: ${err.message}`);
    }

    // Final status
    const finalVuln = await service.getVulnerability(testVulnUuid);
    console.log(`\n   Final status: ${finalVuln.status}`);
  } else {
    console.log('⏭️  Skipped (no test vulnerability available)');
  }

  // Test 6: Vulnerability Summary
  console.log('\n--- Test 6: Vulnerability Summary (first 100) ---');
  try {
    // Just get first page to avoid long wait
    const vulnsResponse = await service.listVulnerabilities({ pageSize: 100 });
    const vulnerabilities = vulnsResponse.vulnerabilities || [];
    
    const summary = {
      total: vulnerabilities.length,
      totalAvailable: vulnsResponse.total_vulnerabilities,
      bySeverity: {},
      byStatus: {},
    };
    
    for (const vuln of vulnerabilities) {
      const severity = vuln.severity || 'unknown';
      const status = vuln.status || 'unknown';
      summary.bySeverity[severity] = (summary.bySeverity[severity] || 0) + 1;
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
    }
    
    console.log(`✅ Summary (${summary.total} of ${summary.totalAvailable} total):`);
    console.log(`   By Severity: ${JSON.stringify(summary.bySeverity)}`);
    console.log(`   By Status: ${JSON.stringify(summary.byStatus)}`);
  } catch (err) {
    console.log(`❌ Summary failed: ${err.message}`);
  }

  // Test 7: Enum exports
  console.log('\n--- Test 7: Enum Exports ---');
  console.log(`   VulnerabilityStatus: ${Object.keys(VulnerabilityStatus).join(', ')}`);
  console.log(`   Severity: ${Object.keys(Severity).join(', ')}`);
  console.log(`   StatusAction: ${Object.keys(StatusAction).join(', ')}`);

  console.log('\n=== All tests completed ===');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
