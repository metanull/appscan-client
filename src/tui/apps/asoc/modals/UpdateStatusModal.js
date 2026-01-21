import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import {
  getTemplatesForType,
  saveTemplate,
} from '../../../shared/services/commentTemplates.js';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';

const STATUS_OPTIONS = [
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Reopened', value: 'Reopened' },
  { label: 'Noise (False Positive)', value: 'Noise' },
  { label: 'Passed (Risk Accepted)', value: 'Passed' },
  { label: 'Fixed', value: 'Fixed' },
];

/**
 * Modal for updating issue status with optional comments
 * Supports single and bulk updates with comment templates
 * @param {Object} props - Component props
 * @param {number} props.issueCount - Number of issues to update
 * @param {Array} props.issues - Array of issues with their current status and types
 * @param {Function} props.onUpdate - Callback with status and comment to update issues
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onRequestTextInput - Callback to request text input from parent
 * @returns {JSX.Element}
 */
export const UpdateStatusModal = React.memo(
  ({ issueCount, issues = [], onUpdate, onClose, onRequestTextInput }) => {
    const getInitialIndex = () => {
      if (issues && issues.length > 0) {
        const firstIssueStatus = issues[0].Status;
        const index = STATUS_OPTIONS.findIndex(
          (opt) => opt.value === firstIssueStatus
        );
        return index !== -1 ? index : 0;
      }
      return 0;
    };

    const [step, setStep] = useState('status'); // 'status' | 'template' | 'progress'
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [issueTypes, setIssueTypes] = useState([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [updateError, setUpdateError] = useState(null);

    useEffect(() => {
      if (issues && issues.length > 0) {
        const types = [...new Set(issues.map((i) => i.IssueType))];
        setIssueTypes(types);

        if (types.length > 0) {
          const loadedTemplates = getTemplatesForType(types[0]);
          setTemplates(loadedTemplates);
        }
      }
    }, [issues]);

    useInput((input, key) => {
      if (key.escape) {
        onClose();
      }
    });

    const handleStatusSelect = (item) => {
      setSelectedStatus(item.value);

      if (templates.length > 0) {
        setStep('template');
      } else if (onRequestTextInput) {
        onRequestTextInput({
          title: '📝 Update Status - Add Comment',
          subtitle: `Updating ${issueCount} issue(s) to: ${item.value}`,
          borderColor: 'green',
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
            title: '📝 Update Status - Add Comment',
            subtitle: `Updating ${issueCount} issue(s) to: ${selectedStatus}`,
            borderColor: 'green',
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
      if (!issueCount || issueCount === 0) {
        return;
      }

      if (
        commentText &&
        commentText.trim() !== '' &&
        !templates.includes(commentText) &&
        issueTypes.length > 0
      ) {
        saveTemplate(issueTypes[0], commentText.trim());
      }

      setStep('progress');
      setProgress({ current: 0, total: issueCount });

      try {
        await onUpdate(
          selectedStatus,
          commentText && commentText.trim() !== '' ? commentText : undefined,
          (current, total) => {
            setProgress({ current, total });
          }
        );
        setTimeout(() => {
          onClose();
        }, 500);
      } catch (error) {
        setUpdateError(error.message || 'Failed to update issues');
      }
    };

    const firstIssueHasComments =
      issues &&
      issues.length > 0 &&
      issues[0].LastComment &&
      issues[0].LastComment.trim() !== '';

    const templateOptions = [
      { label: "🚫 Don't add a comment", value: 'no-comment' },
      { label: '✏️  Custom message...', value: 'custom' },
      ...templates.map((t) => ({
        label: t.length > 60 ? t.substring(0, 57) + '...' : t,
        value: t,
      })),
    ];

    const getInitialTemplateIndex = () => {
      return firstIssueHasComments ? 0 : 1;
    };

    return (
      <Modal width={60} height={60}>
        <Panel title="📝 Update Status" borderColor="green">
          <Text marginTop={1}>Updating {issueCount} issue(s)</Text>

          {step === 'status' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Select new status:</Text>
              {issues.length > 0 && (
                <Text dimColor>Current: {issues[0].Status || 'Unknown'}</Text>
              )}
              <SelectInput
                items={STATUS_OPTIONS}
                initialIndex={getInitialIndex()}
                onSelect={handleStatusSelect}
              />
            </Box>
          )}

          {step === 'template' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Select comment template:</Text>
              {issueTypes.length > 0 && (
                <Text dimColor>For: {issueTypes[0]}</Text>
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
                <Text> Updating issues...</Text>
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
