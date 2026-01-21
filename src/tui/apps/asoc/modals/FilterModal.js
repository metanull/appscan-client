import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';

const FILTER_TYPES = [
  { label: 'Status Filter', value: 'status' },
  { label: 'Severity Filter', value: 'severity' },
  { label: 'Type Filter', value: 'type' },
  { label: 'FixGroup Filter', value: 'fixgroup' },
  { label: 'Jira Filter', value: 'jira' },
  { label: 'Cancel', value: 'cancel' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: null },
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Reopened', value: 'Reopened' },
  { label: 'Noise (False Positive)', value: 'Noise' },
  { label: 'Passed (Risk Accepted)', value: 'Passed' },
  { label: 'Fixed', value: 'Fixed' },
];

const SEVERITY_OPTIONS = [
  { label: 'All Severities', value: null },
  { label: 'Critical', value: 'Critical' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
  { label: 'Informational', value: 'Informational' },
];

const JIRA_OPTIONS = [
  { label: 'Show All', value: null },
  { label: 'Only issues WITH Jira link', value: 'with' },
  { label: 'Only issues WITHOUT Jira link', value: 'without' },
];

/**
 * Modal for filtering vulnerability list by status, severity, type, FixGroup, and Jira linkage
 * Provides multi-step interface for selecting filter type and specific values
 * @param {Object} props - Component props
 * @param {Array} props.issues - Array of issues for generating type filter options
 * @param {Array} props.fixGroups - Array of FixGroup objects with details
 * @param {Function} props.onSelect - Callback with filter type and value when filter is applied
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const FilterModal = ({ issues, fixGroups, onSelect, onClose }) => {
  const [step, setStep] = useState('type'); // 'type' | 'status' | 'severity' | 'jira' | 'issueType' | 'fixgroup'
  const [filterType, setFilterType] = useState(null);

  useInput((input, key) => {
    if (key.escape) {
      onClose();
    }
  });

  const handleTypeSelect = (item) => {
    if (item.value === 'cancel') {
      onClose();
      return;
    }

    if (item.value === 'type') {
      setFilterType('type');
      setStep('issueType');
    } else if (item.value === 'fixgroup') {
      setFilterType('fixgroup');
      setStep('fixgroup');
    } else {
      setFilterType(item.value);
      setStep(item.value);
    }
  };

  const handleFilterSelect = (item) => {
    // Normalize to string or null
    const value = item.value == null ? null : String(item.value);
    onSelect(filterType, value);
    onClose();
  };

  const getIssueTypeOptions = () => {
    const types = [...new Set(issues.map((i) => i.IssueType))].sort();
    return [
      { label: 'Show All Types', value: null },
      ...types.map((type) => ({
        label: `${type} (${issues.filter((i) => i.IssueType === type).length} issues)`,
        value: type,
      })),
    ];
  };

  const getFixGroupOptions = () => {
    if (!fixGroups || fixGroups.length === 0) {
      return [{ label: 'No FixGroups available', value: null }];
    }

    // Group issues by FixGroupId to count them
    const issueCountByFixGroup = {};
    issues.forEach((issue) => {
      if (issue.FixGroupId) {
        issueCountByFixGroup[issue.FixGroupId] =
          (issueCountByFixGroup[issue.FixGroupId] || 0) + 1;
      }
    });

    // Sort by severity and issue count
    const sorted = [...fixGroups].sort((a, b) => {
      const severityOrder = {
        Critical: 5,
        High: 4,
        Medium: 3,
        Low: 2,
        Informational: 1,
        Unknown: 0,
      };
      const severityDiff =
        (severityOrder[b.Severity] || 0) - (severityOrder[a.Severity] || 0);
      if (severityDiff !== 0) return severityDiff;
      const countA = issueCountByFixGroup[a.Id] || 0;
      const countB = issueCountByFixGroup[b.Id] || 0;
      return countB - countA;
    });

    // Filter out fix groups that have no OPEN issues (prefer server NOpenIssues, fall back to NIssues or local count)
    const withOpenIssues = sorted.filter((fg) => {
      const openCount =
        fg.NOpenIssues !== undefined
          ? fg.NOpenIssues
          : fg.NIssues !== undefined
            ? fg.NIssues
            : issueCountByFixGroup[fg.Id] || 0;
      return (openCount || 0) > 0;
    });

    if (withOpenIssues.length === 0) {
      return [{ label: 'No FixGroups with open issues', value: null }];
    }

    return [
      { label: 'Show All FixGroups', value: null },
      ...withOpenIssues.map((fg) => {
        const count =
          fg.NOpenIssues !== undefined
            ? fg.NOpenIssues
            : issueCountByFixGroup[fg.Id] || fg.NIssues || 0;
        const subject = fg.Subject || fg.Id;
        const displaySubject =
          subject.length > 45 ? subject.substring(0, 42) + '...' : subject;
        return {
          label: `${displaySubject} [${fg.Severity}] (${count})`,
          // Use string IDs consistently
          value: String(fg.Id),
        };
      }),
    ];
  };

  return (
    <Modal width={50} height={60}>
      <Panel title="🔍 Filters" borderColor="yellow">
        {step === 'type' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select filter type:</Text>
            <SelectInput items={FILTER_TYPES} onSelect={handleTypeSelect} />
          </Box>
        )}

        {step === 'fixgroup' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select FixGroup:</Text>
            <SelectInput
              items={getFixGroupOptions()}
              onSelect={handleFilterSelect}
            />
          </Box>
        )}

        {step === 'status' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select status:</Text>
            <SelectInput items={STATUS_OPTIONS} onSelect={handleFilterSelect} />
          </Box>
        )}

        {step === 'severity' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select severity:</Text>
            <SelectInput
              items={SEVERITY_OPTIONS}
              onSelect={handleFilterSelect}
            />
          </Box>
        )}

        {step === 'jira' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select Jira filter:</Text>
            <SelectInput items={JIRA_OPTIONS} onSelect={handleFilterSelect} />
          </Box>
        )}

        {step === 'issueType' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select vulnerability type:</Text>
            <SelectInput
              items={getIssueTypeOptions()}
              onSelect={handleFilterSelect}
            />
          </Box>
        )}

        <Box marginTop={1}>
          <Text dimColor>Press ESC to cancel</Text>
        </Box>
      </Panel>
    </Modal>
  );
};

export default FilterModal;
