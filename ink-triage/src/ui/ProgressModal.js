/**
 * Progress Modal Component
 * Shows progress for long-running operations with batched processing
 */

import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { Modal } from './components/Modal.js';

export const ProgressModal = ({
  title = 'Processing...',
  current = 0,
  total = 0,
  message = '',
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const progressBar = generateProgressBar(percentage, 40);

  return (
    <Modal width={60} height={30}>
      <Box flexDirection="column" alignItems="center">
        <Text bold color="cyan">
          {title}
        </Text>

        <Box marginTop={1}>
          <Spinner type="dots" />
          <Text> {message}</Text>
        </Box>

        <Box marginTop={1} flexDirection="column" width="100%">
          <Text dimColor>
            Progress: {current} / {total}
          </Text>
          <Box marginTop={1}>
            <Text>
              {progressBar} {percentage}%
            </Text>
          </Box>
        </Box>

        {current < total && (
          <Text dimColor marginTop={1}>
            Please wait, do not close the application...
          </Text>
        )}

        {current === total && (
          <Text color="green" marginTop={1}>
            ✓ Complete!
          </Text>
        )}
      </Box>
    </Modal>
  );
};

/**
 * Generate a text-based progress bar
 */
function generateProgressBar(percentage, width) {
  // Clamp percentage between 0 and 100 to prevent negative values
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const filled = Math.round((clampedPercentage / 100) * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

export default ProgressModal;
