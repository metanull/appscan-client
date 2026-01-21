import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';

/**
 * Modal for linking Jira issues to selected vulnerabilities
 * Sets ExternalId field to provided Jira issue key
 * @param {Object} props - Component props
 * @param {number} props.issueCount - Number of selected vulnerabilities to link
 * @param {Function} props.onLink - Callback with Jira key to link issues
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const LinkJiraModal = React.memo(({ issueCount, onLink, onClose }) => {
  const [step, setStep] = useState('input'); // 'input' | 'linking' | 'success'
  const [jiraKey, setJiraKey] = useState('');
  const [error, setError] = useState(null);

  useInput((input, key) => {
    if (key.escape && step !== 'linking') {
      onClose();
    }
  });

  const handleSubmit = async () => {
    if (!jiraKey || jiraKey.trim() === '') {
      setError('Jira issue key is required (e.g., SEC-123)');
      return;
    }

    if (!/^[A-Z]+-\d+$/.test(jiraKey.trim())) {
      setError('Invalid Jira key format. Expected format: KEY-123');
      return;
    }

    setError(null);
    setStep('linking');

    try {
      await onLink(jiraKey.trim());
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
      setStep('input');
    }
  };

  return (
    <Modal width={70} height={20}>
      <Panel title="🔗 Link Jira Issue" borderColor="green">
        <Box flexDirection="column" marginTop={1}>
          <Text>Selected Vulnerabilities: {issueCount}</Text>
          <Text dimColor>Set their ExternalId (Jira key)</Text>
        </Box>

        {error && (
          <Box marginTop={1}>
            <Text color="red">Error: {error}</Text>
          </Box>
        )}

        {step === 'input' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Enter Jira issue key (e.g., SEC-123):</Text>
            <Box marginTop={1}>
              <Text color="cyan">&gt; </Text>
              <TextInput
                value={jiraKey}
                onChange={setJiraKey}
                onSubmit={handleSubmit}
                placeholder="SEC-123"
              />
            </Box>
          </Box>
        )}

        {step === 'linking' && (
          <Box marginTop={1}>
            <Text color="yellow">⏳ Linking Jira issues...</Text>
          </Box>
        )}

        {step === 'success' && (
          <Box marginTop={1}>
            <Text color="green">✅ Successfully linked to {jiraKey}!</Text>
          </Box>
        )}

        {step !== 'linking' && step !== 'success' && (
          <Box marginTop={1}>
            <Text dimColor>Press ESC to cancel</Text>
          </Box>
        )}
      </Panel>
    </Modal>
  );
});

LinkJiraModal.displayName = 'LinkJiraModal';

export default LinkJiraModal;
