/**
 * Test script to verify if AppScan API accepts Severity in update requests
 * Run with: node test-severity-update.js
 */

import { AppScanService } from '../src/tui/services/appscan.js';
import { Config } from '../src/utils/config.js';
import logger from '../src/tui/utils/logger.js';

async function testSeverityUpdate() {
  try {
    console.log('🔍 Testing if Severity can be updated via AppScan API...\n');

    // Initialize services
    const config = new Config();
    const appScanService = new AppScanService(config);

    // Authenticate
    await appScanService.authenticate();
    console.log('✅ Authenticated successfully\n');

    // Get first application
    const apps = await appScanService.listApplications();
    if (!apps || apps.length === 0) {
      console.log('❌ No applications found');
      return;
    }

    const app = apps[0];
    console.log(`📱 Using application: ${app.Name} (${app.Id})\n`);

    // Get first scan
    const scans = await appScanService.listScans(app.Id);
    if (!scans || scans.length === 0) {
      console.log('❌ No scans found');
      return;
    }

    // Find a scan with issues
    let scan = null;
    let issues = null;
    for (const s of scans) {
      console.log(`   Checking scan: ${s.Name}...`);
      const issueList = await appScanService.listIssues(s.Id);
      if (issueList && issueList.length > 0) {
        scan = s;
        issues = issueList;
        break;
      }
    }

    if (!scan || !issues) {
      console.log('❌ No scans with issues found');
      return;
    }

    console.log(`📊 Using scan: ${scan.Name} (${scan.Id})\n`);
    if (!issues || issues.length === 0) {
      console.log('❌ No issues found');
      return;
    }

    // Find an issue we can safely test with
    const testIssue = issues[0];
    console.log(`🎯 Test issue: ${testIssue.IssueType}`);
    console.log(`   Current Severity: ${testIssue.Severity}`);
    console.log(`   Current Status: ${testIssue.Status}`);
    console.log(`   Issue ID: ${testIssue.Id}\n`);

    // Test 1: Try updating with just Status (known to work)
    console.log('📝 Test 1: Update Status only (baseline test)');
    try {
      const updateData1 = {
        Status: testIssue.Status, // Keep same value
        Comment: 'Test: Status update only',
      };
      const result1 = await appScanService.updateIssue(
        testIssue.Id,
        app.Id,
        updateData1
      );
      console.log(`✅ Status update succeeded: ${JSON.stringify(result1)}\n`);
    } catch (error) {
      console.log(`❌ Status update failed: ${error.message}\n`);
    }

    // Test 2: Try updating with Severity included
    console.log('📝 Test 2: Update with Severity field');
    try {
      const updateData2 = {
        Status: testIssue.Status, // Keep same value
        Severity: testIssue.Severity, // Try to include Severity
        Comment: 'Test: Status + Severity update',
      };
      const result2 = await appScanService.updateIssue(
        testIssue.Id,
        app.Id,
        updateData2
      );
      console.log(`✅ Severity update succeeded: ${JSON.stringify(result2)}\n`);
      console.log('🎉 SUCCESS! The API accepts Severity in update requests!\n');
    } catch (error) {
      console.log(`❌ Severity update failed: ${error.message}`);
      console.log(
        `   This means Severity cannot be updated via the API.\n`
      );
    }

    // Test 3: Try changing Severity to a different value
    console.log('📝 Test 3: Try changing Severity to different value');
    const severityOptions = [
      'Informational',
      'Low',
      'Medium',
      'High',
      'Critical',
    ];
    const currentSeverityIndex = severityOptions.indexOf(testIssue.Severity);
    const newSeverity =
      severityOptions[
        (currentSeverityIndex + 1) % severityOptions.length
      ] || 'Medium';

    try {
      const updateData3 = {
        Status: testIssue.Status,
        Severity: newSeverity,
        Comment: `Test: Changing severity from ${testIssue.Severity} to ${newSeverity}`,
      };
      console.log(
        `   Attempting to change: ${testIssue.Severity} → ${newSeverity}`
      );
      const result3 = await appScanService.updateIssue(
        testIssue.Id,
        app.Id,
        updateData3
      );
      console.log(`✅ Severity change succeeded: ${JSON.stringify(result3)}`);

      // Verify the change
      const updatedIssue = await appScanService.service.api.v4.Issues_GetIssue(
        testIssue.Id,
        {}
      );
      console.log(`   Verified Severity after update: ${updatedIssue.Severity}`);
      if (updatedIssue.Severity === newSeverity) {
        console.log('   🎉 Severity was actually changed!\n');
      } else {
        console.log(
          '   ⚠️  API accepted request but Severity was not changed\n'
        );
      }

      // Restore original severity
      console.log('🔄 Restoring original severity...');
      await appScanService.updateIssue(testIssue.Id, app.Id, {
        Status: testIssue.Status,
        Severity: testIssue.Severity,
        Comment: 'Test: Restoring original severity',
      });
      console.log('✅ Original severity restored\n');
    } catch (error) {
      console.log(`❌ Severity change failed: ${error.message}\n`);
    }

    console.log('📊 Test Summary:');
    console.log(
      '   If all tests passed, Severity CAN be updated via the API!'
    );
    console.log(
      '   If Test 2/3 failed, Severity cannot be modified (read-only field)\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test failed', error);
  }
}

// Run the test
testSeverityUpdate();
