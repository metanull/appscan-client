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
 * Modal for unlinking Jira issues from selected Azure DevOps alerts
 * Removes Jira metadata by temporarily setting state to Active (which clears comment),
 * then restoring to original state
 * @param {Object} props - Component props
 * @param {number} props.alertCount - Number of selected alerts to unlink
 * @param {Array<string>} props.jiraKeys - Array of currently linked Jira keys
 * @param {Function} props.onUnlink - Callback to unlink issues
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const UnlinkJiraModal = React.memo(
  ({ alertCount, jiraKeys, onUnlink, onClose }) => {
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
      <Modal width={70} height={24}>
        <Panel title="🔓 Unlink Jira Issues" borderColor="yellow">
          <Box flexDirection="column" marginTop={1}>
            <Text>Selected Alerts: {alertCount}</Text>
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
          </Box>

          <Box flexDirection="column" marginTop={1} paddingX={1}>
            <Text color="yellow">⚠️ How unlinking works:</Text>
            <Text dimColor>
              • Active alerts: No action needed (no comment when Active)
            </Text>
            <Text dimColor>
              • Non-Active alerts: Temporarily set to Active (clears comment)
            </Text>
            <Text dimColor>
              • Then restored to original state without metadata
            </Text>
            <Text dimColor marginTop={1}>
              Note: User comments will be lost in the process
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
              <Text dimColor>This may take a few moments...</Text>
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
