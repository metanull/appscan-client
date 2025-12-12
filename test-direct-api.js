#!/usr/bin/env node
/**
 * Direct API test - bypassing service layer
 * Tests the raw API calls to understand the issue
 */

import { AppScanService } from './src/services/appscan-service.js';
import { Config } from './src/utils/config.js';
import chalk from 'chalk';

const TEST_DATA = {
  appId: '6ebf4b50-eceb-4456-8ffe-0a5e17a968c0',
  vulnerabilityIds: [
    'b3513af1-7fc1-f011-8194-002248e524dc',
    'b6513af1-7fc1-f011-8194-002248e524dc',
  ]
};

async function runDirectTest() {
  try {
    console.log(chalk.magenta.bold('\n🔬 Direct API Test\n'));
    
    const config = new Config();
    const service = new AppScanService(config);
    
    console.log(chalk.yellow('Authenticating...'));
    await service.authenticate();
    console.log(chalk.green('✓ Authenticated\n'));

    // Add axios interceptor to see exact requests
    service.api.http.instance.interceptors.request.use(
      (config) => {
        console.log(chalk.cyan('\n📤 HTTP REQUEST:'));
        console.log(chalk.white(`  Method: ${config.method.toUpperCase()}`));
        console.log(chalk.white(`  URL: ${config.baseURL}${config.url}`));
        console.log(chalk.white(`  Params: ${JSON.stringify(config.params, null, 2)}`));
        console.log(chalk.white(`  Data: ${JSON.stringify(config.data, null, 2)}\n`));
        return config;
      },
      (error) => Promise.reject(error)
    );

    service.api.http.instance.interceptors.response.use(
      (response) => {
        console.log(chalk.green('\n📥 HTTP RESPONSE:'));
        console.log(chalk.white(`  Status: ${response.status}`));
        console.log(chalk.white(`  Data: ${JSON.stringify(response.data, null, 2)}\n`));
        return response;
      },
      (error) => Promise.reject(error)
    );

    // Test 1: Direct API call with filter
    console.log(chalk.cyan('=' + chalk.white('='.repeat(79))));
    console.log(chalk.cyan.bold('TEST 1: Update 2 issues with $filter parameter'));
    console.log(chalk.cyan('=' + '='.repeat(79)));

    const updateData = { Status: 'InProgress', Comment: 'Testing filter' };
    const filter = TEST_DATA.vulnerabilityIds.map(id => `Id eq ${id}`).join(' or ');
    
    console.log(chalk.yellow(`\nFilter: ${filter}\n`));

    // Note: PUT endpoint uses 'odataFilter' parameter (not '$filter' like GET)
    const result = await service.api.v4.Issues_UpdateFilteredIssues(
      'Application',
      TEST_DATA.appId,
      updateData,
      { odataFilter: filter }
    );

    console.log(chalk.magenta('\n📊 Result Analysis:'));
    console.log(chalk.white(`  Expected to update: 2 issues`));
    console.log(chalk.white(`  API says NProvidedIssues: ${result.NProvidedIssues}`));
    console.log(chalk.white(`  API says NUpdatedIssues: ${result.NUpdatedIssues}`));
    
    if (result.NUpdatedIssues === 2) {
      console.log(chalk.green.bold('\n✅ SUCCESS: Only 2 issues were updated!'));
    } else {
      console.log(chalk.red.bold(`\n❌ FAILURE: ${result.NUpdatedIssues} issues were updated instead of 2!`));
    }

    // Verify
    console.log(chalk.yellow('\n\nVerifying actual statuses...\n'));
    const verifyResponse = await service.api.v4.Issues_Get('Application', TEST_DATA.appId, {
      $filter: filter
    });
    
    const issues = verifyResponse.Items || [];
    console.log(chalk.white('Filtered issues:'));
    for (const issue of issues) {
      const color = issue.Status === 'InProgress' ? chalk.green : chalk.red;
      console.log(`  ${issue.Id}: ${color(issue.Status)}`);
    }

  } catch (error) {
    console.error(chalk.red.bold('\n❌ ERROR:'));
    console.error(chalk.red(error.message));
    if (error.stack) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

runDirectTest();
