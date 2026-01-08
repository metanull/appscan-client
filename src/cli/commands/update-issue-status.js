import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

export async function updateIssueStatus(issueId, status, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    // Validate status
    const validStatuses = [
      'Open',
      'InProgress',
      'Reopened',
      'Noise',
      'Passed',
      'Fixed',
      'New',
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`
      );
    }

    cliOutput.status(`Updating issue ${issueId} to status ${status}...`);

    // Build the update payload
    const updateData = {
      Status: status,
    };

    // Add comment if provided
    if (options.comment) {
      updateData.Comment = options.comment;
    }

    // Add external ID if provided
    if (options.externalId) {
      updateData.ExternalId = options.externalId;
    }

    // Use OData filter to target specific issue
    // GUID values in OData filters need to be without quotes (the API handles GUID comparison)
    const odataFilter = `Id eq ${issueId}`;

    // Update the issue by using the Issues_UpdateFilteredIssues endpoint
    // We need to get the application ID for this issue first
    const issue = await service.api.v4.Issues_GetIssue(issueId, {});

    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }

    if (!issue.ApplicationId) {
      throw new Error(`Issue does not have an ApplicationId: ${issueId}`);
    }

    const applicationId = issue.ApplicationId;

    // Note: PUT endpoint uses 'odataFilter' parameter (not '$filter' like GET)
    const result = await service.api.v4.Issues_UpdateFilteredIssues(
      'Application',
      applicationId,
      updateData,
      {
        odataFilter: odataFilter,
      }
    );

    if (options.json) {
      cliOutput.json(result);
    } else {
      cliOutput.success(
        `\nSuccessfully updated issue ${issueId} to status ${status}`
      );
      if (result) {
        cliOutput.success(`Total issues updated: ${result.TotalIssues || 1}`);
        if (result.UpdatedIssues) {
          cliOutput.success(`Issues updated: ${result.UpdatedIssues}`);
        }
      }
      if (options.comment) {
        cliOutput.success(`Comment added: "${options.comment}"`);
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to update issue status');
  }
}

export default updateIssueStatus;
