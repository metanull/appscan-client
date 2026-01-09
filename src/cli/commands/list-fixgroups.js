import chalk from 'chalk';
import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * List FixGroups for a specific application
 * @param {string} appId - Application ID
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 * @param {string} [options.status] - Filter by status (Open, InProgress, Fixed, Passed, Noise, etc.)
 * @param {string} [options.severity] - Filter by severity (Critical, High, Medium, Low, Informational)
 * @param {string} [options.filter] - Custom OData filter expression
 */
export async function listFixGroups(appId, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    cliOutput.status(`Fetching FixGroups for application ${appId}...`);

    const queryParams = {};

    if (options.filter) {
      queryParams['$filter'] = options.filter;
    } else {
      const filters = [];
      if (options.status) {
        filters.push(`Status eq '${options.status}'`);
      }
      if (options.severity) {
        filters.push(`Severity eq '${options.severity}'`);
      }
      if (filters.length > 0) {
        queryParams['$filter'] = filters.join(' and ');
      }
    }

    const response = await service.api.v4.FixGroups_Get(
      'Application',
      appId,
      queryParams
    );
    const fixGroups = response.Items || [];

    if (options.json) {
      cliOutput.json(fixGroups);
    } else {
      const filterInfo = queryParams['$filter'] ? ` (filtered)` : '';
      console.error(
        chalk.green(`\nFound ${fixGroups.length} FixGroup(s)${filterInfo}:\n`)
      );

      if (fixGroups.length === 0) {
        console.log(chalk.dim('No FixGroups found'));
        return;
      }

      fixGroups.forEach((fixGroup, index) => {
        const severityColor =
          fixGroup.Severity === 'Critical' || fixGroup.Severity === 'High'
            ? 'red'
            : fixGroup.Severity === 'Medium'
              ? 'yellow'
              : 'dim';

        const statusColor =
          fixGroup.Status === 'Open' || fixGroup.Status === 'InProgress'
            ? 'yellow'
            : fixGroup.Status === 'Fixed' || fixGroup.Status === 'Passed'
              ? 'green'
              : 'dim';

        console.log(`${index + 1}. ${chalk.bold(fixGroup.Subject || 'N/A')}`);
        console.log(`   ${chalk.dim('ID:')} ${chalk.gray(fixGroup.Id)}`);
        console.log(
          `   ${chalk.dim('Severity:')} ${chalk[severityColor](fixGroup.Severity || 'N/A')}`
        );
        console.log(
          `   ${chalk.dim('Status:')} ${chalk[statusColor](fixGroup.Status || 'N/A')}`
        );
        console.log(
          `   ${chalk.dim('Issues:')} ${fixGroup.NIssues || 0} total, ${fixGroup.NOpenIssues || 0} open`
        );
        console.log(`   ${chalk.dim('Type:')} ${fixGroup.IssueType || 'N/A'}`);
        if (fixGroup.File) {
          const displayFile =
            fixGroup.File.length > 60
              ? '...' + fixGroup.File.slice(-57)
              : fixGroup.File;
          console.log(
            `   ${chalk.dim('Location:')} ${displayFile}${fixGroup.Line ? `:${fixGroup.Line}` : ''}`
          );
        }
        console.log('');
      });

      const summary = {
        totalIssues: fixGroups.reduce((sum, fg) => sum + (fg.NIssues || 0), 0),
        openIssues: fixGroups.reduce(
          (sum, fg) => sum + (fg.NOpenIssues || 0),
          0
        ),
      };

      console.log(chalk.dim('─'.repeat(60)));
      console.log(
        chalk.bold(
          `Total: ${fixGroups.length} FixGroups, ${summary.totalIssues} issues (${summary.openIssues} open)`
        )
      );
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list FixGroups');
  }
}

export default listFixGroups;
