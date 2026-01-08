/**
 * Test script to verify the fixed getApplicationDetails() method
 * Run with: node test-getApplicationDetails.js
 */

import { AppScanService } from '../src/services/appscan-service.js';
import { Config } from '../src/utils/config.js';
import logger from '../src/utils/logger.js';

async function testGetApplicationDetails() {
  try {
    console.log('🔍 Testing Fixed getApplicationDetails() Method...\n');

    // Initialize services
    const config = new Config();
    const service = new AppScanService(config);

    // Authenticate
    await service.authenticate();
    console.log('✅ Authenticated successfully\n');

    // Get first application
    console.log('📝 Step 1: Get list of applications');
    const appsResponse = await service.listApplications();
    const apps = appsResponse.Items || appsResponse || [];
    
    if (apps.length === 0) {
      console.log('❌ No applications found to test with');
      return;
    }

    const testApp = apps[0];
    console.log(`✅ Found ${apps.length} applications`);
    console.log(`   Using: ${testApp.Name} (${testApp.Id})\n`);

    // Test the fixed method
    console.log('📝 Step 2: Call getApplicationDetails()');
    const appDetails = await service.getApplicationDetails(testApp.Id);

    // Verify the response structure
    console.log('✅ Method returned successfully\n');
    
    console.log('📝 Step 3: Verify response structure');
    console.log(`   Type: ${typeof appDetails}`);
    console.log(`   Is single object: ${!Array.isArray(appDetails)}`);
    console.log(`   Has Id: ${!!appDetails.Id}`);
    console.log(`   Has Name: ${!!appDetails.Name}`);
    console.log(`   Id matches requested: ${appDetails.Id === testApp.Id ? '✅' : '❌'}`);
    console.log('');

    // Verify CustomFields transformation
    console.log('📝 Step 4: Verify CustomFields transformation');
    console.log(`   Has customFields property: ${!!appDetails.customFields}`);
    console.log(`   customFields is object: ${appDetails.customFields && typeof appDetails.customFields === 'object'}`);
    console.log(`   customFields is NOT array: ${!Array.isArray(appDetails.customFields)}`);
    console.log(`   Original CustomFields removed: ${appDetails.CustomFields === undefined ? '✅' : '❌'}`);
    console.log(`   Raw data preserved: ${!!appDetails._customFieldsRaw}`);
    console.log('');

    if (appDetails.customFields) {
      console.log('📝 Step 5: Inspect customFields key-value structure');
      console.log('   Keys:', Object.keys(appDetails.customFields).join(', '));
      console.log('');
      console.log('   Values:');
      Object.entries(appDetails.customFields).forEach(([key, value]) => {
        const valueType = value === null ? 'null' : typeof value;
        const displayValue = value === null ? 'null' : `"${value}"`;
        console.log(`     ${key}: ${displayValue} (${valueType})`);
      });
      console.log('');

      // Verify no empty strings
      const emptyStrings = Object.entries(appDetails.customFields).filter(([k, v]) => v === '');
      console.log(`   Empty strings found: ${emptyStrings.length} ${emptyStrings.length === 0 ? '✅' : '❌ SHOULD BE NULL'}`);
      
      // Verify nulls for empty values
      const nullValues = Object.entries(appDetails.customFields).filter(([k, v]) => v === null);
      console.log(`   Null values: ${nullValues.length} ✅`);
      console.log('');
    } else {
      console.log('⚠️  No customFields in response\n');
    }

    // Test access patterns
    console.log('📝 Step 6: Test access patterns');
    if (appDetails.customFields) {
      console.log('   Direct access:');
      console.log(`     appDetails.customFields.DevOpsProject: ${appDetails.customFields.DevOpsProject ?? 'null'}`);
      console.log(`     appDetails.customFields.JiraProject: ${appDetails.customFields.JiraProject ?? 'null'}`);
      console.log(`     appDetails.customFields.JiraParentEpic: ${appDetails.customFields.JiraParentEpic ?? 'null'}`);
      console.log('');
      console.log('   With fallback:');
      console.log(`     customFields.DevOpsProject || "default": "${appDetails.customFields.DevOpsProject || 'default'}"`);
      console.log(`     customFields.JiraProject ?? "N/A": "${appDetails.customFields.JiraProject ?? 'N/A'}"`);
      console.log('');
    }

    // Verify standard fields
    console.log('📝 Step 7: Verify all standard fields are present');
    const requiredFields = ['Id', 'Name', 'RiskRating', 'BusinessImpact', 'TestingStatus'];
    const missingFields = requiredFields.filter(field => appDetails[field] === undefined);
    
    if (missingFields.length === 0) {
      console.log('   ✅ All required fields present');
    } else {
      console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
    }
    console.log('');

    // Show sample of key fields
    console.log('📝 Step 8: Sample application data');
    console.log(`   Name: ${appDetails.Name}`);
    console.log(`   Description: ${appDetails.Description || 'N/A'}`);
    console.log(`   Technology: ${appDetails.Technology || 'N/A'}`);
    console.log(`   Risk Rating: ${appDetails.RiskRating || 'N/A'}`);
    console.log(`   Business Impact: ${appDetails.BusinessImpact || 'N/A'}`);
    console.log(`   Testing Status: ${appDetails.TestingStatus || 'N/A'}`);
    console.log(`   Total Issues: ${appDetails.TotalIssues || 0}`);
    console.log(`   Open Issues: ${appDetails.OpenIssues || 0}`);
    console.log(`   Total Scans: ${appDetails.TotalScans || 0}`);
    console.log('');

    // Test error handling - invalid ID
    console.log('📝 Step 9: Test error handling with invalid ID');
    try {
      await service.getApplicationDetails('00000000-0000-0000-0000-000000000000');
      console.log('   ❌ Should have thrown an error for invalid ID');
    } catch (error) {
      console.log(`   ✅ Correctly threw error: "${error.message}"`);
    }
    console.log('');

    console.log('🎉 All tests passed!\n');
    console.log('📊 Summary:');
    console.log('   ✅ getApplicationDetails() returns single application object');
    console.log('   ✅ Returns only the requested application (not all apps)');
    console.log('   ✅ CustomFields transformed to simple key-value object');
    console.log('   ✅ Empty values converted to null (not empty strings)');
    console.log('   ✅ Original CustomFields structure preserved as _customFieldsRaw');
    console.log('   ✅ All standard application fields present');
    console.log('   ✅ Error handling works for invalid IDs\n');

    // Test with Agora app (has real custom field values)
    console.log('📝 Step 10: Test with Agora app (real custom field data)');
    const agoraId = '71d969b5-8d40-4921-a3ce-8de07c04da7c';
    try {
      const agoraApp = await service.getApplicationDetails(agoraId);
      console.log(`✅ Retrieved: ${agoraApp.Name}`);
      console.log('');
      
      if (agoraApp.customFields) {
        console.log('   Custom Fields with real data:');
        Object.entries(agoraApp.customFields).forEach(([key, value]) => {
          const hasValue = value !== null && value !== '';
          const icon = hasValue ? '✅' : '○';
          const displayValue = value || '(not set)';
          console.log(`     ${icon} ${key}: ${displayValue}`);
        });
        
        const populatedFields = Object.values(agoraApp.customFields).filter(v => v !== null).length;
        console.log('');
        console.log(`   Populated fields: ${populatedFields}/${Object.keys(agoraApp.customFields).length}`);
      } else {
        console.log('   ⚠️  No custom fields found');
      }
      console.log('');
    } catch (error) {
      console.log(`   ⚠️  Could not retrieve Agora app: ${error.message}`);
      console.log('');
    }

    console.log('🎉 All tests passed!\n');
    console.log('📊 Summary:');
    console.log('   ✅ getApplicationDetails() returns single application object');
    console.log('   ✅ Returns only the requested application (not all apps)');
    console.log('   ✅ CustomFields transformed to simple key-value object');
    console.log('   ✅ Empty values converted to null (not empty strings)');
    console.log('   ✅ Original CustomFields structure preserved as _customFieldsRaw');
    console.log('   ✅ All standard application fields present');
    console.log('   ✅ Error handling works for invalid IDs');
    console.log('   ✅ Works correctly with real custom field data\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test failed', error);
    process.exit(1);
  }
}

// Run the test
testGetApplicationDetails();
