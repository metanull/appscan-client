/**
 * Lab script to explore retrieving issues by FixGroup
 * Tests how to filter vulnerabilities by FixGroupId
 * Run with: node lab/test-fixgroup-issues.js
 */

import { AppScanService } from '../src/services/appscan-service.js';
import { Config } from '../src/utils/config.js';

/**
 * Test retrieving issues filtered by FixGroup
 */
async function testFixGroupIssues() {
  try {
    console.log('🔍 Testing FixGroup Issues Retrieval...\n');

    const config = new Config();
    const service = new AppScanService(config);

    await service.authenticate();
    console.log('✅ Authenticated\n');

    console.log('📝 Step 1: Get application with FixGroups');
    const appsResponse = await service.listApplications();
    if (!appsResponse.Items || appsResponse.Items.length === 0) {
      console.log('❌ No applications found');
      return;
    }

    const app = appsResponse.Items[0];
    console.log(`   Application: ${app.Name} (${app.Id})\n`);

    console.log('📝 Step 2: Get FixGroups for application');
    const fixGroupsResponse = await service.api.v4.FixGroups_Get(
      'Application',
      app.Id,
      {}
    );

    if (!fixGroupsResponse.Items || fixGroupsResponse.Items.length === 0) {
      console.log('❌ No FixGroups found for this application');
      return;
    }

    const fixGroup = fixGroupsResponse.Items.find(g => g.NIssues > 0) || fixGroupsResponse.Items[0];
    console.log(`   Selected FixGroup: ${fixGroup.Subject}`);
    console.log(`   FixGroup ID: ${fixGroup.Id}`);
    console.log(`   Total Issues: ${fixGroup.NIssues}`);
    console.log(`   Open Issues: ${fixGroup.NOpenIssues}\n`);

    console.log('📝 Step 3: Test filtering issues by FixGroupId (Application scope)');
    console.log(`   Query: Issues_Get("Application", appId, { $filter: "FixGroupId eq ${fixGroup.Id}" })`);
    
    try {
      const issuesResponse = await service.api.v4.Issues_Get(
        'Application',
        app.Id,
        { '$filter': `FixGroupId eq ${fixGroup.Id}` }
      );
      
      console.log(`✅ Query succeeded\n`);
      console.log('📊 Response structure:');
      console.log(`   Has Items: ${!!issuesResponse.Items}`);
      console.log(`   Items count: ${issuesResponse.Items?.length || 0}`);
      console.log(`   Expected count from FixGroup: ${fixGroup.NIssues}`);
      console.log(`   Match: ${issuesResponse.Items?.length === fixGroup.NIssues ? '✅' : '❌'}`);
      
      if (issuesResponse.Items && issuesResponse.Items.length > 0) {
        console.log('\n📋 First Issue structure:');
        const firstIssue = issuesResponse.Items[0];
        console.log(`   Issue ID: ${firstIssue.Id}`);
        console.log(`   FixGroupId: ${firstIssue.FixGroupId}`);
        console.log(`   IssueType: ${firstIssue.IssueType}`);
        console.log(`   Severity: ${firstIssue.Severity}`);
        console.log(`   Status: ${firstIssue.Status}`);
        
        console.log('\n   All fields:', Object.keys(firstIssue).join(', '));
      }
    } catch (error) {
      console.log(`❌ Query failed: ${error.message}`);
      console.log(`   Error details: ${error.response?.data || error.stack}`);
    }

    console.log('\n📝 Step 4: Test with scan scope (if scans exist)');
    
    try {
      const scansResponse = await service.listScans(app.Id);
      
      if (scansResponse.Items && scansResponse.Items.length > 0) {
        const scan = scansResponse.Items[0];
        console.log(`   Using scan: ${scan.Name} (${scan.Id})`);
        
        const scanIssuesResponse = await service.api.v4.Issues_Get(
          'Scan',
          scan.Id,
          { '$filter': `FixGroupId eq ${fixGroup.Id}` }
        );
        
        console.log(`✅ Scan-scoped query succeeded`);
        console.log(`   Issues found: ${scanIssuesResponse.Items?.length || 0}`);
      } else {
        console.log('   No scans found to test scan scope');
      }
    } catch (error) {
      console.log(`   Scan scope test failed: ${error.message}`);
    }

    console.log('\n📝 Step 5: Test selecting specific fields');
    console.log('   Query with $select=Id,FixGroupId,IssueType,Severity,Status');
    
    try {
      const selectResponse = await service.api.v4.Issues_Get(
        'Application',
        app.Id,
        {
          '$filter': `FixGroupId eq ${fixGroup.Id}`,
          '$select': 'Id,FixGroupId,IssueType,Severity,Status'
        }
      );
      
      console.log(`✅ Select query succeeded`);
      console.log(`   Issues returned: ${selectResponse.Items?.length || 0}`);
      if (selectResponse.Items && selectResponse.Items.length > 0) {
        console.log('   Fields in response:', Object.keys(selectResponse.Items[0]).join(', '));
      }
    } catch (error) {
      console.log(`❌ Select query failed: ${error.message}`);
    }

    console.log('\n📝 Step 6: Test combining filters');
    console.log('   Query with Status and FixGroupId filters');
    
    try {
      const combinedResponse = await service.api.v4.Issues_Get(
        'Application',
        app.Id,
        { '$filter': `FixGroupId eq ${fixGroup.Id} and Status ne 'Noise'` }
      );
      
      console.log(`✅ Combined filter succeeded`);
      console.log(`   Issues returned: ${combinedResponse.Items?.length || 0}`);
      
      if (combinedResponse.Items && combinedResponse.Items.length > 0) {
        const statuses = {};
        combinedResponse.Items.forEach(issue => {
          statuses[issue.Status] = (statuses[issue.Status] || 0) + 1;
        });
        console.log('   Status distribution:', statuses);
      }
    } catch (error) {
      console.log(`❌ Combined filter failed: ${error.message}`);
    }

    console.log('\n📝 Step 7: Test grouping by FixGroup');
    console.log('   Testing multiple FixGroups to verify grouping');
    
    const testFixGroups = fixGroupsResponse.Items.slice(0, 3);
    console.log(`   Testing with ${testFixGroups.length} FixGroups\n`);
    
    for (const fg of testFixGroups) {
      try {
        const fgIssues = await service.api.v4.Issues_Get(
          'Application',
          app.Id,
          { '$filter': `FixGroupId eq ${fg.Id}` }
        );
        
        console.log(`   FixGroup: ${fg.Subject.substring(0, 50)}...`);
        console.log(`      Expected: ${fg.NIssues} issues, Got: ${fgIssues.Items?.length || 0} ${fgIssues.Items?.length === fg.NIssues ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`      ❌ Failed: ${error.message}`);
      }
    }

    console.log('\n📝 Step 8: Test issue fields related to FixGroup');
    console.log('   Analyzing fields that link issues to FixGroups');
    
    try {
      const allIssues = await service.api.v4.Issues_Get(
        'Application',
        app.Id,
        { '$top': 20 }
      );
      
      if (allIssues.Items && allIssues.Items.length > 0) {
        const withFixGroup = allIssues.Items.filter(i => i.FixGroupId);
        const withCorrelationGroup = allIssues.Items.filter(i => i.CorrelationGroupId);
        
        console.log(`   Total issues sampled: ${allIssues.Items.length}`);
        console.log(`   Issues with FixGroupId: ${withFixGroup.length}`);
        console.log(`   Issues with CorrelationGroupId: ${withCorrelationGroup.length}`);
        
        if (withFixGroup.length > 0) {
          const uniqueFixGroups = new Set(withFixGroup.map(i => i.FixGroupId));
          console.log(`   Unique FixGroups in sample: ${uniqueFixGroups.size}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Analysis failed: ${error.message}`);
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

testFixGroupIssues();
