/**
 * Test to check issue structure and Comments property
 */
import { Config } from '../src/utils/config.js';
import { AppScanService } from '../src/tui/services/appscan.js';

async function testIssueStructure() {
  try {
    console.log('🔍 Checking Issue Structure...\n');

    const config = new Config();
    const service = new AppScanService();

    // Get applications
    const apps = await service.listApplications();
    if (!apps || apps.length === 0) {
      console.log('❌ No applications found');
      return;
    }

    const firstApp = apps[0];
    console.log(`✅ Using app: ${firstApp.Name} (${firstApp.Id})\n`);

    // Get issues for this app
    const issues = await service.listIssues(firstApp.Id, null, 'Application');
    if (!issues || issues.length === 0) {
      console.log('❌ No issues found');
      return;
    }

    const firstIssue = issues[0];
    console.log(`✅ Found ${issues.length} issues\n`);
    console.log('📝 First Issue Structure:');
    console.log(`   ID: ${firstIssue.Id}`);
    console.log(`   IssueType: ${firstIssue.IssueType}`);
    console.log(`   Status: ${firstIssue.Status}`);
    console.log(`   Severity: ${firstIssue.Severity}`);
    console.log(`   Has Comments property: ${!!firstIssue.Comments}`);
    console.log(`   Comments type: ${typeof firstIssue.Comments}`);
    console.log(`   Comments length: ${firstIssue.Comments?.length || 'N/A'}`);
    console.log('');
    console.log('All properties:', Object.keys(firstIssue).sort().join(', '));
    console.log('');

    // Check if issue has any comment-related properties
    const commentProps = Object.keys(firstIssue).filter(k => 
      k.toLowerCase().includes('comment')
    );
    console.log('Comment-related properties:', commentProps);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testIssueStructure();
