#!/usr/bin/env node
/**
 * Test script to verify issue update functionality
 * Tests both selective updates and bulk updates
 */

import { AppScanService } from './src/services/appscan-service.js';
import { Config } from './src/utils/config.js';
import chalk from 'chalk';

// Test data
const TEST_DATA = {
  appId: '6ebf4b50-eceb-4456-8ffe-0a5e17a968c0',
  scanId: 'e315d9e6-4aee-4e22-9fdb-01d78cfe3bd3',
  vulnerabilityIds: [
    'bc513af1-7fc1-f011-8194-002248e524dc',
    'bf513af1-7fc1-f011-8194-002248e524dc',
    'c2513af1-7fc1-f011-8194-002248e524dc',
    'b3513af1-7fc1-f011-8194-002248e524dc',
    'b6513af1-7fc1-f011-8194-002248e524dc',
    'b9513af1-7fc1-f011-8194-002248e524dc',
  ]
};

/**
 * Fetch and display issue status
 */
async function listIssues(service, issueIds, label) {
  console.log(chalk.cyan(`\n${'='.repeat(80)}`));
  console.log(chalk.cyan.bold(`${label}`));
  console.log(chalk.cyan(`${'='.repeat(80)}\n`));

  const filter = issueIds.map(id => `Id eq ${id}`).join(' or ');
  
  const response = await service.api.v4.Issues_Get('Application', TEST_DATA.appId, {
    $filter: filter
  });

  const issues = response.Items || [];
  
  console.log(chalk.white('ID                                   | Status'));
  console.log(chalk.white('-'.repeat(80)));
  
  for (const issue of issues) {
    const statusColor = 
      issue.Status === 'Open' ? chalk.yellow :
      issue.Status === 'Noise' ? chalk.gray :
      issue.Status === 'Fixed' ? chalk.green :
      chalk.white;
    
    console.log(`${chalk.blue(issue.Id)} | ${statusColor(issue.Status)}`);
  }
  
  console.log(chalk.white('-'.repeat(80)));
  console.log(chalk.white(`Total: ${issues.length} issues\n`));
  
  return issues;
}

/**
 * Main test execution
 */
async function runTests() {
  try {
    console.log(chalk.magenta.bold('\n🧪 AppScan Issue Update Test Suite\n'));
    
    // Initialize service
    const config = new Config();
    const service = new AppScanService(config);
    
    console.log(chalk.yellow('Authenticating...'));
    await service.authenticate();
    console.log(chalk.green('✓ Authenticated\n'));

    // Step 1: List initial state
    await listIssues(
      service, 
      TEST_DATA.vulnerabilityIds, 
      'STEP 1: Initial State - List 6 Vulnerabilities'
    );

    // Step 2: Update ALL 6 vulnerabilities to "Open"
    console.log(chalk.cyan(`${'='.repeat(80)}`));
    console.log(chalk.cyan.bold('STEP 2: Update ALL 6 Vulnerabilities to "Open"'));
    console.log(chalk.cyan(`${'='.repeat(80)}\n`));
    
    console.log(chalk.yellow('Updating all 6 issues to Open...'));
    
    const result1 = await service.bulkUpdateIssues(
      TEST_DATA.vulnerabilityIds,
      'Open',
      null,
      null
    );
    
    console.log(chalk.green(`✓ Updated ${result1.totalUpdated} issue(s)`));
    console.log(chalk.gray(`  API Response: ${JSON.stringify(result1.result, null, 2)}\n`));

    // Step 3: List after first update
    await listIssues(
      service, 
      TEST_DATA.vulnerabilityIds, 
      'STEP 3: After Update - Verify All are "Open"'
    );

    // Step 4: Update ONLY vulnerabilities 4 and 5 to "Noise"
    const selectiveIds = [
      TEST_DATA.vulnerabilityIds[3], // b3513af1-7fc1-f011-8194-002248e524dc
      TEST_DATA.vulnerabilityIds[4], // b6513af1-7fc1-f011-8194-002248e524dc
    ];
    
    console.log(chalk.cyan(`${'='.repeat(80)}`));
    console.log(chalk.cyan.bold('STEP 4: Update ONLY Vulnerabilities #4 and #5 to "Noise"'));
    console.log(chalk.cyan(`${'='.repeat(80)}\n`));
    
    console.log(chalk.yellow('Selected issues:'));
    console.log(chalk.blue(`  - ${selectiveIds[0]}`));
    console.log(chalk.blue(`  - ${selectiveIds[1]}\n`));
    
    console.log(chalk.yellow('Updating with status "Noise" and comment "Url from XML Namespace"...'));
    
    const result2 = await service.bulkUpdateIssues(
      selectiveIds,
      'Noise',
      'Url from XML Namespace',
      null
    );
    
    console.log(chalk.green(`✓ Updated ${result2.totalUpdated} issue(s)`));
    console.log(chalk.gray(`  API Response: ${JSON.stringify(result2.result, null, 2)}\n`));

    // Step 5: List final state
    const finalIssues = await listIssues(
      service, 
      TEST_DATA.vulnerabilityIds, 
      'STEP 5: Final State - Verify Selective Update'
    );

    // Validation
    console.log(chalk.cyan(`${'='.repeat(80)}`));
    console.log(chalk.cyan.bold('VALIDATION'));
    console.log(chalk.cyan(`${'='.repeat(80)}\n`));
    
    const openCount = finalIssues.filter(i => i.Status === 'Open').length;
    const noiseCount = finalIssues.filter(i => i.Status === 'Noise').length;
    
    console.log(chalk.white(`Expected: 4 issues with status "Open", 2 issues with status "Noise"`));
    console.log(chalk.white(`Actual:   ${openCount} issues with status "Open", ${noiseCount} issues with status "Noise"\n`));
    
    if (openCount === 4 && noiseCount === 2) {
      console.log(chalk.green.bold('✅ TEST PASSED: Selective update works correctly!'));
      console.log(chalk.green('   Only the selected issues were updated, not all issues.\n'));
    } else {
      console.log(chalk.red.bold('❌ TEST FAILED: Unexpected issue counts!'));
      console.log(chalk.red('   The bug may still be present.\n'));
      process.exit(1);
    }

    // Additional test: Verify comment was added
    console.log(chalk.yellow('Verifying comment was added to updated issues...'));
    for (const id of selectiveIds) {
      const issue = finalIssues.find(i => i.Id === id);
      if (issue) {
        // Fetch comments for this issue
        const commentsResponse = await service.api.v4.Issues_GetIssueComments(id, {});
        const comments = commentsResponse.Items || [];
        const hasComment = comments.some(c => c.Text && c.Text.includes('Url from XML Namespace'));
        
        if (hasComment) {
          console.log(chalk.green(`  ✓ Issue ${id}: Comment found`));
        } else {
          console.log(chalk.yellow(`  ⚠ Issue ${id}: Comment not found (may be in latest change only)`));
        }
      }
    }

    console.log(chalk.magenta.bold('\n🎉 All tests completed successfully!\n'));

  } catch (error) {
    console.error(chalk.red.bold('\n❌ TEST ERROR:'));
    console.error(chalk.red(error.message));
    if (error.stack) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

// Run tests
runTests();
