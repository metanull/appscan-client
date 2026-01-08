import chalk from 'chalk';
import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get detailed information about a specific application
 * Displays all application details including custom fields (simplified structure)
 */
export async function getApplication(applicationId, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    cliOutput.status(`Fetching application details for ${applicationId}...`);
    const app = await service.getApplicationDetails(applicationId);

    if (options.json) {
      cliOutput.json(app);
    } else {
      cliOutput.result(
        `\n${chalk.bold.green('📱 Application:')} ${chalk.bold(app.Name)}\n`
      );

      // Basic Information
      cliOutput.result(chalk.bold.cyan('Basic Information:'));
      cliOutput.result(`  ${chalk.bold('ID:')} ${app.Id}`);
      cliOutput.result(`  ${chalk.bold('Name:')} ${app.Name}`);
      if (app.Description) {
        cliOutput.result(`  ${chalk.bold('Description:')} ${app.Description}`);
      }
      if (app.Url) {
        cliOutput.result(`  ${chalk.bold('URL:')} ${app.Url}`);
      }
      if (app.Technology) {
        cliOutput.result(`  ${chalk.bold('Technology:')} ${app.Technology}`);
      }
      if (app.Type) {
        cliOutput.result(`  ${chalk.bold('Type:')} ${app.Type}`);
      }
      cliOutput.result('');

      // Risk & Testing
      cliOutput.result(chalk.bold.cyan('Risk & Testing:'));
      cliOutput.result(
        `  ${chalk.bold('Risk Rating:')} ${app.RiskRating || 'Unknown'}`
      );
      cliOutput.result(
        `  ${chalk.bold('Business Impact:')} ${app.BusinessImpact || 'Unknown'}`
      );
      cliOutput.result(
        `  ${chalk.bold('Testing Status:')} ${app.TestingStatus || 'NotStarted'}`
      );
      cliOutput.result('');

      // Issues Summary
      cliOutput.result(chalk.bold.cyan('Issues Summary:'));
      cliOutput.result(
        `  ${chalk.bold('Total:')} ${app.TotalIssues || 0} | ${chalk.bold('Open:')} ${app.OpenIssues || 0} | ${chalk.bold('New:')} ${app.NewIssues || 0}`
      );

      const hasSeverityData =
        (app.CriticalIssues || 0) +
          (app.HighIssues || 0) +
          (app.MediumIssues || 0) +
          (app.LowIssues || 0) +
          (app.InformationalIssues || 0) >
        0;
      if (hasSeverityData) {
        cliOutput.result(
          `  ${chalk.bold('By Severity:')} ${chalk.red(`Critical: ${app.CriticalIssues || 0}`)} | ${chalk.red(`High: ${app.HighIssues || 0}`)} | ${chalk.yellow(`Medium: ${app.MediumIssues || 0}`)} | ${chalk.blue(`Low: ${app.LowIssues || 0}`)} | ${chalk.gray(`Info: ${app.InformationalIssues || 0}`)}`
        );
      }
      cliOutput.result('');

      // Scans
      cliOutput.result(chalk.bold.cyan('Scans:'));
      cliOutput.result(`  ${chalk.bold('Total:')} ${app.TotalScans || 0}`);
      if (app.NScanExecutions) {
        cliOutput.result(
          `  ${chalk.bold('Executions:')} ${app.NScanExecutions}`
        );
      }
      if (app.ScanTechnologies && app.ScanTechnologies !== 'NONE') {
        cliOutput.result(
          `  ${chalk.bold('Technologies:')} ${app.ScanTechnologies}`
        );
      }
      cliOutput.result('');

      // Custom Fields
      if (app.customFields && Object.keys(app.customFields).length > 0) {
        cliOutput.result(chalk.bold.cyan('Custom Fields:'));

        const fieldOrder = [
          'DevOpsProject',
          'JiraProject',
          'DevOpsRepo',
          'ConfluenceSpace',
          'JiraParentEpic',
        ];
        const allKeys = Object.keys(app.customFields);
        const orderedKeys = [
          ...fieldOrder.filter((k) => allKeys.includes(k)),
          ...allKeys.filter((k) => !fieldOrder.includes(k)).sort(),
        ];

        orderedKeys.forEach((key) => {
          const value = app.customFields[key];
          const displayValue = value === null ? chalk.gray('(not set)') : value;
          cliOutput.result(`  ${chalk.bold(key + ':')} ${displayValue}`);
        });
        cliOutput.result('');
      }

      // Contacts
      const hasContacts =
        app.DevelopmentContact || app.BusinessOwner || app.Tester;
      if (hasContacts) {
        cliOutput.result(chalk.bold.cyan('Contacts:'));
        if (app.DevelopmentContact) {
          cliOutput.result(
            `  ${chalk.bold('Development:')} ${app.DevelopmentContact}`
          );
        }
        if (app.BusinessOwner) {
          cliOutput.result(
            `  ${chalk.bold('Business Owner:')} ${app.BusinessOwner}`
          );
        }
        if (app.Tester) {
          cliOutput.result(`  ${chalk.bold('Tester:')} ${app.Tester}`);
        }
        cliOutput.result('');
      }

      // Timestamps
      cliOutput.result(chalk.bold.cyan('Timestamps:'));
      if (app.DateCreated) {
        cliOutput.result(`  ${chalk.bold('Created:')} ${app.DateCreated}`);
      }
      if (app.LastUpdated) {
        cliOutput.result(`  ${chalk.bold('Updated:')} ${app.LastUpdated}`);
      }
      cliOutput.result('');

      // Security Requirements
      cliOutput.result(chalk.bold.cyan('Security Requirements:'));
      cliOutput.result(
        `  ${chalk.bold('Confidentiality:')} ${app.ConfidentialityRequirement || 'NotDefined'}`
      );
      cliOutput.result(
        `  ${chalk.bold('Integrity:')} ${app.IntegrityRequirement || 'NotDefined'}`
      );
      cliOutput.result(
        `  ${chalk.bold('Availability:')} ${app.AvailabilityRequirement || 'NotDefined'}`
      );
      cliOutput.result('');

      // Asset Group
      if (app.AssetGroupName || app.AssetGroupId) {
        cliOutput.result(chalk.bold.cyan('Asset Group:'));
        if (app.AssetGroupName)
          cliOutput.result(`  ${chalk.bold('Name:')} ${app.AssetGroupName}`);
        if (app.AssetGroupId)
          cliOutput.result(`  ${chalk.bold('ID:')} ${app.AssetGroupId}`);
        cliOutput.result('');
      }
    }
  } catch (error) {
    handleCommandError(
      error,
      `Failed to get application details for ${applicationId}`
    );
  }
}

export default getApplication;
