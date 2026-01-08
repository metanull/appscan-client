/**
 * Test set-application CLI command with JSON mode
 */

import { execSync } from 'child_process';

console.log('🔍 Testing set-application CLI Command - JSON Mode\n');

const testAppId = '71d969b5-8d40-4921-a3ce-8de07c04da7c';

try {
  // Test 1: JSON with standard field
  console.log('📝 Test 1: Update using JSON (standard field)');
  const json1 = JSON.stringify({ Description: "JSON Test Description" });
  const result1 = execSync(
    `node dist/index.js set-application ${testAppId} '${json1}'`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], shell: 'pwsh.exe' }
  );
  
  console.log('   ✅ JSON mode executed successfully');
  console.log('');

  // Test 2: JSON with custom field
  console.log('📝 Test 2: Update using JSON (custom field)');
  const json2 = JSON.stringify({ _customFields: { JiraProject: "TEST-JSON" } });
  const result2 = execSync(
    `node dist/index.js set-application ${testAppId} '${json2}'`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], shell: 'pwsh.exe' }
  );
  
  console.log('   ✅ JSON mode with custom field executed');
  console.log('');

  // Test 3: JSON with both
  console.log('📝 Test 3: Update using JSON (standard + custom)');
  const json3 = JSON.stringify({
    Type: "JSON-Test-Type",
    _customFields: { DevOpsProject: "JSON-DevOps" }
  });
  const result3 = execSync(
    `node dist/index.js set-application ${testAppId} '${json3}'`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], shell: 'pwsh.exe' }
  );
  
  console.log('   ✅ JSON mode with multiple fields executed');
  console.log('');

  // Restore
  console.log('🔄 Restoring original values...');
  const restoreJson = JSON.stringify({
    Description: "Management of Members data, referrals, meetings and budget forecasting.",
    Type: "intranet",
    _customFields: { JiraProject: "AGR", DevOpsProject: "Agora" }
  });
  execSync(
    `node dist/index.js set-application ${testAppId} '${restoreJson}'`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], shell: 'pwsh.exe' }
  );
  console.log('   ✅ Restored\n');

  console.log('🎉 All JSON mode tests passed!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout.toString());
  if (error.stderr) console.log('stderr:', error.stderr.toString());
  process.exit(1);
}
