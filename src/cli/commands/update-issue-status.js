import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Update the status of a specific issue
 * @param {string} issueId - Issue ID to update
 * @param {string} status - New status: Open, InProgress, Reopened, Noise, Passed, Fixed, New
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 * @param {string} [options.comment] - Comment to add with status update
 * @param {string} [options.externalId] - External tracking ID (e.g., Jira issue key)
 */
export async function updateIssueStatus(issueId, status, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

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

    const updateData = {
      Status: status,
    };

    if (options.comment) {
      updateData.Comment = options.comment;
    }

    if (options.externalId) {
      updateData.ExternalId = options.externalId;
    }

    const odataFilter = `Id eq ${issueId}`;

    const issue = await service.api.v4.Issues_GetIssue(issueId, {});

    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }

    if (!issue.ApplicationId) {
      throw new Error(`Issue does not have an ApplicationId: ${issueId}`);
    }

    const applicationId = issue.ApplicationId;

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
