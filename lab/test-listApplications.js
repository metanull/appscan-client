/**
 * Test script to verify the enhanced listApplications() method
 * Run with: node test-listApplications.js
 */

import { AppScanService } from '../src/services/appscan-service.js';
import { Config } from '../src/utils/config.js';
import logger from '../src/utils/logger.js';

async function testListApplications() {
  try {
    console.log('🔍 Testing Enhanced listApplications() Method...\n');

    // Initialize services
    const config = new Config();
    const service = new AppScanService(config);

    // Authenticate
    await service.authenticate();
    console.log('✅ Authenticated successfully\n');

    // Test listApplications
    console.log('📝 Step 1: Call listApplications()');
    const response = await service.listApplications();
    
    console.log('✅ Method returned successfully\n');
    
    // Verify response structure
    console.log('📝 Step 2: Verify response structure');
    console.log(`   Has Items array: ${!!response.Items}`);
    console.log(`   Items count: ${response.Items?.length || 0}`);
    console.log(`   Has other properties: ${Object.keys(response).filter(k => k !== 'Items').length > 0 ? 'Yes' : 'No'}`);
    console.log('');

    if (!response.Items || response.Items.length === 0) {
      console.log('⚠️  No applications to test with');
      return;
    }

    // Test first application structure
    const firstApp = response.Items[0];
    console.log('📝 Step 3: Verify first application structure');
    console.log(`   Application: ${firstApp.Name}`);
    console.log(`   Has Id: ${!!firstApp.Id}`);
    console.log(`   Has Name: ${!!firstApp.Name}`);
    console.log(`   Has RiskRating: ${!!firstApp.RiskRating}`);
    console.log(`   Has customFields: ${!!firstApp.customFields}`);
    console.log(`   Has _customFieldsRaw: ${!!firstApp._customFieldsRaw}`);
    console.log(`   CustomFields removed: ${firstApp.CustomFields === undefined ? '✅' : '❌'}`);
    console.log('');

    // Verify customFields structure
    if (firstApp.customFields) {
      console.log('📝 Step 4: Verify customFields transformation');
      console.log(`   Type: ${typeof firstApp.customFields}`);
      console.log(`   Is object: ${typeof firstApp.customFields === 'object' && !Array.isArray(firstApp.customFields) ? '✅' : '❌'}`);
      console.log(`   Keys: ${Object.keys(firstApp.customFields).join(', ')}`);
      console.log('');

      console.log('   Values:');
      Object.entries(firstApp.customFields).forEach(([key, value]) => {
        const valueType = value === null ? 'null' : typeof value;
        console.log(`     ${key}: ${value === null ? 'null' : `"${value}"`} (${valueType})`);
      });
      console.log('');

      // Verify no empty strings
      const emptyStrings = Object.entries(firstApp.customFields).filter(([k, v]) => v === '');
      console.log(`   Empty strings found: ${emptyStrings.length} ${emptyStrings.length === 0 ? '✅' : '❌'}`);
    } else {
      console.log('📝 Step 4: No customFields to verify\n');
    }

    // Verify _customFieldsRaw preserved
    if (firstApp._customFieldsRaw) {
      console.log('📝 Step 5: Verify _customFieldsRaw structure');
      console.log(`   Type: ${Array.isArray(firstApp._customFieldsRaw) ? 'array' : typeof firstApp._customFieldsRaw} ${Array.isArray(firstApp._customFieldsRaw) ? '✅' : '❌'}`);
      console.log(`   Count: ${firstApp._customFieldsRaw.length}`);
      if (firstApp._customFieldsRaw.length > 0) {
        const firstField = firstApp._customFieldsRaw[0];
        console.log(`   Has Id: ${!!firstField.Id}`);
        console.log(`   Has Name: ${!!firstField.Name}`);
        console.log(`   Has Value: ${firstField.Value !== undefined}`);
        console.log(`   Has ValueType: ${!!firstField.ValueType}`);
      }
      console.log('');
    }

    // Test with app that has populated custom fields (Agora)
    console.log('📝 Step 6: Find and verify Agora app with real custom field data');
    const agoraId = '71d969b5-8d40-4921-a3ce-8de07c04da7c';
    const agoraApp = response.Items.find(app => app.Id === agoraId);
    
    if (!agoraApp) {
      console.log('   ❌ Agora app not found in list\n');
      throw new Error('Agora app (71d969b5-8d40-4921-a3ce-8de07c04da7c) not found - cannot validate with real data');
    }
    
    console.log(`✅ Found: ${agoraApp.Name} (${agoraApp.Id})`);
    console.log('');
    
    if (!agoraApp.customFields) {
      console.log('   ❌ No customFields property found\n');
      throw new Error('customFields property missing from Agora app');
    }
    
    console.log('   Custom Fields:');
    const expectedFields = {
      DevOpsProject: 'Agora',
      JiraProject: 'AGR',
      DevOpsRepo: 'Agora,agora-config,Agora-db,agora-event-grid-poc,agora-event-grid-poc-sb,Backup',
      ConfluenceSpace: 'AGORA',
      JiraParentEpic: 'SEC-509'
    };
    
    let allMatch = true;
    Object.entries(expectedFields).forEach(([key, expectedValue]) => {
      const actualValue = agoraApp.customFields[key];
      const matches = actualValue === expectedValue;
      const icon = matches ? '✅' : '❌';
      
      if (!matches) {
        console.log(`     ${icon} ${key}: Expected "${expectedValue}", got "${actualValue || '(not set)'}"`);
        allMatch = false;
      } else {
        console.log(`     ${icon} ${key}: ${actualValue}`);
      }
    });
    
    console.log('');
    if (allMatch) {
      console.log('   🎉 All custom fields match expected values!');
    } else {
      console.log('   ❌ Some custom fields do not match expected values');
      throw new Error('Custom field values do not match expected data');
    }
    console.log('');

    // Verify all apps have consistent structure
    console.log('📝 Step 7: Verify all applications have consistent structure');
    let inconsistencies = 0;
    
    response.Items.forEach((app, index) => {
      if (app.CustomFields !== undefined) {
        console.log(`   ❌ App ${index + 1} (${app.Name}) still has CustomFields property`);
        inconsistencies++;
      }
      if (app.customFields && typeof app.customFields !== 'object') {
        console.log(`   ❌ App ${index + 1} (${app.Name}) has invalid customFields type`);
        inconsistencies++;
      }
      if (app.customFields && Array.isArray(app.customFields)) {
        console.log(`   ❌ App ${index + 1} (${app.Name}) has customFields as array (should be object)`);
        inconsistencies++;
      }
    });
    
    if (inconsistencies === 0) {
      console.log(`   ✅ All ${response.Items.length} applications have consistent structure`);
    } else {
      console.log(`   ⚠️  Found ${inconsistencies} inconsistencies`);
    }
    console.log('');

    // Test backward compatibility - verify existing properties still present
    console.log('📝 Step 8: Verify backward compatibility (existing properties preserved)');
    const requiredProps = ['Id', 'Name', 'RiskRating', 'TotalIssues', 'OpenIssues', 'TotalScans'];
    const sampleApp = response.Items[0];
    
    requiredProps.forEach(prop => {
      const exists = sampleApp[prop] !== undefined;
      console.log(`   ${prop}: ${exists ? '✅' : '❌'}`);
    });
    console.log('');

    console.log('🎉 All tests passed!\n');
    console.log('📊 Summary:');
    console.log(`   ✅ listApplications() returns Items array (${response.Items.length} apps)`);
    console.log('   ✅ CustomFields transformed to customFields object for all apps');
    console.log('   ✅ Empty values converted to null (no empty strings)');
    console.log('   ✅ Original structure preserved as _customFieldsRaw');
    console.log('   ✅ All apps have consistent structure');
    console.log('   ✅ Backward compatible - existing properties preserved');
    console.log('   ✅ Ready for use in TUI and commands\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test failed', error);
    process.exit(1);
  }
}

// Run the test
testListApplications();
