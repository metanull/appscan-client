/**
 * UpdateSeverityModal Component
 * Modal for updating issue severity (single or bulk)
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import {
  getTemplatesForType,
  saveTemplate,
} from '../services/commentTemplates.js';
import { Modal } from './components/Modal.js';
import { Panel } from './components/Panel.js';

const SEVERITY_OPTIONS = [
  { label: 'Informational', value: 'Informational' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
];

export const UpdateSeverityModal = React.memo(
  ({ issueCount, issues = [], onUpdate, onClose, onRequestTextInput }) => {
    // Calculate initial index from first issue's severity
    const getInitialIndex = () => {
      if (issues && issues.length > 0) {
        const firstIssueSeverity = issues[0].Severity;
        const index = SEVERITY_OPTIONS.findIndex(
          (opt) => opt.value === firstIssueSeverity
        );
        return index !== -1 ? index : 0;
      }
      return 0;
    };

    const [step, setStep] = useState('severity'); // 'severity' | 'template' | 'progress'
    const [selectedSeverity, setSelectedSeverity] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [issueTypes, setIssueTypes] = useState([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [updateError, setUpdateError] = useState(null);

    // Load templates when issues are available
    useEffect(() => {
      if (issues && issues.length > 0) {
        // Get unique issue types from selected issues
        const types = [...new Set(issues.map((i) => i.IssueType))];
        setIssueTypes(types);

        // Load templates for the first issue type
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

    const handleSeveritySelect = (item) => {
      setSelectedSeverity(item.value);

      // If we have templates, show template selection; otherwise request text input directly
      if (templates.length > 0) {
        setStep('template');
      } else if (onRequestTextInput) {
        // No templates - go directly to text input page
        onRequestTextInput({
          title: '⚠️  Update Severity - Add Comment',
          subtitle: `Updating ${issueCount} issue(s) to: ${item.value}`,
          borderColor: 'yellow',
          placeholder: 'Enter comment (optional)...',
          initialValue: '',
          onComplete: (value) => {
            // Submit immediately after text input
            handleSubmitWithComment(value || '');
          },
        });
      } else {
        // Fallback: submit without comment
        handleSubmitWithComment('');
      }
    };

    const handleTemplateSelect = (item) => {
      if (item.value === 'custom') {
        // User wants to type custom message - request text input page
        if (onRequestTextInput) {
          onRequestTextInput({
            title: '⚠️  Update Severity - Add Comment',
            subtitle: `Updating ${issueCount} issue(s) to: ${selectedSeverity}`,
            borderColor: 'yellow',
            placeholder: 'Enter comment...',
            initialValue: '',
            onComplete: (value) => {
              // Submit immediately after text input
              handleSubmitWithComment(value || '');
            },
          });
        }
      } else {
        // Use selected template and submit immediately
        handleSubmitWithComment(item.value);
      }
    };

    const handleSubmitWithComment = async (commentText) => {
      if (!issueCount || issueCount === 0) {
        return; // Prevent submission if no issues selected
      }

      // Save custom comment as template if it's not empty and not already a template
      if (
        commentText &&
        commentText.trim() !== '' &&
        !templates.includes(commentText) &&
        issueTypes.length > 0
      ) {
        // Save to first issue type
        saveTemplate(issueTypes[0], commentText.trim());
      }

      // Show progress step
      setStep('progress');
      setProgress({ current: 0, total: issueCount });

      try {
        await onUpdate(
          selectedSeverity,
          commentText || undefined,
          (current, total) => {
            setProgress({ current, total });
          }
        );
        // Success - close after a brief delay
        setTimeout(() => {
          onClose();
        }, 500);
      } catch (error) {
        setUpdateError(error.message || 'Failed to update issues');
      }
    };

    // Prepare template options
    const templateOptions = [
      { label: '✏️  Custom message...', value: 'custom' },
      ...templates.map((t) => ({
        label: t.length > 60 ? t.substring(0, 57) + '...' : t,
        value: t,
      })),
    ];

    return (
      <Modal width={60} height={60}>
        <Panel title="⚠️  Update Severity" borderColor="yellow">
          <Text marginTop={1}>Updating {issueCount} issue(s)</Text>

          {step === 'severity' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Select new severity:</Text>
              {issues.length > 0 && (
                <Text dimColor>Current: {issues[0].Severity || 'Unknown'}</Text>
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
              {issueTypes.length > 0 && (
                <Text dimColor>For: {issueTypes[0]}</Text>
              )}
              <SelectInput
                items={templateOptions}
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

UpdateSeverityModal.displayName = 'UpdateSeverityModal';

export default UpdateSeverityModal;
