/**
 * Test script to verify Jira API works through proxy using JiraService
 * Usage: node lab/test-jira-proxy.js
 */

import 'dotenv/config';
await import('../src/utils/bootstrap-proxy.js');

import { JiraService } from '../src/services/jira-service.js';

const { JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;

if (!JIRA_HOST || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error(
    'Missing JIRA_HOST, JIRA_EMAIL, or JIRA_API_TOKEN in environment'
  );
  process.exit(1);
}

const config = {
  jiraHost: JIRA_HOST,
  jiraEmail: JIRA_EMAIL,
  jiraApiToken: JIRA_API_TOKEN,
};

const jiraService = new JiraService(config);

try {
  console.log('Initializing JiraService...');
  jiraService.initialize();

  console.log('Fetching SEC-509...');
  const issue = await jiraService.client.issues.getIssue({
    issueIdOrKey: 'SEC-509',
  });

  console.log('Success!');
  console.log(
    JSON.stringify(
      {
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name,
        assignee: issue.fields.assignee?.displayName,
      },
      null,
      2
    )
  );
} catch (error) {
  console.error('Failed:', error.message);
  if (error.stack) console.error(error.stack);
  process.exit(1);
}
