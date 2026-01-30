/**
 * UpdateStatusModal for Detectify Vulnerabilities
 * Modal for updating vulnerability status
 * Following the same pattern as AZDO UpdateStatusModal
 */

import React, { useState, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';
import { VulnerabilityStatus } from '../../../../services/detectify-service.js';
import { getStatusName, STATUS_COLORS } from '../utils/vulnerability.js';

const STATUS_OPTIONS = [
  { label: '✅ Set as Patched (Fixed)', value: VulnerabilityStatus.Patched },
  { label: '🛡️ Set as Accepted Risk', value: VulnerabilityStatus.AcceptedRisk },
  {
    label: '❌ Set as False Positive',
    value: VulnerabilityStatus.FalsePositive,
  },
  { label: '🔄 Revert to Active', value: 'active' },
];

/**
 * Modal for updating Detectify vulnerability status
 * Supports single and bulk updates
 *
 * Note: Detectify doesn't support comments on status changes
 *
 * @param {Object} props - Component props
 * @param {number} props.vulnerabilityCount - Number of vulnerabilities to update
 * @param {Array} props.vulnerabilities - Array of vulnerabilities with their current status
 * @param {Function} props.onUpdate - Callback with target status to update vulnerabilities
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const UpdateStatusModal = React.memo(
  ({ vulnerabilityCount, vulnerabilities = [], onUpdate, onClose }) => {
    const _isInitialized = useRef(false);
    const [step, setStep] = useState('status'); // 'status' | 'confirm' | 'progress' | 'success' | 'error'
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [updateError, setUpdateError] = useState(null);

    // Get current status summary
    const currentStatuses = vulnerabilities.reduce((acc, v) => {
      const status = v.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Filter available options based on current status
    const getAvailableOptions = () => {
      if (vulnerabilities.length === 0) return STATUS_OPTIONS;

      // If all vulnerabilities have the same status, show appropriate options
      const uniqueStatuses = Object.keys(currentStatuses);

      return STATUS_OPTIONS.filter((opt) => {
        // Always show "Revert to Active" if any vulnerability is in a resolved state
        if (opt.value === 'active') {
          return uniqueStatuses.some((s) =>
            [
              VulnerabilityStatus.Patched,
              VulnerabilityStatus.AcceptedRisk,
              VulnerabilityStatus.FalsePositive,
            ].includes(s)
          );
        }
        // Don't show an option if all vulnerabilities already have that status
        if (uniqueStatuses.length === 1 && uniqueStatuses[0] === opt.value) {
          return false;
        }
        return true;
      });
    };

    useInput((input, key) => {
      if (key.escape && step !== 'progress') {
        onClose();
      }
    });

    const handleStatusSelect = (item) => {
      setSelectedStatus(item.value);
      setStep('confirm');
    };

    const handleConfirm = async (confirmed) => {
      if (!confirmed) {
        setStep('status');
        return;
      }

      setStep('progress');
      setProgress({ current: 0, total: vulnerabilityCount });

      try {
        await onUpdate(selectedStatus, (current, total) => {
          setProgress({ current, total });
        });
        setStep('success');
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err) {
        setUpdateError(err.message);
        setStep('error');
      }
    };

    const availableOptions = getAvailableOptions();

    return (
      <Modal width={60} height={50}>
        <Panel title="🔄 Update Status" borderColor="green">
          <Box flexDirection="column" marginTop={1}>
            <Text>Vulnerabilities selected: {vulnerabilityCount}</Text>

            {/* Current status summary */}
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>Current status:</Text>
              {Object.entries(currentStatuses).map(([status, count]) => (
                <Text key={status}>
                  <Text color={STATUS_COLORS[status] || 'white'}>
                    • {getStatusName(status)}: {count}
                  </Text>
                </Text>
              ))}
            </Box>
          </Box>

          {/* Status Selection */}
          {step === 'status' && (
            <Box flexDirection="column" marginTop={2}>
              <Text>Select new status:</Text>
              <Text dimColor marginBottom={1}>
                Note: Detectify doesn't support comments on status changes
              </Text>
              {availableOptions.length > 0 ? (
                <SelectInput
                  items={availableOptions}
                  onSelect={handleStatusSelect}
                />
              ) : (
                <Text color="yellow">No status changes available</Text>
              )}
            </Box>
          )}

          {/* Confirmation */}
          {step === 'confirm' && (
            <Box flexDirection="column" marginTop={2}>
              <Text bold color="yellow">
                Confirm status change:
              </Text>
              <Box marginTop={1}>
                <Text>
                  Change {vulnerabilityCount} vulnerability(ies) to:{' '}
                  <Text bold color="cyan">
                    {getStatusName(selectedStatus)}
                  </Text>
                </Text>
              </Box>
              <Box marginTop={2}>
                <SelectInput
                  items={[
                    { label: '✅ Yes, update', value: true },
                    { label: '❌ Cancel', value: false },
                  ]}
                  onSelect={(item) => handleConfirm(item.value)}
                />
              </Box>
            </Box>
          )}

          {/* Progress */}
          {step === 'progress' && (
            <Box marginTop={2} flexDirection="column">
              <Box>
                <Spinner type="dots" />
                <Text> Updating vulnerabilities...</Text>
              </Box>
              <Box marginTop={1}>
                <Text>
                  Progress: {progress.current} / {progress.total}
                </Text>
              </Box>
            </Box>
          )}

          {/* Success */}
          {step === 'success' && (
            <Box marginTop={2}>
              <Text color="green">
                ✅ Successfully updated {vulnerabilityCount} vulnerability(ies)
              </Text>
            </Box>
          )}

          {/* Error */}
          {step === 'error' && (
            <Box marginTop={2} flexDirection="column">
              <Text color="red">❌ Error updating vulnerabilities:</Text>
              <Text color="red">{updateError}</Text>
              <Box marginTop={1}>
                <Text dimColor>Press Esc to close</Text>
              </Box>
            </Box>
          )}

          <Box marginTop={2}>
            <Text dimColor>Esc to cancel</Text>
          </Box>
        </Panel>
      </Modal>
    );
  }
);

UpdateStatusModal.displayName = 'UpdateStatusModal';

export default UpdateStatusModal;
