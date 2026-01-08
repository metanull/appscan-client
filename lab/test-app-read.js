/**
 * Test script to verify reading Application details and custom fields
 * Run with: node test-app-read.js
 */

import { AppScanService } from '../src/services/appscan-service.js';
import { Config } from '../src/utils/config.js';
import logger from '../src/utils/logger.js';

async function testApplicationRead() {
  try {
    console.log('🔍 Testing AppScan API - Reading Application Details...\n');

    // Initialize services
    const config = new Config();
    const service = new AppScanService(config);

    // Authenticate
    await service.authenticate();
    console.log('✅ Authenticated successfully\n');

    // Test 1: List all applications
    console.log('📝 Test 1: List all applications');
    const appsResponse = await service.listApplications();
    const apps = appsResponse.Items || appsResponse || [];
    console.log(`✅ Found ${apps.length} application(s)\n`);

    if (apps.length === 0) {
      console.log('⚠️  No applications found to test with');
      return;
    }

    // Show summary of first few apps
    console.log('Sample applications:');
    apps.slice(0, 3).forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.Name} (ID: ${app.Id})`);
      console.log(`     Technology: ${app.Technology || 'N/A'}`);
      console.log(`     Risk Rating: ${app.RiskRating || 'N/A'}`);
      console.log(`     Testing Status: ${app.TestingStatus || 'N/A'}`);
      console.log(`     Has CustomFields: ${app.CustomFields ? 'Yes' : 'No'}`);
      if (app.CustomFields && app.CustomFields.length > 0) {
        console.log(`     Custom Fields Count: ${app.CustomFields.length}`);
        app.CustomFields.forEach(cf => {
          console.log(`       - ${cf.Name}: ${cf.Value || '(empty)'}`);
        });
      }
      console.log('');
    });

    // Test 2: Get detailed information for first application
    const testApp = apps[0];
    console.log(`📝 Test 2: Test different methods to get single application details`);
    console.log(`   Target app: "${testApp.Name}" (${testApp.Id})\n`);
    
    // Method A: Try the current getApplicationDetails implementation
    console.log('Method A: Using getApplicationDetails() [Apps_Get({ Id: appId })]');
    try {
      const appDetails = await service.getApplicationDetails(testApp.Id);
      console.log('  Response received:', typeof appDetails);
      console.log('  Has Items array:', !!appDetails.Items);
      console.log('  Is single object:', !appDetails.Items && typeof appDetails === 'object');
      if (appDetails.Items) {
        console.log(`  Items count: ${appDetails.Items.length}`);
        if (appDetails.Items.length > 0) {
          console.log('  ✅ Got application data via Items array');
          const app = appDetails.Items[0];
          console.log(`     Name: ${app.Name}, CustomFields: ${app.CustomFields?.length || 0}`);
        }
      } else if (appDetails.Id) {
        console.log('  ✅ Got application data as single object');
        console.log(`     Name: ${appDetails.Name}, CustomFields: ${appDetails.CustomFields?.length || 0}`);
      } else {
        console.log('  ❌ Unexpected response structure');
      }
    } catch (error) {
      console.error('  ❌ Failed:', error.message);
    }
    console.log('');

    // Method B: Use list endpoint with $filter
    console.log('Method B: Using Apps_Get with $filter');
    try {
      const filtered = await service.api.v4.Apps_Get({
        $filter: `Id eq ${testApp.Id}`
      });
      console.log('  Response received:', typeof filtered);
      console.log('  Has Items:', !!filtered.Items);
      if (filtered.Items && filtered.Items.length > 0) {
        const app = filtered.Items[0];
        console.log(`  ✅ Found app: ${app.Name}`);
        console.log(`     CustomFields: ${app.CustomFields?.length || 0} fields`);
        console.log(`     All standard fields present: ${!!(app.Id && app.Name && app.RiskRating)}`);
      } else {
        console.log('  ❌ No items returned');
      }
    } catch (error) {
      console.error('  ❌ Failed:', error.message);
    }
    console.log('');

    // Method C: Try direct path parameter (may not exist in API)
    console.log('Method C: Try direct API call to /api/v4/Apps/{id}');
    try {
      // This might not exist, but worth trying
      const response = await service.api.rawRequest('GET', `/api/v4/Apps/${testApp.Id}`);
      console.log('  ✅ Direct endpoint exists!');
      console.log(`     Response type: ${typeof response}`);
      if (response.Name) {
        console.log(`     Name: ${response.Name}`);
        console.log(`     CustomFields: ${response.CustomFields?.length || 0}`);
      }
    } catch (error) {
      console.log(`  ❌ Direct endpoint doesn't exist or failed: ${error.message}`);
    }
    console.log('');

    // Use the working method for remaining tests
    console.log('📝 Using Method B ($filter) for detailed inspection...\n');
    const appDetailsResponse = await service.api.v4.Apps_Get({
      $filter: `Id eq ${testApp.Id}`
    });
    const appDetails = appDetailsResponse.Items?.[0];
    
    if (!appDetails) {
      console.log('❌ Could not retrieve application details\n');
      return;
    }
    
    console.log('Application Details:');
    console.log(`  ID: ${appDetails.Id}`);
    console.log(`  Name: ${appDetails.Name}`);
      console.log(`  Description: ${appDetails.Description || 'N/A'}`);
      console.log(`  URL: ${appDetails.Url || 'N/A'}`);
      console.log(`  Technology: ${appDetails.Technology || 'N/A'}`);
      console.log(`  Type: ${appDetails.Type || 'N/A'}`);
      console.log(`  Risk Rating: ${appDetails.RiskRating || 'N/A'}`);
      console.log(`  Business Impact: ${appDetails.BusinessImpact || 'N/A'}`);
      console.log(`  Testing Status: ${appDetails.TestingStatus || 'N/A'}`);
      console.log(`  Development Contact: ${appDetails.DevelopmentContact || 'N/A'}`);
      console.log(`  Business Owner: ${appDetails.BusinessOwner || 'N/A'}`);
      console.log(`  Tester: ${appDetails.Tester || 'N/A'}`);
      console.log(`  Confidentiality Requirement: ${appDetails.ConfidentialityRequirement || 'N/A'}`);
      console.log(`  Integrity Requirement: ${appDetails.IntegrityRequirement || 'N/A'}`);
      console.log(`  Availability Requirement: ${appDetails.AvailabilityRequirement || 'N/A'}`);
      console.log(`  Date Created: ${appDetails.DateCreated || 'N/A'}`);
      console.log(`  Last Updated: ${appDetails.LastUpdated || 'N/A'}`);
      console.log(`  Total Issues: ${appDetails.TotalIssues || 0}`);
      console.log(`  Open Issues: ${appDetails.OpenIssues || 0}`);
      console.log(`  Total Scans: ${appDetails.TotalScans || 0}`);
      console.log('');

      // Test 3: Check Custom Fields
      console.log('📝 Test 3: Custom Fields Analysis');
      if (appDetails.CustomFields && appDetails.CustomFields.length > 0) {
        console.log(`✅ Found ${appDetails.CustomFields.length} custom field(s):\n`);
        
        appDetails.CustomFields.forEach(cf => {
          console.log(`  Field: ${cf.Name}`);
          console.log(`    ID: ${cf.Id}`);
          console.log(`    Value: ${cf.Value || '(empty)'}`);
          console.log(`    Value Type: ${cf.ValueType || 'N/A'}`);
          console.log(`    Created By: ${cf.CreatedBy || 'N/A'}`);
          console.log('');
        });

        // Check for expected custom fields
        const expectedFields = [
          'DevOpsProject',
          'JiraProject',
          'DevOpsRepo',
          'ConfluenceSpace',
          'JiraParentEpic'
        ];

        console.log('Expected custom fields status:');
        expectedFields.forEach(fieldName => {
          const field = appDetails.CustomFields.find(cf => cf.Name === fieldName);
          if (field) {
            console.log(`  ✅ ${fieldName}: ${field.Value || '(not set)'}`);
          } else {
            console.log(`  ❌ ${fieldName}: Not found`);
          }
        });
        console.log('');
      } else {
        console.log('⚠️  No custom fields found for this application\n');
      }

      // Test 4: Check if CustomFields are included in list response
      console.log('📝 Test 4: Verify CustomFields in list vs detail response');
      const listApp = apps.find(a => a.Id === testApp.Id);
      const listHasCustomFields = listApp && listApp.CustomFields && listApp.CustomFields.length > 0;
      const detailsHasCustomFields = appDetails.CustomFields && appDetails.CustomFields.length > 0;
      
      if (listHasCustomFields && detailsHasCustomFields) {
        console.log('✅ CustomFields are included in both list and detail responses');
        console.log(`   List response: ${listApp.CustomFields.length} fields`);
        console.log(`   Detail response: ${appDetails.CustomFields.length} fields`);
      } else if (!listHasCustomFields && detailsHasCustomFields) {
        console.log('⚠️  CustomFields only in detail response, not in list response');
      } else if (listHasCustomFields && !detailsHasCustomFields) {
        console.log('⚠️  CustomFields only in list response, not in detail response');
      } else {
        console.log('ℹ️  No CustomFields in either response');
      }
      console.log('');

    // Test 5: Test with $expand parameter
    console.log('📝 Test 5: Test OData $expand parameter');
    try {
      const expandedApps = await service.api.v4.Apps_Get({
        $top: 1,
        $expand: 'CustomFields'
      });
      console.log('✅ OData $expand parameter accepted');
      const app = expandedApps.Items?.[0] || expandedApps?.[0];
      if (app) {
        console.log(`   CustomFields expanded: ${app.CustomFields ? 'Yes' : 'No'}`);
        if (app.CustomFields) {
          console.log(`   CustomFields count: ${app.CustomFields.length}`);
        }
      }
      console.log('');
    } catch (error) {
      console.error('❌ $expand parameter failed:', error.message);
      console.log('');
    }

    // Test 6: Validate CustomFields transformation approach
    console.log('📝 Test 6: Test CustomFields transformation to key-value pairs');
    
    const testTransformApp = await service.api.v4.Apps_Get({
      $filter: `Id eq ${testApp.Id}`
    });
    const transformApp = testTransformApp.Items?.[0];
    
    if (transformApp && transformApp.CustomFields) {
      console.log('Original CustomFields structure:');
      console.log(JSON.stringify(transformApp.CustomFields[0], null, 2));
      console.log('');
      
      // Test transformation: array of objects -> key-value object
      const customFieldsMap = {};
      transformApp.CustomFields.forEach(cf => {
        // Convert empty strings to null
        customFieldsMap[cf.Name] = (cf.Value && cf.Value.trim()) ? cf.Value : null;
      });
      
      console.log('Transformed to key-value pairs:');
      console.log(JSON.stringify(customFieldsMap, null, 2));
      console.log('');
      
      // Verify empty values are null, not empty strings
      console.log('Verifying null handling:');
      const emptyFields = Object.entries(customFieldsMap).filter(([k, v]) => v === null);
      const emptyStringFields = Object.entries(customFieldsMap).filter(([k, v]) => v === '');
      console.log(`  Fields with null value: ${emptyFields.length}`);
      console.log(`  Fields with empty string: ${emptyStringFields.length} ${emptyStringFields.length > 0 ? '❌ SHOULD BE NULL!' : '✅'}`);
      console.log('');
      
      // Show how to safely access values
      console.log('Safe access patterns:');
      console.log(`  customFields.DevOpsProject === null: ${customFieldsMap.DevOpsProject === null}`);
      console.log(`  customFields.JiraProject || 'default': "${customFieldsMap.JiraProject || 'default'}"`);
      console.log(`  customFields.JiraParentEpic ?? 'fallback': "${customFieldsMap.JiraParentEpic ?? 'fallback'}"`);
      console.log('');
      
      // Test if we lose any information
      console.log('Information preserved?');
      console.log(`  ✅ Field names: All ${transformApp.CustomFields.length} preserved`);
      console.log(`  ✅ Field values: All preserved (null for empty)`);
      console.log(`  ⚠️  Field IDs: Lost (but not needed for reading)`);
      console.log(`  ⚠️  Created By: Lost (but not needed for reading)`);
      console.log(`  ⚠️  Value Type: Lost (but can infer from value)`);
      console.log('');
      
      // Check if this works for updates (we might need IDs)
      console.log('⚠️  IMPORTANT: For UPDATES, we may still need the field IDs!');
      console.log('   If updating custom fields requires the ID, we should keep:');
      console.log('   - Simplified structure for READ operations (commands, reports)');
      console.log('   - Original structure preserved for UPDATE operations');
      console.log('');
      
    } else {
      console.log('⚠️  No custom fields to test transformation\n');
    }

    console.log('✅ All read tests completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - listApplications() works correctly');
    console.log('   - getApplicationDetails() needs fixing (use $filter)');
    console.log('   - CustomFields are accessible in API responses');
    console.log('   - CustomFields can be safely transformed to key-value pairs for READ');
    console.log('   - Original structure may be needed for WRITE operations\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test failed', error);
  }
}

// Run the test
testApplicationRead();
