#!/usr/bin/env node
// Discover and check all available API methods in azure-devops-node-api
import { getAzdoClient } from './azdo-auth.js';

/**
 * Known API factory methods from azure-devops-node-api WebApi class
 * Based on the package's TypeScript definitions
 */
const KNOWN_API_METHODS = [
  'getAlertApi',
  'getBuildApi',
  'getCixApi',
  'getCoreApi',
  'getDashboardApi',
  'getExtensionManagementApi',
  'getFeatureManagementApi',
  'getFileContainerApi',
  'getGalleryApi',
  'getGitApi',
  'getLocationsApi',
  'getManagementApi',
  'getNotificationApi',
  'getPipelinesApi',
  'getPolicyApi',
  'getProfileApi',
  'getProjectAnalysisApi',
  'getReleaseApi',
  'getSecurityRolesApi',
  'getTaskApi',
  'getTaskAgentApi',
  'getTestApi',
  'getTestPlanApi',
  'getTestResultsApi',
  'getTfvcApi',
  'getWikiApi',
  'getWorkApi',
  'getWorkItemTrackingApi',
  'getWorkItemTrackingProcessApi',
  'getWorkItemTrackingProcessDefinitionApi',
];

(async function main() {
  try {
    const conn = await getAzdoClient();
    
    console.log('=== Azure DevOps API Methods Discovery ===\n');
    
    // Discover all methods on the connection object
    const allMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(conn))
      .filter(name => name.startsWith('get') && name.endsWith('Api'))
      .sort();
    
    console.log(`Found ${allMethods.length} API factory methods on WebApi instance:\n`);
    
    const available = [];
    const unavailable = [];
    const unknown = [];
    
    // Check each known API method
    for (const methodName of KNOWN_API_METHODS) {
      const exists = typeof conn[methodName] === 'function';
      if (exists) {
        available.push(methodName);
      } else {
        unavailable.push(methodName);
      }
    }
    
    // Find methods on instance that aren't in our known list
    for (const methodName of allMethods) {
      if (!KNOWN_API_METHODS.includes(methodName)) {
        unknown.push(methodName);
      }
    }
    
    // Display results
    console.log('✅ Available API Methods:');
    for (const method of available) {
      console.log(`   ${method}`);
    }
    
    if (unavailable.length > 0) {
      console.log('\n❌ Known but Not Available:');
      for (const method of unavailable) {
        console.log(`   ${method}`);
      }
    }
    
    if (unknown.length > 0) {
      console.log('\n🆕 Unknown/New API Methods:');
      for (const method of unknown) {
        console.log(`   ${method}`);
      }
    }
    
    // Test creating a few key API instances
    console.log('\n=== Testing API Instance Creation ===\n');
    
    const testApis = [
      'getAlertApi',
      'getCoreApi',
      'getGitApi',
    ];
    
    for (const methodName of testApis) {
      if (typeof conn[methodName] === 'function') {
        try {
          const api = await conn[methodName]();
          const apiName = methodName.replace('get', '').replace('Api', '');
          console.log(`✅ ${methodName}(): ${apiName}Api instance created successfully`);
        } catch (err) {
          console.log(`❌ ${methodName}(): Failed - ${err.message}`);
        }
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total known APIs: ${KNOWN_API_METHODS.length}`);
    console.log(`Available: ${available.length}`);
    console.log(`Unavailable: ${unavailable.length}`);
    console.log(`Unknown/New: ${unknown.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();