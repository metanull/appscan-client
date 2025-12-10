/**
 * UpdateStatusModal Component
 * Modal for updating issue status (single or bulk)
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';

const STATUS_OPTIONS = [
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Reopened', value: 'Reopened' },
  { label: 'Noise (False Positive)', value: 'Noise' },
  { label: 'Passed (Risk Accepted)', value: 'Passed' },
  { label: 'Fixed', value: 'Fixed' },
];

export const UpdateStatusModal = ({ issueCount, onUpdate, onClose }) => {
  const [step, setStep] = useState('status'); // 'status' | 'comment'
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [comment, setComment] = useState('');

  useInput((input, key) => {
    if (key.escape) {
      onClose();
    }
  });

  const handleStatusSelect = (item) => {
    setSelectedStatus(item.value);
    setStep('comment');
  };

  const handleSubmit = () => {
    onUpdate(selectedStatus, comment || undefined);
    onClose();
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="green"
      paddingX={2}
      paddingY={1}
      width="60%"
      marginX="auto"
    >
      <Text bold color="green">📝 Update Status</Text>
      <Text marginTop={1}>Updating {issueCount} issue(s)</Text>

      {step === 'status' && (
        <Box flexDirection="column" marginTop={1}>
          <Text>Select new status:</Text>
          <SelectInput items={STATUS_OPTIONS} onSelect={handleStatusSelect} />
        </Box>
      )}

      {step === 'comment' && (
        <Box flexDirection="column" marginTop={1}>
          <Text>Add comment (optional, press Enter to submit):</Text>
          <Box marginTop={1}>
            <Text color="cyan">&gt; </Text>
            <TextInput
              value={comment}
              onChange={setComment}
              onSubmit={handleSubmit}
              placeholder="Enter comment..."
            />
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press ESC to cancel</Text>
      </Box>
    </Box>
  );
};

export default UpdateStatusModal;
