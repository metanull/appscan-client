/**
 * Test script to verify TUI wrapper's listApplications() method
 * Run with: node lab/test-tui-listApplications.js
 */

import { AppScanService } from '../src/tui/services/appscan.js';
import logger from '../src/utils/logger.js';

async function testTuiListApplications() {
  try {
    console.log('🔍 Testing TUI Wrapper listApplications() Method...\n');

    // Initialize TUI service
    const service = new AppScanService();
    console.log('✅ TUI service initialized\n');

    // Test listApplications
    console.log('📝 Step 1: Call TUI listApplications()');
    const result = await service.listApplications();
    
    console.log('✅ Method returned successfully\n');
    
    // Analyze what we got back
    console.log('📝 Step 2: Analyze return value');
    console.log(`   Type: ${typeof result}`);
    console.log(`   Is array: ${Array.isArray(result)}`);
    console.log(`   Is object: ${typeof result === 'object' && !Array.isArray(result)}`);
    
    if (Array.isArray(result)) {
      console.log(`   ✅ Got array with ${result.length} items`);
      
      if (result.length > 0) {
        console.log('\n📝 Step 3: Check first item structure');
        const first = result[0];
        console.log(`   Has Id: ${!!first.Id}`);
        console.log(`   Has Name: ${!!first.Name}`);
        console.log(`   Has customFields: ${!!first.customFields}`);
        console.log(`   Sample: ${first.Name || first.Id}`);
      }
    } else if (result && result.Items) {
      console.log(`   ❌ Got response object with Items array (${result.Items.length} items)`);
      console.log('   ISSUE: Wrapper should return array, not response object');
      
      if (result.Items.length > 0) {
        console.log('\n📝 Step 3: Check first item structure in Items array');
        const first = result.Items[0];
        console.log(`   Has Id: ${!!first.Id}`);
        console.log(`   Has Name: ${!!first.Name}`);
        console.log(`   Has customFields: ${!!first.customFields}`);
        console.log(`   Sample: ${first.Name || first.Id}`);
      }
    } else {
      console.log('   ❌ Unexpected return value structure');
      console.log(`   Keys: ${Object.keys(result || {}).join(', ')}`);
    }
    
    console.log('\n📊 Summary:');
    if (Array.isArray(result)) {
      console.log('   ✅ TUI wrapper correctly returns array');
    } else if (result && result.Items) {
      console.log('   ❌ TUI wrapper incorrectly returns response object');
      console.log('   FIX NEEDED: Wrapper should extract Items array');
    } else {
      console.log('   ❌ Unexpected return format');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('TUI test failed', error);
    process.exit(1);
  }
}

// Run the test
testTuiListApplications();
