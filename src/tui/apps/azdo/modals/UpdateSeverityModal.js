import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import {
  getTemplatesForType,
  saveTemplate,
} from '../../../shared/services/commentTemplates.js';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';
import { Severity } from '../../../../services/azdo-service.js';

const SEVERITY_OPTIONS = [
  { label: 'Low', value: Severity.Low },
  { label: 'Medium', value: Severity.Medium },
  { label: 'High', value: Severity.High },
  { label: 'Critical', value: Severity.Critical },
];

/**
 * Get human-readable severity name from enum value
 * @param {number} value - Severity enum value
 * @returns {string} Severity name
 */
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

/**
 * Modal for updating Azure DevOps alert severity with optional comments
 * Supports single and bulk updates with comment templates
 * @param {Object} props - Component props
 * @param {number} props.alertCount - Number of alerts to update
 * @param {Array} props.alerts - Array of alerts with their current severity
 * @param {Function} props.onUpdate - Callback with severity and comment to update alerts
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onRequestTextInput - Callback to request text input from parent
 * @returns {JSX.Element}
 */
export const UpdateSeverityModal = React.memo(
  ({ alertCount, alerts = [], onUpdate, onClose, onRequestTextInput }) => {
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

    const [step, setStep] = useState('severity'); // 'severity' | 'template' | 'progress'
    const [selectedSeverity, setSelectedSeverity] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [alertTypes, setAlertTypes] = useState([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [updateError, setUpdateError] = useState(null);

    useEffect(() => {
      if (isInitialized.current) {
        return;
      }
      isInitialized.current = true;

      if (alerts && alerts.length > 0) {
        const types = [...new Set(alerts.map((a) => a.ruleName || a.title || 'Unknown'))];
        setAlertTypes(types);

        if (types.length > 0) {
          const loadedTemplates = getTemplatesForType(types[0]);
          setTemplates(loadedTemplates);
        }
      }
    }, [alerts]);

    useInput((input, key) => {
      if (key.escape) {
        onClose();
      }
    });

    const handleSeveritySelect = (item) => {
      setSelectedSeverity(item.value);

      if (templates.length > 0) {
        setStep('template');
      } else if (onRequestTextInput) {
        onRequestTextInput({
          title: '⚠️  Update Severity - Add Comment',
          subtitle: `Updating ${alertCount} alert(s) to: ${getSeverityName(item.value)}`,
          borderColor: 'yellow',
          placeholder: 'Enter comment (optional)...',
          initialValue: '',
          onComplete: (value) => {
            handleSubmit(value);
          },
        });
      } else {
        handleSubmit();
      }
    };

    const handleTemplateSelect = (item) => {
      if (item.value === 'custom') {
        if (onRequestTextInput) {
          onRequestTextInput({
            title: '⚠️  Update Severity - Add Comment',
            subtitle: `Updating ${alertCount} alert(s) to: ${getSeverityName(selectedSeverity)}`,
            borderColor: 'yellow',
            placeholder: 'Enter comment...',
            initialValue: '',
            onComplete: (value) => {
              handleSubmit(value);
            },
          });
        }
      } else if (item.value === 'no-comment') {
        handleSubmit();
      } else {
        handleSubmit(item.value);
      }
    };

    const handleSubmit = async (commentText = undefined) => {
      if (!alertCount || alertCount === 0) {
        return;
      }

      if (
        commentText &&
        commentText.trim() !== '' &&
        !templates.includes(commentText) &&
        alertTypes.length > 0
      ) {
        saveTemplate(alertTypes[0], commentText.trim());
      }

      setStep('progress');
      setProgress({ current: 0, total: alertCount });

      try {
        await onUpdate(
          selectedSeverity,
          commentText && commentText.trim() !== '' ? commentText : undefined,
          (current, total) => {
            setProgress({ current, total });
          }
        );
        setTimeout(() => {
          onClose();
        }, 500);
      } catch (error) {
        setUpdateError(error.message || 'Failed to update alerts');
      }
    };

    const firstAlertHasComments =
      alerts &&
      alerts.length > 0 &&
      alerts[0].dismissal?.message &&
      alerts[0].dismissal.message.trim() !== '';

    const templateOptions = [
      { label: "🚫 Don't add a comment", value: 'no-comment' },
      { label: '✏️  Custom message...', value: 'custom' },
      ...templates.map((t) => ({
        label: t.length > 60 ? t.substring(0, 57) + '...' : t,
        value: t,
      })),
    ];

    const getInitialTemplateIndex = () => {
      return firstAlertHasComments ? 0 : 1;
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

          {step === 'template' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Select comment template:</Text>
              {alertTypes.length > 0 && (
                <Text dimColor>For: {alertTypes[0]}</Text>
              )}
              <SelectInput
                items={templateOptions}
                initialIndex={getInitialTemplateIndex()}
                onSelect={handleTemplateSelect}
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

UpdateSeverityModal.displayName = 'UpdateSeverityModal';

export default UpdateSeverityModal;
