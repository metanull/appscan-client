import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';
import {
  loadParentEpics,
  saveParentEpic,
  getLastUsedEpic,
} from '../../../shared/services/parentEpicCache.js';

const GROUP_OPTIONS = [
  { label: 'Type (recommended)', value: 'type' },
  { label: 'Severity', value: 'severity' },
  { label: 'None (one issue per alert)', value: 'none' },
];

/**
 * Modal for creating Jira issues from selected Azure DevOps alerts
 * Multi-step wizard for project key, grouping, and parent epic
 * @param {Object} props - Component props
 * @param {Array} props.alerts - Array of selected alerts
 * @param {string} props.defaultProjectKey - Default Jira project key
 * @param {string} props.projectName - Project name for Jira issue context
 * @param {Function} props.onCreate - Callback to create Jira issues with configuration
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const CreateJiraModal = React.memo(
  ({ alerts, defaultProjectKey, projectName, onCreate, onClose }) => {
    const [step, setStep] = useState('project');
    const [projectKey, setProjectKey] = useState(defaultProjectKey || '');
    const [groupBy, setGroupBy] = useState('type');
    const [parentEpic, setParentEpic] = useState('');
    const [recentEpics, setRecentEpics] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
      const epics = loadParentEpics();
      setRecentEpics(epics);
      const lastEpic = getLastUsedEpic();
      if (lastEpic) {
        setParentEpic(lastEpic);
      }
    }, []);

    useInput((input, key) => {
      if (key.escape && step !== 'creating') {
        onClose();
      }
    });

    const handleProjectSubmit = () => {
      if (!projectKey || projectKey.trim() === '') {
        setError('Project key is required');
        return;
      }
      setError(null);
      setStep('groupBy');
    };

    const handleGroupBySelect = (item) => {
      setGroupBy(item.value);
      setStep('epic');
    };

    const handleEpicSelect = (item) => {
      if (item.value === 'none') {
        setParentEpic('');
        handleCreate();
      } else if (item.value === 'custom') {
        setParentEpic('');
        setStep('epicInput');
      } else {
        setParentEpic(item.value);
        setStep('epicInput');
      }
    };

    const handleEpicSubmit = () => {
      handleCreate();
    };

    const handleCreate = async () => {
      if (parentEpic && parentEpic.trim()) {
        saveParentEpic(parentEpic.trim());
      }

      setStep('creating');

      try {
        await onCreate(
          projectKey,
          groupBy,
          alerts,
          parentEpic.trim() || null,
          projectName
        );
        setStep('success');
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (err) {
        setError(err.message);
        setStep('epic');
      }
    };

    const getGroupCount = () => {
      if (groupBy === 'none') return alerts.length;
      if (groupBy === 'severity') {
        return new Set(alerts.map((a) => a.severity)).size;
      }
      return new Set(alerts.map((a) => a.alertType)).size;
    };

    const epicOptions = [
      { label: '🆕 No parent epic', value: 'none' },
      ...(recentEpics.length > 0
        ? recentEpics
            .slice()
            .reverse()
            .slice(0, 5)
            .map((epic) => ({
              label: `📌 ${epic}`,
              value: epic,
            }))
        : []),
      { label: '✏️  Enter custom epic...', value: 'custom' },
    ];

    return (
      <Modal width={70} height={40}>
        <Panel title="🎫 Create Jira Issue(s)" borderColor="green">
          <Box flexDirection="column" marginTop={1}>
            <Text>Selected Alerts: {alerts.length}</Text>
            {projectName && <Text dimColor>Project: {projectName}</Text>}
          </Box>

          {error && (
            <Box marginTop={1}>
              <Text color="red">Error: {error}</Text>
            </Box>
          )}

          {step === 'project' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Enter Jira project key:</Text>
              <Box marginTop={1}>
                <Text color="cyan">&gt; </Text>
                <TextInput
                  value={projectKey}
                  onChange={setProjectKey}
                  onSubmit={handleProjectSubmit}
                  placeholder="e.g., SEC, PROJ..."
                />
              </Box>
            </Box>
          )}

          {step === 'groupBy' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Group alerts by:</Text>
              <Text dimColor>Will create {getGroupCount()} Jira issue(s)</Text>
              <SelectInput
                items={GROUP_OPTIONS}
                onSelect={handleGroupBySelect}
              />
            </Box>
          )}

          {step === 'epic' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Select parent epic (optional):</Text>
              <SelectInput items={epicOptions} onSelect={handleEpicSelect} />
            </Box>
          )}

          {step === 'epicInput' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>Enter epic key (or leave empty):</Text>
              <Box marginTop={1}>
                <Text color="cyan">&gt; </Text>
                <TextInput
                  value={parentEpic}
                  onChange={setParentEpic}
                  onSubmit={handleEpicSubmit}
                  placeholder="SEC-123"
                />
              </Box>
              <Text dimColor marginTop={1}>
                Press Enter to continue
              </Text>
            </Box>
          )}

          {step === 'creating' && (
            <Box marginTop={1}>
              <Text color="yellow">⏳ Creating Jira issues...</Text>
            </Box>
          )}

          {step === 'success' && (
            <Box marginTop={1}>
              <Text color="green">✅ Successfully created Jira issues!</Text>
            </Box>
          )}

          {step !== 'creating' && step !== 'success' && (
            <Box marginTop={1}>
              <Text dimColor>Press ESC to cancel</Text>
            </Box>
          )}
        </Panel>
      </Modal>
    );
  }
);

CreateJiraModal.displayName = 'CreateJiraModal';

export default CreateJiraModal;
