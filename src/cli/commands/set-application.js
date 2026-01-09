import chalk from 'chalk';
import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Update application details including custom fields
 * @param {string} applicationId - Application ID to update
 * @param {string|Object} updates - JSON string or object with field updates
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 * @param {string} [options.name] - Application name
 * @param {string} [options.description] - Application description
 * @param {string} [options.devopsproject] - DevOps project custom field
 * @param {string} [options.jiraproject] - Jira project custom field
 */
export async function setApplication(applicationId, updates, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    let updateData = {};

    if (updates && (updates.startsWith('{') || updates.startsWith('['))) {
      try {
        updateData = JSON.parse(updates);
      } catch (error) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
    } else {
      const standardFields = [
        'Name',
        'Description',
        'Type',
        'Url',
        'Technology',
        'DevelopmentContact',
        'BusinessOwner',
        'Tester',
        'RiskRating',
        'BusinessImpact',
        'TestingStatus',
        'ConfidentialityRequirement',
        'IntegrityRequirement',
        'AvailabilityRequirement',
      ];

      const customFields = [
        'DevOpsProject',
        'JiraProject',
        'DevOpsRepo',
        'ConfluenceSpace',
        'JiraParentEpic',
      ];

      standardFields.forEach((field) => {
        if (options[field.toLowerCase()] !== undefined) {
          updateData[field] = options[field.toLowerCase()];
        }
      });

      const customFieldUpdates = {};
      customFields.forEach((field) => {
        const flagName = field.toLowerCase();
        if (options[flagName] !== undefined) {
          customFieldUpdates[field] = options[flagName];
        }
      });

      if (Object.keys(customFieldUpdates).length > 0) {
        updateData._customFields = customFieldUpdates;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No updates provided. Specify fields to update.');
    }

    cliOutput.status(`Fetching current application details...`);
    const currentApp = await service.getApplicationDetails(applicationId);

    if (!currentApp) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const payload = {};

    Object.keys(updateData).forEach((key) => {
      if (key !== '_customFields') {
        payload[key] = updateData[key];
      }
    });

    if (updateData._customFields || updateData.customFields) {
      const customFieldUpdates =
        updateData._customFields || updateData.customFields;

      if (
        !currentApp._customFieldsRaw ||
        currentApp._customFieldsRaw.length === 0
      ) {
        throw new Error('Application has no custom fields defined');
      }

      payload.AppCustomFields = [];

      Object.entries(customFieldUpdates).forEach(([fieldName, value]) => {
        const fieldDef = currentApp._customFieldsRaw.find(
          (f) => f.Name === fieldName
        );

        if (!fieldDef) {
          throw new Error(
            `Custom field "${fieldName}" not found in application`
          );
        }

        payload.AppCustomFields.push({
          Id: fieldDef.Id,
          Value: value || '',
        });
      });
    }

    cliOutput.status('Updating application...');
    await service.api.v4.Apps_Update(applicationId, payload);
    cliOutput.success('✓ Application updated successfully');

    const updatedApp = await service.getApplicationDetails(applicationId);

    if (options.json) {
      cliOutput.json({
        success: true,
        applicationId,
        updates: payload,
        application: updatedApp,
      });
    } else {
      cliOutput.result('');
      cliOutput.result(chalk.bold.green('Changes Applied:'));
      cliOutput.result('');

      Object.keys(updateData).forEach((key) => {
        if (key !== '_customFields' && key !== 'customFields') {
          const oldValue = currentApp[key] || chalk.gray('(not set)');
          const newValue = updatedApp[key] || chalk.gray('(not set)');

          if (oldValue !== newValue) {
            cliOutput.result(
              `  ${chalk.bold(key + ':')} ${chalk.dim(oldValue)} ${chalk.cyan('→')} ${chalk.green(newValue)}`
            );
          }
        }
      });

      if (updateData._customFields || updateData.customFields) {
        const customFieldUpdates =
          updateData._customFields || updateData.customFields;

        Object.keys(customFieldUpdates).forEach((fieldName) => {
          const oldValue =
            currentApp.customFields?.[fieldName] || chalk.gray('(not set)');
          const newValue =
            updatedApp.customFields?.[fieldName] || chalk.gray('(not set)');

          if (oldValue !== newValue) {
            cliOutput.result(
              `  ${chalk.bold(fieldName + ':')} ${chalk.dim(oldValue)} ${chalk.cyan('→')} ${chalk.green(newValue)}`
            );
          }
        });
      }

      cliOutput.result('');
      cliOutput.result(
        chalk.dim(`Application: ${updatedApp.Name} (${applicationId})`)
      );
    }
  } catch (error) {
    handleCommandError(error, `Failed to update application ${applicationId}`);
  }
}

export default setApplication;
