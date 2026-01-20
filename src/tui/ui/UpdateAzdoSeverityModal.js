import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { Modal } from './components/Modal.js';
import { Panel } from './components/Panel.js';
import { Severity } from '../../services/azdo-service.js';

const SEVERITY_OPTIONS = [
  { label: 'Low', value: Severity.Low },
  { label: 'Medium', value: Severity.Medium },
  { label: 'High', value: Severity.High },
  { label: 'Critical', value: Severity.Critical },
];

/**
 * Modal for updating Azure DevOps alert severity
 * @param {Object} props - Component props
 * @param {number} props.alertCount - Number of alerts to update
 * @param {Array} props.alerts - Array of alerts with their current severity
 * @param {Function} props.onUpdate - Callback with severity to update alerts
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const UpdateAzdoSeverityModal = React.memo(
  ({ alertCount, alerts = [], onUpdate, onClose }) => {
    const isInitialized = useRef(false);

    const getInitialIndex = () => {
      if (alerts && alerts.length > 0) {
        const firstAlertSeverity = alerts[0].severity;
        const index = SEVERITY_OPTIONS.findIndex(
          (opt) => opt.value === firstAlertSeverity
        );
        return index !== -1 ? index : 0;
      }
      return 0;
    };

    const [step, setStep] = useState('severity');
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [updateError, setUpdateError] = useState(null);

    useEffect(() => {
      if (isInitialized.current) {
        return;
      }
      isInitialized.current = true;
    }, []);

    useInput((input, key) => {
      if (key.escape) {
        onClose();
      }
    });

    const handleSeveritySelect = (item) => {
      handleSubmit(item.value);
    };

    const handleSubmit = async (severity) => {
      if (!alertCount || alertCount === 0) {
        return;
      }

      setStep('progress');
      setProgress({ current: 0, total: alertCount });

      try {
        await onUpdate(severity, (current, total) => {
          setProgress({ current, total });
        });
        setTimeout(() => {
          onClose();
        }, 500);
      } catch (error) {
        setUpdateError(error.message || 'Failed to update alerts');
      }
    };

    const getSeverityName = (value) => {
      if (value === Severity.Low) return 'Low';
      if (value === Severity.Medium) return 'Medium';
      if (value === Severity.High) return 'High';
      if (value === Severity.Critical) return 'Critical';
      if (value === Severity.Note) return 'Note';
      if (value === Severity.Warning) return 'Warning';
      if (value === Severity.Error) return 'Error';
      return 'Unknown';
    };

    return (
      <Modal width={60} height={60}>
        <Panel title="⚠️  Update Alert Severity" borderColor="yellow">
          <Text marginTop={1}>Updating {alertCount} alert(s)</Text>

          {step === 'severity' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Select new severity:</Text>
              {alerts.length > 0 && (
                <Text dimColor>
                  Current: {getSeverityName(alerts[0].severity)}
                </Text>
              )}
              <SelectInput
                items={SEVERITY_OPTIONS}
                initialIndex={getInitialIndex()}
                onSelect={handleSeveritySelect}
              />
            </Box>
          )}

          {step === 'progress' && (
            <Box flexDirection="column" marginTop={1}>
              <Box marginBottom={1}>
                <Text color="green">
                  <Spinner type="dots" />
                </Text>
                <Text> Updating alerts...</Text>
              </Box>
              <Text>
                Progress: {progress.current} / {progress.total} (
                {Math.round((progress.current / progress.total) * 100)}%)
              </Text>
              <Box marginTop={1}>
                <Text dimColor>
                  [
                  {'█'.repeat(
                    Math.round((progress.current / progress.total) * 30)
                  )}
                  {'░'.repeat(
                    30 - Math.round((progress.current / progress.total) * 30)
                  )}
                  ]
                </Text>
              </Box>
              {updateError && (
                <Box marginTop={1}>
                  <Text color="red">Error: {updateError}</Text>
                </Box>
              )}
            </Box>
          )}

          {step !== 'progress' && (
            <Box marginTop={1}>
              <Text dimColor>Press ESC to cancel</Text>
            </Box>
          )}
        </Panel>
      </Modal>
    );
  }
);

UpdateAzdoSeverityModal.displayName = 'UpdateAzdoSeverityModal';

export default UpdateAzdoSeverityModal;
