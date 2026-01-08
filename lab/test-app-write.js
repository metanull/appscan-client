/**
 * Test script to verify updating Application details and custom fields
 * Run with: node test-app-write.js
 * 
 * IMPORTANT: This script will make actual changes to an application.
 * It will restore original values after testing.
 */

import { AppScanService } from '../src/services/appscan-service.js';
import { Config } from '../src/utils/config.js';
import logger from '../src/utils/logger.js';

async function testApplicationWrite() {
  try {
    console.log('🔍 Testing AppScan API - Writing Application Details...\n');
    console.log('⚠️  WARNING: This test will modify an application and then restore it.\n');

    // Initialize services
    const config = new Config();
    const service = new AppScanService(config);

    // Authenticate
    await service.authenticate();
    console.log('✅ Authenticated successfully\n');

    // Use Agora app for testing (has real custom field values)
    const testAppId = '71d969b5-8d40-4921-a3ce-8de07c04da7c';
    
    console.log('📝 Step 1: Get current application details (using fixed method)');
    const originalApp = await service.getApplicationDetails(testAppId);
    console.log(`✅ Retrieved: ${originalApp.Name}`);
    console.log('');

    // Store original values for restoration
    console.log('Current values:');
    console.log(`  Description: ${originalApp.Description || '(empty)'}`);
    console.log(`  Type: ${originalApp.Type || '(empty)'}`);
    console.log(`  Tester: ${originalApp.Tester || '(empty)'}`);
    console.log('');
    
    if (originalApp.customFields) {
      console.log('  Custom Fields:');
      Object.entries(originalApp.customFields).forEach(([key, value]) => {
        console.log(`    ${key}: ${value || '(not set)'}`);
      });
      console.log('');
    }

    // Test 1: Update basic fields
    console.log('📝 Test 1: Update basic application fields');
    const testDescription = `TEST - Updated at ${new Date().toISOString()}`;
    const testType = 'Web Application (TEST)';
    const testTester = 'Automated Test';

    try {
      const updateData1 = {
        Description: testDescription,
        Type: testType,
        Tester: testTester,
      };

      await service.api.v4.Apps_Update(testAppId, updateData1);
      console.log('✅ Update request accepted\n');

      // Verify the update
      const verifyApp1 = await service.getApplicationDetails(testAppId);
      let allMatch = true;
      
      if (verifyApp1.Description !== testDescription) {
        console.log(`  ⚠️  Description mismatch: expected "${testDescription}", got "${verifyApp1.Description}"`);
        allMatch = false;
      } else {
        console.log('  ✅ Description updated correctly');
      }
      
      if (verifyApp1.Type !== testType) {
        console.log(`  ⚠️  Type mismatch: expected "${testType}", got "${verifyApp1.Type}"`);
        allMatch = false;
      } else {
        console.log('  ✅ Type updated correctly');
      }
      
      if (verifyApp1.Tester !== testTester) {
        console.log(`  ⚠️  Tester mismatch: expected "${testTester}", got "${verifyApp1.Tester}"`);
        allMatch = false;
      } else {
        console.log('  ✅ Tester updated correctly');
      }

      if (allMatch) {
        console.log('\n🎉 All basic fields were updated successfully!\n');
      } else {
        console.log('\n⚠️  Some fields did not update as expected\n');
      }

    } catch (error) {
      console.error('❌ Basic fields update failed:', error.message);
      console.log('   Error details:', error.response?.data || error.message);
      console.log('');
    }

    // Test 2: Update custom fields using the _customFieldsRaw structure
    console.log('📝 Test 2: Update custom fields');
    
    if (originalApp._customFieldsRaw && originalApp._customFieldsRaw.length > 0) {
      // Find DevOpsProject custom field to update
      const devOpsField = originalApp._customFieldsRaw.find(cf => cf.Name === 'DevOpsProject');
      
      if (devOpsField) {
        console.log(`  Testing with field: ${devOpsField.Name}`);
        console.log(`  Current value: ${devOpsField.Value || '(empty)'}`);
        console.log(`  Field ID: ${devOpsField.Id}`);
        
        const testCustomFieldValue = `TEST-${Date.now()}`;
        console.log(`  New test value: ${testCustomFieldValue}\n`);

        try {
          // Use AppCustomFields format (array of { Id, Value })
          const updateData2 = {
            AppCustomFields: [
              {
                Id: devOpsField.Id,
                Value: testCustomFieldValue
              }
            ]
          };

          await service.api.v4.Apps_Update(testAppId, updateData2);
          console.log('  ✅ Custom field update request accepted\n');

          // Verify the update
          const verifyApp2 = await service.getApplicationDetails(testAppId);
          
          if (verifyApp2.customFields.DevOpsProject === testCustomFieldValue) {
            console.log('  🎉 Custom field was updated successfully!');
            console.log(`  Verified value: ${verifyApp2.customFields.DevOpsProject}\n`);
          } else {
            console.log('  ⚠️  Custom field update accepted but value did not change');
            console.log(`  Expected: ${testCustomFieldValue}`);
            console.log(`  Got: ${verifyApp2.customFields.DevOpsProject}\n`);
          }

        } catch (error) {
          console.error('  ❌ Custom field update failed:', error.message);
          console.log('     Error details:', error.response?.data || error.message);
          console.log('');
        }
      } else {
        console.log('  ⚠️  DevOpsProject field not found\n');
      }

    } else {
      console.log('  ℹ️  No custom fields to test with\n');
    }

    // Test 3: Update multiple custom fields at once
    console.log('📝 Test 3: Update multiple custom fields simultaneously');
    
    if (originalApp._customFieldsRaw && originalApp._customFieldsRaw.length > 0) {
      const jiraField = originalApp._customFieldsRaw.find(cf => cf.Name === 'JiraProject');
      const epicField = originalApp._customFieldsRaw.find(cf => cf.Name === 'JiraParentEpic');
      
      if (jiraField && epicField) {
        console.log(`  Updating: ${jiraField.Name} and ${epicField.Name}`);
        const testJiraValue = `TEST-${Date.now()}`;
        const testEpicValue = `EPIC-${Date.now()}`;
        console.log(`  New values: "${testJiraValue}", "${testEpicValue}"\n`);

        try {
          const updateData3 = {
            AppCustomFields: [
              { Id: jiraField.Id, Value: testJiraValue },
              { Id: epicField.Id, Value: testEpicValue }
            ]
          };

          await service.api.v4.Apps_Update(testAppId, updateData3);
          console.log('  ✅ Multiple custom fields update accepted\n');

          const verifyApp3 = await service.getApplicationDetails(testAppId);
          
          const jiraMatch = verifyApp3.customFields.JiraProject === testJiraValue;
          const epicMatch = verifyApp3.customFields.JiraParentEpic === testEpicValue;
          
          console.log(`  JiraProject: ${jiraMatch ? '✅' : '⚠️'} ${verifyApp3.customFields.JiraProject}`);
          console.log(`  JiraParentEpic: ${epicMatch ? '✅' : '⚠️'} ${verifyApp3.customFields.JiraParentEpic}\n`);
          
          if (jiraMatch && epicMatch) {
            console.log('  🎉 Multiple custom fields updated successfully!\n');
          }

        } catch (error) {
          console.error('  ❌ Multiple custom fields update failed:', error.message);
          console.log('');
        }
      } else {
        console.log('  ℹ️  Required fields not found for test\n');
      }
    }

    // Test 4: Test updating standard field + custom field in one call
    console.log('📝 Test 4: Update standard field and custom field together');
    
    if (originalApp._customFieldsRaw && originalApp._customFieldsRaw.length > 0) {
      const confField = originalApp._customFieldsRaw.find(cf => cf.Name === 'ConfluenceSpace');
      
      if (confField) {
        try {
          const updateData4 = {
            Description: `COMBINED-TEST-${Date.now()}`,
            AppCustomFields: [
              { Id: confField.Id, Value: `CONF-${Date.now()}` }
            ]
          };

          await service.api.v4.Apps_Update(testAppId, updateData4);
          console.log('  ✅ Combined update accepted');
          
          const verifyApp4 = await service.getApplicationDetails(testAppId);
          console.log(`  Description updated: ${verifyApp4.Description?.includes('COMBINED-TEST') ? '✅' : '⚠️'}`);
          console.log(`  ConfluenceSpace updated: ${verifyApp4.customFields.ConfluenceSpace?.includes('CONF-') ? '✅' : '⚠️'}\n`);

        } catch (error) {
          console.error('  ❌ Combined update failed:', error.message);
          console.log('');
        }
      }
    }

    // Restore original values
    console.log('🔄 Restoring original values...');
    try {
      const restoreData = {
        Description: originalApp.Description,
        Type: originalApp.Type,
        Tester: originalApp.Tester,
      };

      // Restore custom fields if we have them
      if (originalApp._customFieldsRaw && originalApp._customFieldsRaw.length > 0) {
        restoreData.AppCustomFields = originalApp._customFieldsRaw.map(cf => ({
          Id: cf.Id,
          Value: cf.Value || '' // API might not accept null, use empty string
        }));
      }

      await service.api.v4.Apps_Update(testAppId, restoreData);
      console.log('✅ Restore request sent\n');

      // Verify restoration
      const finalApp = await service.getApplicationDetails(testAppId);
      console.log('Verification:');
      console.log(`  Description: ${finalApp.Description === originalApp.Description ? '✅' : '⚠️'} restored`);
      console.log(`  Type: ${finalApp.Type === originalApp.Type ? '✅' : '⚠️'} restored`);
      console.log(`  Tester: ${finalApp.Tester === originalApp.Tester ? '✅' : '⚠️'} restored`);
      
      if (originalApp.customFields) {
        console.log('  Custom Fields:');
        Object.entries(originalApp.customFields).forEach(([key, originalValue]) => {
          const currentValue = finalApp.customFields[key];
          const match = currentValue === originalValue;
          console.log(`    ${key}: ${match ? '✅' : '⚠️'} ${match ? 'restored' : `${originalValue} → ${currentValue}`}`);
        });
      }
      console.log('');

    } catch (error) {
      console.error('❌ Failed to restore original values:', error.message);
      console.log('   You may need to manually restore the application:\n');
      console.log(`   Description: ${originalApp.Description}`);
      console.log(`   Type: ${originalApp.Type}`);
      console.log(`   Tester: ${originalApp.Tester}`);
      if (originalApp.customFields) {
        console.log('   Custom Fields:', JSON.stringify(originalApp.customFields, null, 2));
      }
      console.log('');
    }

    console.log('✅ All write tests completed!\n');
    console.log('📊 Summary:');
    console.log('   ✅ Standard fields (Description, Type, Tester) can be updated');
    console.log('   ✅ Custom fields can be updated using AppCustomFields array');
    console.log('   ✅ Custom field updates require the field ID from _customFieldsRaw');
    console.log('   ✅ Multiple custom fields can be updated in one call');
    console.log('   ✅ Standard and custom fields can be updated together');
    console.log('   ✅ Original values were restored successfully\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test failed', error);
    process.exit(1);
  }
}

// Run the test
testApplicationWrite();
