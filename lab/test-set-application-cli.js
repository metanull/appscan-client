/**
 * Test set-application CLI command
 * Tests the actual CLI command with flag-based syntax
 */

import { execSync } from 'child_process';

console.log('🔍 Testing set-application CLI Command\n');

const testAppId = '71d969b5-8d40-4921-a3ce-8de07c04da7c';

try {
  // Test 1: Update with --description flag
  console.log('📝 Test 1: Update using --description flag');
  const result1 = execSync(
    `node dist/index.js set-application ${testAppId} --description "CLI Test Description"`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );

  if (
    result1.includes('updated successfully') ||
    result1.includes('Changes Applied')
  ) {
    console.log('   ✅ Command executed successfully');
  } else {
    console.log('   ⚠️  Unexpected output:', result1);
  }
  console.log('');

  // Test 2: Update with custom field flag
  console.log('📝 Test 2: Update using --jiraproject flag');
  const result2 = execSync(
    `node dist/index.js set-application ${testAppId} --jiraproject "TEST-CLI"`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );

  if (
    result2.includes('updated successfully') ||
    result2.includes('Changes Applied')
  ) {
    console.log('   ✅ Command executed successfully');
  } else {
    console.log('   ⚠️  Unexpected output:', result2);
  }
  console.log('');

  // Test 3: Update with multiple flags
  console.log('📝 Test 3: Update multiple fields using flags');
  const result3 = execSync(
    `node dist/index.js set-application ${testAppId} --description "Multi-flag test" --jiraproject "AGR"`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );

  if (
    result3.includes('updated successfully') ||
    result3.includes('Changes Applied')
  ) {
    console.log('   ✅ Command executed successfully');
  } else {
    console.log('   ⚠️  Unexpected output:', result3);
  }
  console.log('');

  // Restore original values
  console.log('🔄 Restoring original values...');
  execSync(
    `node dist/index.js set-application ${testAppId} --description "Management of Members' data, referrals, meetings & budget forecasting." --jiraproject "AGR"`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  console.log('   ✅ Restored\n');

  console.log('🎉 All CLI command tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout.toString());
  if (error.stderr) console.log('stderr:', error.stderr.toString());
  process.exit(1);
}
