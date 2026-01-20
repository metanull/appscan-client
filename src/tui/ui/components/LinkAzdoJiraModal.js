import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';

/**
 * Modal for linking Jira issues to selected Azure DevOps alerts
 * Stores Jira ID in alert comment metadata as JSON
 * Note: Alert must be in Dismissed or Fixed state to have a comment
 * @param {Object} props - Component props
 * @param {number} props.alertCount - Number of selected alerts to link
 * @param {Function} props.onLink - Callback with Jira key to link alerts
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const LinkAzdoJiraModal = React.memo(
  ({ alertCount, onLink, onClose }) => {
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
      <Modal width={70} height={22}>
        <Panel title="🔗 Link Jira Issue" borderColor="green">
          <Box flexDirection="column" marginTop={1}>
            <Text>Selected Alerts: {alertCount}</Text>
            <Text dimColor>
              Store Jira ID in alert comment metadata
            </Text>
          </Box>

          <Box flexDirection="column" marginTop={1} paddingX={1}>
            <Text color="yellow">⚠️ Important:</Text>
            <Text dimColor>
              • Active alerts: Set to Dismissed (Unknown)
            </Text>
            <Text dimColor>
              • Non-Active alerts: Temporarily set to Active, then restored
            </Text>
            <Text dimColor>
              • Existing comments preserved when possible
            </Text>
            <Text dimColor>
              • Jira ID stored as metadata in comment field
            </Text>
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
  }
);

LinkAzdoJiraModal.displayName = 'LinkAzdoJiraModal';

export default LinkAzdoJiraModal;
