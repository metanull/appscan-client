/**
 * JiraPanel Component  
 * Modal for creating and previewing Jira issues
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import useStore from '../state/AppContext.js';

export const JiraPanel = ({ jiraService: _jiraService, onClose: _onClose, onCreate: _onCreate }) => {
  const selectedIssueIds = useStore((state) => state.selectedIssueIds);
  const issues = useStore((state) => state.issues);
  const [step, _setStep] = useState('input'); // 'input' | 'confirm' | 'creating' | 'success'
  const [projectKey, _setProjectKey] = useState('');
  const [groupBy, _setGroupBy] = useState('type'); // 'type' | 'severity' | 'none'

  const selectedIssues = issues.filter(i => selectedIssueIds.includes(i.Id));

  const getGroupCount = () => {
    if (groupBy === 'none') return selectedIssues.length;
    if (groupBy === 'severity') {
      const severities = new Set(selectedIssues.map(i => i.Severity));
      return severities.size;
    }
    // Default: group by type
    const types = new Set(selectedIssues.map(i => i.IssueType));
    return types.size;
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="green"
      paddingX={2}
      paddingY={1}
      width="70%"
      marginX="auto"
    >
      <Text bold color="green">🎫 Create Jira Issue(s)</Text>

      <Box flexDirection="column" marginTop={1}>
        <Text>Selected Issues: {selectedIssues.length}</Text>
        <Text>Jira Tickets to Create: {getGroupCount()}</Text>
      </Box>

      {step === 'input' && (
        <Box flexDirection="column" marginTop={1}>
          <Text>Configuration:</Text>
          <Text>  Project Key: <Text color="cyan">{projectKey || '(not set)'}</Text></Text>
          <Text>  Group By: <Text color="cyan">{groupBy}</Text></Text>
          <Box marginTop={1}>
            <Text dimColor>Use interactive mode in terminal to configure</Text>
          </Box>
        </Box>
      )}

      {step === 'creating' && (
        <Box marginTop={1}>
          <Text color="yellow">Creating Jira issues...</Text>
        </Box>
      )}

      {step === 'success' && (
        <Box marginTop={1}>
          <Text color="green">✅ Successfully created Jira issues!</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press ESC to cancel, Enter to create</Text>
      </Box>
    </Box>
  );
};

export default JiraPanel;
