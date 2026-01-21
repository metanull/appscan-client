import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';

const CONFIRM_OPTIONS = [
  { label: 'Yes, unlink Jira issues', value: 'confirm' },
  { label: 'No, cancel', value: 'cancel' },
];

/**
 * Modal for unlinking Jira issues from selected vulnerabilities
 * Sets ExternalId field to null after user confirmation
 * @param {Object} props - Component props
 * @param {number} props.issueCount - Number of selected vulnerabilities to unlink
 * @param {Array<string>} props.jiraKeys - Array of currently linked Jira keys
 * @param {Function} props.onUnlink - Callback to unlink issues
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const UnlinkJiraModal = React.memo(
  ({ issueCount, jiraKeys, onUnlink, onClose }) => {
    const [step, setStep] = useState('confirm'); // 'confirm' | 'unlinking' | 'success'
    const [error, setError] = useState(null);

    useInput((input, key) => {
      if (key.escape && step !== 'unlinking') {
        onClose();
      }
    });

    const handleConfirm = async (item) => {
      if (item.value === 'cancel') {
        onClose();
        return;
      }

      setError(null);
      setStep('unlinking');

      try {
        await onUnlink();
        setStep('success');
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (err) {
        setError(err.message);
        setStep('confirm');
      }
    };

    return (
      <Modal width={70} height={20}>
        <Panel title="🔓 Unlink Jira Issues" borderColor="yellow">
          <Box flexDirection="column" marginTop={1}>
            <Text>Selected Vulnerabilities: {issueCount}</Text>
            {jiraKeys && jiraKeys.length > 0 && (
              <Box flexDirection="column" marginTop={1}>
                <Text>Linked to:</Text>
                {jiraKeys.map((key) => (
                  <Text key={key} dimColor>
                    • {key}
                  </Text>
                ))}
              </Box>
            )}
            <Text dimColor marginTop={1}>
              This will set their ExternalId to null
            </Text>
          </Box>

          {error && (
            <Box marginTop={1}>
              <Text color="red">Error: {error}</Text>
            </Box>
          )}

          {step === 'confirm' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Are you sure?</Text>
              <SelectInput items={CONFIRM_OPTIONS} onSelect={handleConfirm} />
            </Box>
          )}

          {step === 'unlinking' && (
            <Box marginTop={1}>
              <Text color="yellow">⏳ Unlinking Jira issues...</Text>
            </Box>
          )}

          {step === 'success' && (
            <Box marginTop={1}>
              <Text color="green">✅ Successfully unlinked Jira issues!</Text>
            </Box>
          )}
        </Panel>
      </Modal>
    );
  }
);

UnlinkJiraModal.displayName = 'UnlinkJiraModal';

export default UnlinkJiraModal;
