import chalk from 'chalk';
import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Update application details including custom fields
 * Supports both standard fields (Name, Description, Type, etc.) and custom fields
 */
export async function setApplication(applicationId, updates, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    // Parse updates - either from JSON string or from options flags
    let updateData = {};

    // Check if updates argument is provided and looks like JSON
    if (updates && (updates.startsWith('{') || updates.startsWith('['))) {
      // Parse JSON string
      try {
        updateData = JSON.parse(updates);
      } catch (error) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
    } else {
      // Collect from options flags
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

      // Extract standard field updates
      standardFields.forEach((field) => {
        if (options[field.toLowerCase()] !== undefined) {
          updateData[field] = options[field.toLowerCase()];
        }
      });

      // Extract custom field updates (will process separately)
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

    // Prepare update payload
    const payload = {};

    // Handle standard field updates
    Object.keys(updateData).forEach((key) => {
      if (key !== '_customFields') {
        payload[key] = updateData[key];
      }
    });

    // Handle custom field updates
    if (updateData._customFields || updateData.customFields) {
      const customFieldUpdates =
        updateData._customFields || updateData.customFields;

      if (
        !currentApp._customFieldsRaw ||
        currentApp._customFieldsRaw.length === 0
      ) {
        throw new Error('Application has no custom fields defined');
      }

      // Map custom field names to IDs
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

    // Fetch updated data to show changes
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

      // Show standard field changes
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

      // Show custom field changes
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
