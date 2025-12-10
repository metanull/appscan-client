/**
 * CreateJiraModal Component
 * Modal for creating Jira issues from selected vulnerabilities
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';

const GROUP_OPTIONS = [
  { label: 'Type (recommended)', value: 'type' },
  { label: 'Severity', value: 'severity' },
  { label: 'None (one issue per vulnerability)', value: 'none' },
];

export const CreateJiraModal = ({ issues, defaultProjectKey, onCreate, onClose }) => {
  const [step, setStep] = useState('project'); // 'project' | 'groupBy' | 'creating' | 'success'
  const [projectKey, setProjectKey] = useState(defaultProjectKey || '');
  const [groupBy, setGroupBy] = useState('type');
  const [error, setError] = useState(null);

  useInput((input, key) => {
    if (key.escape && step !== 'creating') {
      onClose();
    }
  });

  const handleProjectSubmit = () => {
    if (!projectKey || projectKey.trim() === '') {
      setError('Project key is required');
      return;
    }
    setError(null);
    setStep('groupBy');
  };

  const handleGroupBySelect = async (item) => {
    setGroupBy(item.value);
    setStep('creating');
    
    try {
      await onCreate(projectKey, item.value, issues);
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
      setStep('groupBy');
    }
  };

  const getGroupCount = () => {
    if (groupBy === 'none') return issues.length;
    if (groupBy === 'severity') {
      return new Set(issues.map(i => i.Severity)).size;
    }
    return new Set(issues.map(i => i.IssueType)).size;
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
        <Text>Selected Issues: {issues.length}</Text>
      </Box>

      {error && (
        <Box marginTop={1}>
          <Text color="red">Error: {error}</Text>
        </Box>
      )}

      {step === 'project' && (
        <Box flexDirection="column" marginTop={1}>
          <Text>Enter Jira project key:</Text>
          <Box marginTop={1}>
            <Text color="cyan">&gt; </Text>
            <TextInput
              value={projectKey}
              onChange={setProjectKey}
              onSubmit={handleProjectSubmit}
              placeholder="e.g., SEC, PROJ..."
            />
          </Box>
        </Box>
      )}

      {step === 'groupBy' && (
        <Box flexDirection="column" marginTop={1}>
          <Text>Group issues by:</Text>
          <Text dimColor>Will create {getGroupCount()} Jira issue(s)</Text>
          <SelectInput items={GROUP_OPTIONS} onSelect={handleGroupBySelect} />
        </Box>
      )}

      {step === 'creating' && (
        <Box marginTop={1}>
          <Text color="yellow">⏳ Creating Jira issues...</Text>
        </Box>
      )}

      {step === 'success' && (
        <Box marginTop={1}>
          <Text color="green">✅ Successfully created Jira issues!</Text>
        </Box>
      )}

      {step !== 'creating' && step !== 'success' && (
        <Box marginTop={1}>
          <Text dimColor>Press ESC to cancel</Text>
        </Box>
      )}
    </Box>
  );
};

export default CreateJiraModal;
