import chalk from 'chalk';
import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';

export async function listIssues(scanId, options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    console.error(chalk.blue('Authenticating...'));
    await service.authenticate();

    console.error(chalk.blue(`Fetching issues for scan ${scanId}...`));
    const response = await service.listIssues(scanId);
    const issues = response.Items || [];

    if (options.json) {
      console.log(JSON.stringify(issues, null, 2));
    } else {
      console.error(chalk.green(`\nFound ${issues.length} issue(s):\n`));

      // Group by severity
      const grouped = groupBySeverity(issues);
      const severities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
      const severityColors = {
        'Critical': 'redBright',
        'High': 'red',
        'Medium': 'yellow',
        'Low': 'blue',
        'Informational': 'gray'
      };

      severities.forEach((severity) => {
        const severityIssues = grouped[severity] || [];
        if (severityIssues.length > 0) {
          const color = severityColors[severity] || 'white';
          console.log(chalk[color].bold(`${severity} (${severityIssues.length}):`));
          severityIssues.forEach((issue) => {
            console.log(`  ${chalk[color]('•')} ${issue.IssueType || 'N/A'} ${chalk.dim('at')} ${chalk.cyan(issue.Location || 'N/A')}`);
          });
          console.log('');
        }
      });
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
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
