import chalk from 'chalk';
import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * List all applications from AppScan
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function listApplications(options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    cliOutput.status('Fetching applications...');
    const response = await service.listApplications();
    const applications = response.Items || [];

    if (options.json) {
      cliOutput.json(applications);
    } else {
      cliOutput.result(
        chalk.green(`\nFound ${applications.length} application(s):\n`)
      );

      applications.forEach((app, index) => {
        cliOutput.result(
          `${index + 1}. ${chalk.bold(app.Name || 'N/A')} ${chalk.gray(`(ID: ${app.Id || 'N/A'})`)}`
        );

        if (app.Description) {
          cliOutput.result(
            `   ${chalk.dim('Description:')} ${app.Description}`
          );
        }

        const metrics = [];
        if (app.TotalIssues !== undefined)
          metrics.push(`${app.OpenIssues || 0}/${app.TotalIssues || 0} issues`);
        if (app.TotalScans !== undefined)
          metrics.push(`${app.TotalScans || 0} scans`);
        if (app.RiskRating && app.RiskRating !== 'Unknown')
          metrics.push(`Risk: ${app.RiskRating}`);

        if (metrics.length > 0) {
          cliOutput.result(`   ${chalk.dim(metrics.join(' | '))}`);
        }

        if (app.customFields && Object.keys(app.customFields).length > 0) {
          const populatedFields = Object.entries(app.customFields)
            .filter(([_, value]) => value !== null)
            .slice(0, 3);

          if (populatedFields.length > 0) {
            const fieldDisplay = populatedFields
              .map(([key, value]) => `${key}: ${value}`)
              .join(' | ');
            cliOutput.result(`   ${chalk.dim.cyan(fieldDisplay)}`);
          }
        }

        cliOutput.result('');
      });
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list applications');
  }
}

export default listApplications;
