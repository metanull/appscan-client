import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';

export async function listIssues(scanId, options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    console.log('Authenticating...');
    await service.authenticate();

    console.log(`Fetching issues for scan ${scanId}...`);
    const response = await service.listIssues(scanId);
    const issues = response.Items || [];

    if (options.json) {
      console.log(JSON.stringify(issues, null, 2));
    } else {
      console.log(`\nFound ${issues.length} issue(s):\n`);

      // Group by severity
      const grouped = groupBySeverity(issues);
      const severities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

      severities.forEach((severity) => {
        const severityIssues = grouped[severity] || [];
        if (severityIssues.length > 0) {
          console.log(`${severity} (${severityIssues.length}):`);
          severityIssues.forEach((issue) => {
            console.log(`  - ${issue.IssueType || 'N/A'} at ${issue.Location || 'N/A'}`);
          });
          console.log('');
        }
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function groupBySeverity(issues) {
  return issues.reduce((acc, issue) => {
    const severity = issue.Severity || 'Unknown';
    if (!acc[severity]) {
      acc[severity] = [];
    }
    acc[severity].push(issue);
    return acc;
  }, {});
}

export default listIssues;
