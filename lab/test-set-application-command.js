/**
 * Test set-application command - Progressive validation
 * Run with: node lab/test-set-application-command.js
 */

import { AppScanService } from '../src/services/appscan-service.js';
import { Config } from '../src/utils/config.js';
import logger from '../src/utils/logger.js';

async function testSetApplication() {
  try {
    console.log('🔍 Testing set-application Command - Basic Update\n');
    console.log('⚠️  This test will modify an application and restore it.\n');

    // Initialize
    const config = new Config();
    const service = new AppScanService(config);
    await service.authenticate();
    console.log('✅ Authenticated\n');

    // Use Agora app
    const testAppId = '71d969b5-8d40-4921-a3ce-8de07c04da7c';

    // Get current state
    console.log('📝 Test 1: Update Description field');
    const originalApp = await service.getApplicationDetails(testAppId);
    console.log(`   Current Description: "${originalApp.Description}"`);

    const testDescription = `TEST - Updated at ${new Date().toISOString()}`;
    console.log(`   New Description: "${testDescription}"\n`);

    // Update
    try {
      await service.api.v4.Apps_Update(testAppId, {
        Description: testDescription,
      });
      console.log('   ✅ Update request sent');

      // Verify
      const verifyApp = await service.getApplicationDetails(testAppId);
      if (verifyApp.Description === testDescription) {
        console.log('   ✅ Description updated correctly');
      } else {
        console.log(
          `   ❌ Mismatch! Expected "${testDescription}", got "${verifyApp.Description}"`
        );
      }

      // Restore
      console.log('\n   🔄 Restoring original value...');
      await service.api.v4.Apps_Update(testAppId, {
        Description: originalApp.Description,
      });

      const finalApp = await service.getApplicationDetails(testAppId);
      if (finalApp.Description === originalApp.Description) {
        console.log('   ✅ Original value restored\n');
      } else {
        console.log('   ⚠️  Failed to restore original value\n');
      }
    } catch (error) {
      console.error('   ❌ Update failed:', error.message);
      throw error;
    }

    console.log('✅ Test 1 passed!\n');

    // Test 2: Update a custom field
    console.log('📝 Test 2: Update custom field (JiraProject)');
    const originalJiraProject = originalApp.customFields.JiraProject;
    console.log(`   Current JiraProject: "${originalJiraProject}"`);

    const testJiraProject = `TEST-${Date.now()}`;
    console.log(`   New JiraProject: "${testJiraProject}"\n`);

    try {
      // Find the custom field ID
      const jiraField = originalApp._customFieldsRaw.find(
        (f) => f.Name === 'JiraProject'
      );
      if (!jiraField) {
        throw new Error('JiraProject custom field not found');
      }
      console.log(`   Field ID: ${jiraField.Id}`);

      // Update
      await service.api.v4.Apps_Update(testAppId, {
        AppCustomFields: [
          {
            Id: jiraField.Id,
            Value: testJiraProject,
          },
        ],
      });
      console.log('   ✅ Update request sent');

      // Verify
      const verifyApp2 = await service.getApplicationDetails(testAppId);
      if (verifyApp2.customFields.JiraProject === testJiraProject) {
        console.log('   ✅ JiraProject updated correctly');
      } else {
        console.log(
          `   ❌ Mismatch! Expected "${testJiraProject}", got "${verifyApp2.customFields.JiraProject}"`
        );
      }

      // Restore
      console.log('\n   🔄 Restoring original value...');
      await service.api.v4.Apps_Update(testAppId, {
        AppCustomFields: [
          {
            Id: jiraField.Id,
            Value: originalJiraProject,
          },
        ],
      });

      const finalApp2 = await service.getApplicationDetails(testAppId);
      if (finalApp2.customFields.JiraProject === originalJiraProject) {
        console.log('   ✅ Original value restored\n');
      } else {
        console.log('   ⚠️  Failed to restore original value\n');
      }
    } catch (error) {
      console.error('   ❌ Update failed:', error.message);
      throw error;
    }

    console.log('✅ Test 2 passed!\n');

    // Test 3: Update both standard and custom field together
    console.log('📝 Test 3: Update standard + custom field together');
    const originalType = originalApp.Type;
    const originalDevOpsProject = originalApp.customFields.DevOpsProject;
    console.log(`   Current Type: "${originalType}"`);
    console.log(`   Current DevOpsProject: "${originalDevOpsProject}"`);

    const testType = 'TEST-Type';
    const testDevOpsProject = `TEST-DevOps-${Date.now()}`;
    console.log(`   New Type: "${testType}"`);
    console.log(`   New DevOpsProject: "${testDevOpsProject}"\n`);

    try {
      // Find the custom field ID
      const devOpsField = originalApp._customFieldsRaw.find(
        (f) => f.Name === 'DevOpsProject'
      );
      if (!devOpsField) {
        throw new Error('DevOpsProject custom field not found');
      }

      // Update both
      await service.api.v4.Apps_Update(testAppId, {
        Type: testType,
        AppCustomFields: [
          {
            Id: devOpsField.Id,
            Value: testDevOpsProject,
          },
        ],
      });
      console.log('   ✅ Update request sent');

      // Verify
      const verifyApp3 = await service.getApplicationDetails(testAppId);
      const typeMatch = verifyApp3.Type === testType;
      const devOpsMatch =
        verifyApp3.customFields.DevOpsProject === testDevOpsProject;

      console.log(`   ${typeMatch ? '✅' : '❌'} Type: ${verifyApp3.Type}`);
      console.log(
        `   ${devOpsMatch ? '✅' : '❌'} DevOpsProject: ${verifyApp3.customFields.DevOpsProject}`
      );

      if (!typeMatch || !devOpsMatch) {
        throw new Error('Values do not match expected');
      }

      // Restore
      console.log('\n   🔄 Restoring original values...');
      await service.api.v4.Apps_Update(testAppId, {
        Type: originalType,
        AppCustomFields: [
          {
            Id: devOpsField.Id,
            Value: originalDevOpsProject,
          },
        ],
      });

      const finalApp3 = await service.getApplicationDetails(testAppId);
      const typeRestored = finalApp3.Type === originalType;
      const devOpsRestored =
        finalApp3.customFields.DevOpsProject === originalDevOpsProject;

      if (typeRestored && devOpsRestored) {
        console.log('   ✅ Original values restored\n');
      } else {
        console.log('   ⚠️  Failed to restore all values\n');
      }
    } catch (error) {
      console.error('   ❌ Update failed:', error.message);
      throw error;
    }

    console.log('✅ Test 3 passed!\n');
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test failed', error);
    process.exit(1);
  }
}

testSetApplication();
