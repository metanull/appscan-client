/**
 * Lab script to explore FixGroup/CorrelationGroup API structure
 * Tests retrieving fix groups for an application
 * Run with: node lab/test-fixgroup-list.js
 */

import { AppScanService } from '../src/services/appscan-service.js';
import { Config } from '../src/utils/config.js';

/**
 * Test retrieving FixGroups for an application
 */
async function testFixGroupList() {
  try {
    console.log('🔍 Testing FixGroup API...\n');

    const config = new Config();
    const service = new AppScanService(config);

    await service.authenticate();
    console.log('✅ Authenticated\n');

    console.log('📝 Step 1: Get applications');
    const appsResponse = await service.listApplications();
    if (!appsResponse.Items || appsResponse.Items.length === 0) {
      console.log('❌ No applications found');
      return;
    }

    const app = appsResponse.Items[0];
    console.log(`   Testing with: ${app.Name} (${app.Id})`);
    console.log(`   Total applications available: ${appsResponse.Items.length}\n`);

    console.log('📝 Step 2: Test FixGroups_Get endpoint');
    console.log('   Trying: FixGroups_Get("Application", appId, {})');
    
    try {
      const fixGroupsResponse = await service.api.v4.FixGroups_Get(
        'Application',
        app.Id,
        {}
      );
      
      console.log('✅ FixGroups_Get succeeded\n');
      console.log('📊 Response structure:');
      console.log(`   Has Items: ${!!fixGroupsResponse.Items}`);
      console.log(`   Items count: ${fixGroupsResponse.Items?.length || 0}`);
      console.log(`   Has TotalCount: ${fixGroupsResponse.TotalCount !== undefined}`);
      console.log(`   TotalCount: ${fixGroupsResponse.TotalCount}`);
      
      if (fixGroupsResponse.Items && fixGroupsResponse.Items.length > 0) {
        console.log('\n📋 First FixGroup structure:');
        const firstGroup = fixGroupsResponse.Items[0];
        console.log(JSON.stringify(firstGroup, null, 2));
        
        console.log('\n📊 FixGroup fields analysis:');
        const fields = Object.keys(firstGroup);
        console.log(`   Total fields: ${fields.length}`);
        console.log(`   Fields: ${fields.join(', ')}`);
        
        console.log('\n📈 FixGroups summary by status:');
        const statusCounts = {};
        const severityCounts = {};
        fixGroupsResponse.Items.forEach(group => {
          statusCounts[group.Status] = (statusCounts[group.Status] || 0) + 1;
          severityCounts[group.Severity] = (severityCounts[group.Severity] || 0) + 1;
        });
        console.log('   Status distribution:', statusCounts);
        console.log('   Severity distribution:', severityCounts);
      } else {
        console.log('\n⚠️  No FixGroups found for this application');
      }
    } catch (error) {
      console.log(`❌ FixGroups_Get failed: ${error.message}`);
    }

    console.log('\n📝 Step 3: Test CorrelationGroups endpoint');
    console.log('   Trying: Apps_GetAppCorrelationGroups(appId, {})');
    
    try {
      const correlationResponse = await service.api.v4.Apps_GetAppCorrelationGroups(
        app.Id,
        {}
      );
      
      console.log('✅ Apps_GetAppCorrelationGroups succeeded\n');
      console.log('📊 Response structure:');
      console.log(`   Has Items: ${!!correlationResponse.Items}`);
      console.log(`   Items count: ${correlationResponse.Items?.length || 0}`);
      console.log(`   Has TotalCount: ${correlationResponse.TotalCount !== undefined}`);
      console.log(`   TotalCount: ${correlationResponse.TotalCount}`);
      
      if (correlationResponse.Items && correlationResponse.Items.length > 0) {
        console.log('\n📋 First CorrelationGroup structure:');
        const firstGroup = correlationResponse.Items[0];
        console.log(JSON.stringify(firstGroup, null, 2));
      } else {
        console.log('\n⚠️  No CorrelationGroups found for this application');
      }
    } catch (error) {
      console.log(`❌ Apps_GetAppCorrelationGroups failed: ${error.message}`);
    }

    console.log('\n📝 Step 4: Test with OData filters');
    console.log('   Trying: $filter=Status eq \'Open\'');
    
    try {
      const filteredResponse = await service.api.v4.FixGroups_Get(
        'Application',
        app.Id,
        { '$filter': "Status eq 'Open'" }
      );
      
      console.log(`✅ Filtered query succeeded, returned ${filteredResponse.Items?.length || 0} groups\n`);
    } catch (error) {
      console.log(`❌ Filtered query failed: ${error.message}\n`);
    }

    console.log('📝 Step 5: Test with OData $select');
    console.log('   Trying: $select=Id,Subject,Severity,Status,NIssues');
    
    try {
      const selectResponse = await service.api.v4.FixGroups_Get(
        'Application',
        app.Id,
        { '$select': 'Id,Subject,Severity,Status,NIssues' }
      );
      
      console.log(`✅ Select query succeeded, returned ${selectResponse.Items?.length || 0} groups`);
      if (selectResponse.Items && selectResponse.Items.length > 0) {
        console.log('   First item fields:', Object.keys(selectResponse.Items[0]).join(', '));
      }
    } catch (error) {
      console.log(`❌ Select query failed: ${error.message}`);
    }

    console.log('\n✅ Test complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testFixGroupList();
