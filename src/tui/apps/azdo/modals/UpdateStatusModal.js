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
import { State, DismissalType } from '../../../../services/azdo-service.js';

const STATE_OPTIONS = [
  { label: 'Active', value: State.Active },
  { label: 'Dismissed', value: State.Dismissed },
  { label: 'Fixed', value: State.Fixed },
];

const DISMISSAL_TYPE_OPTIONS = [
  { label: 'Fixed', value: DismissalType.Fixed },
  { label: 'Accepted Risk', value: DismissalType.AcceptedRisk },
  { label: 'False Positive', value: DismissalType.FalsePositive },
  { label: 'Agreed To Guidance', value: DismissalType.AgreedToGuidance },
  { label: 'Tool Upgrade', value: DismissalType.ToolUpgrade },
];

/**
 * Modal for updating Azure DevOps alert state with optional dismissal type and comments
 * Supports single and bulk updates with comment templates and metadata preservation
 * @param {Object} props - Component props
 * @param {number} props.alertCount - Number of alerts to update
 * @param {Array} props.alerts - Array of alerts with their current state
 * @param {Function} props.onUpdate - Callback with state, dismissal type, and comment to update alerts
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onRequestTextInput - Callback to request text input from parent
 * @param {Function} props.parseAlertMetadata - Function to parse metadata from alert
 * @param {Function} props.buildCommentWithMetadata - Function to build comment with metadata
 * @returns {JSX.Element}
 */
export const UpdateStatusModal = React.memo(
  ({
    alertCount,
    alerts = [],
    onUpdate,
    onClose,
    onRequestTextInput,
    parseAlertMetadata,
  }) => {
    const isInitialized = useRef(false);

    const getInitialIndex = () => {
      if (alerts && alerts.length > 0) {
        const firstAlertState = alerts[0].state;
        const index = STATE_OPTIONS.findIndex(
          (opt) => opt.value === firstAlertState
        );
        return index !== -1 ? index : 0;
      }
      return 0;
    };

    const [step, setStep] = useState('state'); // 'state' | 'dismissalType' | 'template' | 'progress'
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDismissalType, setSelectedDismissalType] = useState(null);
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
        const types = [
          ...new Set(alerts.map((a) => a.ruleName || a.title || 'Unknown')),
        ];
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

    const handleStateSelect = (item) => {
      setSelectedState(item.value);

      if (item.value === State.Dismissed) {
        // Dismissed state requires user to choose dismissal reason
        setStep('dismissalType');
      } else if (item.value === State.Fixed) {
        // Fixed state automatically sets dismissalReason to Fixed (1)
        setSelectedDismissalType(DismissalType.Fixed);
        promptForCommentWithTemplate(DismissalType.Fixed);
      } else {
        // Active state doesn't support comments in Azure DevOps API
        // Submit directly without prompting for comment
        handleSubmit('', item.value, null);
      }
    };

    const handleDismissalTypeSelect = (item) => {
      setSelectedDismissalType(item.value);
      promptForCommentWithTemplate(item.value);
    };

    const promptForCommentWithTemplate = (dismissalType) => {
      if (templates.length > 0) {
        setStep('template');
      } else {
        promptForComment(dismissalType);
      }
    };

    const handleTemplateSelect = (item) => {
      if (item.value === 'custom') {
        promptForComment(selectedDismissalType);
      } else if (item.value === 'no-comment') {
        handleSubmit('', selectedState, selectedDismissalType);
      } else {
        handleSubmit(item.value, selectedState, selectedDismissalType);
      }
    };

    const promptForComment = (dismissalType) => {
      if (!onRequestTextInput) {
        handleSubmit('', selectedState, dismissalType);
        return;
      }

      let existingComment = '';
      if (alerts && alerts.length === 1 && alerts[0].dismissal?.message) {
        const _metadata = parseAlertMetadata
          ? parseAlertMetadata(alerts[0])
          : {};
        const message = alerts[0].dismissal.message;
        const metadataMatch = message.match(/\[METADATA\].*?\[\/METADATA\]/s);
        existingComment = metadataMatch
          ? message.replace(metadataMatch[0], '').trim()
          : message;
      }

      onRequestTextInput({
        title: '📝 Update Alert State - Add Comment',
        subtitle: `Updating ${alertCount} alert(s)`,
        borderColor: 'green',
        placeholder: 'Enter comment (optional)...',
        initialValue: existingComment,
        onComplete: (value) => {
          handleSubmit(value, selectedState, dismissalType);
        },
      });
    };

    const handleSubmit = async (
      commentText = '',
      state = null,
      dismissalType = null
    ) => {
      if (!alertCount || alertCount === 0) {
        return;
      }

      // Save new comment as template if it's a new custom comment
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
        const comment =
          commentText && commentText.trim() !== ''
            ? commentText.trim()
            : undefined;

        await onUpdate(
          state || selectedState,
          dismissalType || selectedDismissalType,
          comment,
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
        <Panel title="📝 Update Alert State" borderColor="green">
          <Text marginTop={1}>Updating {alertCount} alert(s)</Text>

          {step === 'state' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Select new state:</Text>
              {alerts.length > 0 && (
                <Text dimColor>
                  Current:{' '}
                  {alerts[0].state === State.Active
                    ? 'Active'
                    : alerts[0].state === State.Dismissed
                      ? 'Dismissed'
                      : alerts[0].state === State.Fixed
                        ? 'Fixed'
                        : 'Unknown'}
                </Text>
              )}
              <SelectInput
                items={STATE_OPTIONS}
                initialIndex={getInitialIndex()}
                onSelect={handleStateSelect}
              />
            </Box>
          )}

          {step === 'dismissalType' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Select dismissal reason:</Text>
              <SelectInput
                items={DISMISSAL_TYPE_OPTIONS}
                onSelect={handleDismissalTypeSelect}
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

UpdateStatusModal.displayName = 'UpdateStatusModal';

export default UpdateStatusModal;
