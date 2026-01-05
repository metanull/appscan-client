/**
 * CreateJiraModal Component
 * Modal for creating Jira issues from selected vulnerabilities
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { Modal } from './components/Modal.js';
import { Panel } from './components/Panel.js';
import {
  loadParentEpics,
  saveParentEpic,
  getLastUsedEpic,
} from '../services/parentEpicCache.js';
import {
  createAVSComment,
  parseAVSFromComments,
} from '../../utils/asvs-utils.js';

const GROUP_OPTIONS = [
  { label: 'Type (recommended)', value: 'type' },
  { label: 'Severity', value: 'severity' },
  { label: 'None (one issue per vulnerability)', value: 'none' },
];

export const CreateJiraModal = React.memo(
  ({
    issues,
    defaultProjectKey,
    appName,
    onCreate,
    onSaveAvsComment,
    appScanService,
    onClose,
  }) => {
    const [step, setStep] = useState('project');
    const [projectKey, setProjectKey] = useState(defaultProjectKey || '');
    const [groupBy, setGroupBy] = useState('type');
    const [parentEpic, setParentEpic] = useState('');
    const [recentEpics, setRecentEpics] = useState([]);
    const [avsLabel, setAvsLabel] = useState('');
    const [avsUrl, setAvsUrl] = useState('');
    const [issueTypes, setIssueTypes] = useState([]);
    const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
    const [error, setError] = useState(null);
    const [issuesWithComments, setIssuesWithComments] = useState([]);

    useEffect(() => {
      const epics = loadParentEpics();
      setRecentEpics(epics);
      const lastEpic = getLastUsedEpic();
      if (lastEpic) {
        setParentEpic(lastEpic);
      }

      const types = [...new Set(issues.map((i) => i.IssueType || 'Unknown'))];
      setIssueTypes(types);

      // Load comments for all issues
      if (appScanService && issues.length > 0) {
        Promise.all(
          issues.map(async (issue) => {
            try {
              const comments = await appScanService.getIssueComments(issue.Id);
              return { ...issue, comments };
            } catch {
              return { ...issue, comments: [] };
            }
          })
        ).then((enrichedIssues) => {
          setIssuesWithComments(enrichedIssues);
        });
      } else {
        setIssuesWithComments(issues);
      }
    }, [issues, appScanService]);

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
      if (item.value === 'type' && issueTypes.length > 0) {
        setCurrentTypeIndex(0);
        setStep('asvs');
      } else {
        setStep('epic');
      }
    };

    const handleAvsSelect = async (item) => {
      if (item.value === 'skip' || item.value === 'keep') {
        moveToNextStep();
      } else if (item.value === 'new' || item.value === 'replace') {
        setAvsLabel('');
        setAvsUrl('');
        setStep('avsLabel');
      } else if (item.value === 'remove') {
        // Remove ASVS by adding empty comment (overwrite)
        try {
          const typeIssues = issues.filter((i) => i.IssueType === currentType);
          for (const issue of typeIssues) {
            await onSaveAvsComment(issue.Id, '[ASVS-REMOVED]');
          }
          moveToNextStep();
        } catch (err) {
          setError(err.message);
        }
      }
    };

    const handleAvsLabelSubmit = () => {
      if (!avsLabel || !avsLabel.trim()) {
        setError('ASVS label is required');
        return;
      }
      setError(null);
      setStep('avsUrl');
    };

    const handleAvsUrlSubmit = async () => {
      if (!avsUrl || !avsUrl.trim()) {
        setError('Confluence URL is required');
        return;
      }
      if (!avsUrl.startsWith('http://') && !avsUrl.startsWith('https://')) {
        setError('URL must start with http:// or https://');
        return;
      }
      setError(null);

      try {
        const comment = createAVSComment(avsLabel.trim(), avsUrl.trim());
        const currentType = issueTypes[currentTypeIndex];
        const typeIssues = issues.filter((i) => i.IssueType === currentType);

        for (const issue of typeIssues) {
          await onSaveAvsComment(issue.Id, comment);
        }

        moveToNextStep();
      } catch (err) {
        setError(err.message);
      }
    };

    const moveToNextStep = () => {
      if (currentTypeIndex < issueTypes.length - 1) {
        setCurrentTypeIndex(currentTypeIndex + 1);
        setAvsLabel('');
        setAvsUrl('');
        setStep('asvs');
      } else {
        setStep('epic');
      }
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
          issues,
          parentEpic.trim() || null,
          appName
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
      if (groupBy === 'none') return issues.length;
      if (groupBy === 'severity') {
        return new Set(issues.map((i) => i.Severity)).size;
      }
      return new Set(issues.map((i) => i.IssueType)).size;
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

    const currentType = issueTypes[currentTypeIndex];
    const currentTypeAVS = currentType
      ? parseAVSFromComments(
          issuesWithComments.find((i) => i.IssueType === currentType)
            ?.comments || []
        )
      : null;

    // Format ASVS label: "asvs1.2.3" => "ASVS 1.2.3"
    const formatAvsLabel = (label) => {
      if (!label) return label;
      // Remove 'asvs' prefix and add spaces
      const cleaned = label.toLowerCase().replace(/^asvs/, '');
      return `ASVS ${cleaned}`;
    };

    const avsOptions = currentTypeAVS
      ? [
          {
            label: `✓ Use existing: ${formatAvsLabel(currentTypeAVS.label)}`,
            value: 'keep',
          },
          { label: '🔄 Replace with new ASVS...', value: 'replace' },
          { label: '🗑️  Remove ASVS', value: 'remove' },
        ]
      : [
          { label: '🆕 Add ASVS control...', value: 'new' },
          { label: '⏭️  Skip (no ASVS)', value: 'skip' },
        ];

    return (
      <Modal width={70} height={60}>
        <Panel title="🎫 Create Jira Issue(s)" borderColor="green">
          <Box flexDirection="column" marginTop={1}>
            <Text>Selected Issues: {issues.length}</Text>
            {appName && <Text dimColor>Application: {appName}</Text>}
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
              <Text>Group issues by:</Text>
              <Text dimColor>Will create {getGroupCount()} Jira issue(s)</Text>
              <SelectInput
                items={GROUP_OPTIONS}
                onSelect={handleGroupBySelect}
              />
            </Box>
          )}

          {step === 'asvs' && currentType && (
            <Box flexDirection="column" marginTop={1}>
              <Text>
                ASVS for:{' '}
                <Text bold color="cyan">
                  {currentType}
                </Text>
              </Text>
              {currentTypeAVS && (
                <Box marginTop={1}>
                  <Text dimColor>Current: </Text>
                  <Text color="green">{currentTypeAVS.label}</Text>
                </Box>
              )}
              <Box marginTop={1}>
                <SelectInput items={avsOptions} onSelect={handleAvsSelect} />
              </Box>
            </Box>
          )}

          {step === 'avsLabel' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>
                Type: <Text bold>{currentType}</Text>
              </Text>
              <Text marginTop={1}>Enter ASVS label (e.g., asvs1.2.3):</Text>
              <Box marginTop={1}>
                <Text color="cyan">&gt; </Text>
                <TextInput
                  value={avsLabel}
                  onChange={setAvsLabel}
                  onSubmit={handleAvsLabelSubmit}
                  placeholder="asvs1.2.3"
                />
              </Box>
            </Box>
          )}

          {step === 'avsUrl' && (
            <Box flexDirection="column" marginTop={1}>
              <Text>
                Label: <Text color="cyan">{avsLabel}</Text>
              </Text>
              <Text marginTop={1}>Enter Confluence URL:</Text>
              <Box marginTop={1}>
                <Text color="cyan">&gt; </Text>
                <TextInput
                  value={avsUrl}
                  onChange={setAvsUrl}
                  onSubmit={handleAvsUrlSubmit}
                  placeholder="https://..."
                />
              </Box>
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
