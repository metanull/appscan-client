/**
 * UpdateStatusModal Component
 * Modal for updating issue status (single or bulk)
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { getTemplatesForType, saveTemplate } from '../services/commentTemplates.js';

const STATUS_OPTIONS = [
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Reopened', value: 'Reopened' },
  { label: 'Noise (False Positive)', value: 'Noise' },
  { label: 'Passed (Risk Accepted)', value: 'Passed' },
  { label: 'Fixed', value: 'Fixed' },
];

export const UpdateStatusModal = ({ issueCount, issues = [], onUpdate, onClose }) => {
  const [step, setStep] = useState('status'); // 'status' | 'template' | 'comment'
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [comment, setComment] = useState('');
  const [templates, setTemplates] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);

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
    // Only intercept ESC when typing in comment field
    if (key.escape) {
      onClose();
    }
    // Allow 'b' to go back only when NOT in comment input step
    if (input === 'b' && step === 'status') {
      onClose();
    }
  });

  const handleStatusSelect = (item) => {
    setSelectedStatus(item.value);

    // If we have templates, show template selection; otherwise go straight to comment
    if (templates.length > 0) {
      setStep('template');
    } else {
      setStep('comment');
    }
  };

  const handleTemplateSelect = (item) => {
    if (item.value === 'custom') {
      // User wants to type custom message
      setComment('');
      setStep('comment');
    } else {
      // Use selected template
      setComment(item.value);
      setStep('comment');
    }
  };

  const handleSubmit = () => {
    if (!issueCount || issueCount === 0) {
      return; // Prevent submission if no issues selected
    }

    // Save custom comment as template if it's not empty and not already a template
    if (comment && comment.trim() !== '' && !templates.includes(comment) && issueTypes.length > 0) {
      // Save to first issue type
      saveTemplate(issueTypes[0], comment.trim());
    }

    onUpdate(selectedStatus, comment || undefined);
    onClose();
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
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="green"
      paddingX={2}
      paddingY={1}
      width="60%"
      marginX="auto"
    >
      <Text bold color="green">
        📝 Update Status
      </Text>
      <Text marginTop={1}>Updating {issueCount} issue(s)</Text>

      {step === 'status' && (
        <Box flexDirection="column" marginTop={1}>
          <Text>Select new status:</Text>
          <SelectInput items={STATUS_OPTIONS} onSelect={handleStatusSelect} />
        </Box>
      )}

      {step === 'template' && (
        <Box flexDirection="column" marginTop={1}>
          <Text>Select comment template:</Text>
          {issueTypes.length > 0 && <Text dimColor>For: {issueTypes[0]}</Text>}
          <SelectInput items={templateOptions} onSelect={handleTemplateSelect} />
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
