/**
 * CreateJiraModal for Detectify Vulnerabilities
 * Modal for creating Jira issues from selected vulnerabilities
 * Following the same pattern as AZDO CreateJiraModal
 * 
 * Note: Detectify doesn't have built-in Jira linking (unlike AZDO comments),
 * so we can only create Jira issues but cannot store the link back in Detectify.
 */

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
import { getSeverityName, getStatusName, truncate } from '../utils/vulnerability.js';

const GROUP_OPTIONS = [
  { label: 'Severity (recommended)', value: 'severity' },
  { label: 'Host', value: 'host' },
  { label: 'None (one issue per vulnerability)', value: 'none' },
];

/**
 * Modal for creating Jira issues from selected Detectify vulnerabilities
 * Multi-step wizard for project key, grouping, and parent epic
 * @param {Object} props - Component props
 * @param {Array} props.vulnerabilities - Array of selected vulnerabilities
 * @param {string} props.defaultProjectKey - Default Jira project key
 * @param {Function} props.onCreate - Callback to create Jira issues with configuration
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const CreateJiraModal = React.memo(
  ({ vulnerabilities, defaultProjectKey, onCreate, onClose }) => {
    const [step, setStep] = useState('project');
    const [projectKey, setProjectKey] = useState(defaultProjectKey || '');
    const [groupBy, setGroupBy] = useState('severity');
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
          vulnerabilities,
          parentEpic.trim() || null
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
      if (groupBy === 'none') return vulnerabilities.length;
      if (groupBy === 'severity') {
        return new Set(vulnerabilities.map((v) => v.severity)).size;
      }
      if (groupBy === 'host') {
        return new Set(vulnerabilities.map((v) => v.host)).size;
      }
      return vulnerabilities.length;
    };

    // Summary of selected vulnerabilities
    const getSummary = () => {
      const bySeverity = {};
      const byStatus = {};
      vulnerabilities.forEach((v) => {
        const sev = v.severity || 'unknown';
        const stat = v.status || 'unknown';
        bySeverity[sev] = (bySeverity[sev] || 0) + 1;
        byStatus[stat] = (byStatus[stat] || 0) + 1;
      });
      return { bySeverity, byStatus };
    };

    const summary = getSummary();

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
      <Modal width={70} height={50}>
        <Panel title="🎫 Create Jira Issue(s)" borderColor="green">
          <Box flexDirection="column" marginTop={1}>
            <Text>Selected Vulnerabilities: {vulnerabilities.length}</Text>
            
            {/* Summary */}
            <Box marginTop={1} flexDirection="row">
              <Box marginRight={3}>
                <Text dimColor>By Severity: </Text>
                {Object.entries(summary.bySeverity).map(([sev, count]) => (
                  <Text key={sev}>
                    {getSeverityName(sev)}:{count}{' '}
                  </Text>
                ))}
              </Box>
            </Box>
          </Box>

          {error && (
            <Box marginTop={1}>
              <Text color="red">Error: {error}</Text>
            </Box>
          )}

          {step === 'project' && (
            <Box flexDirection="column" marginTop={2}>
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
            <Box flexDirection="column" marginTop={2}>
              <Text>Group vulnerabilities by:</Text>
              <Text dimColor>Will create {getGroupCount()} Jira issue(s)</Text>
              <SelectInput
                items={GROUP_OPTIONS}
                onSelect={handleGroupBySelect}
              />
            </Box>
          )}

          {step === 'epic' && (
            <Box flexDirection="column" marginTop={2}>
              <Text>Select parent epic (optional):</Text>
              <SelectInput items={epicOptions} onSelect={handleEpicSelect} />
            </Box>
          )}

          {step === 'epicInput' && (
            <Box flexDirection="column" marginTop={2}>
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
            <Box marginTop={2}>
              <Text color="yellow">⏳ Creating Jira issues...</Text>
            </Box>
          )}

          {step === 'success' && (
            <Box marginTop={2}>
              <Text color="green">✅ Jira issues created successfully!</Text>
              <Text dimColor marginTop={1}>
                Note: Detectify doesn't support storing Jira links in vulnerabilities.
              </Text>
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

CreateJiraModal.displayName = 'CreateJiraModal';

export default CreateJiraModal;
