/**
 * FilterModal Component
 * Modal for selecting filters
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

const FILTER_TYPES = [
  { label: 'Status Filter', value: 'status' },
  { label: 'Severity Filter', value: 'severity' },
  { label: 'Type Filter', value: 'type' },
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

export const FilterModal = ({ issues, onSelect, onClose }) => {
  const [step, setStep] = useState('type'); // 'type' | 'status' | 'severity' | 'jira' | 'issueType'
  const [filterType, setFilterType] = useState(null);

  const handleTypeSelect = (item) => {
    if (item.value === 'cancel') {
      onClose();
      return;
    }

    if (item.value === 'type') {
      setFilterType('type');
      setStep('issueType');
    } else {
      setFilterType(item.value);
      setStep(item.value);
    }
  };

  const handleFilterSelect = (item) => {
    onSelect(filterType, item.value);
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

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="yellow"
      paddingX={2}
      paddingY={1}
      width="50%"
      marginX="auto"
    >
      <Text bold color="yellow">
        🔍 Filters
      </Text>

      {step === 'type' && (
        <Box flexDirection="column" marginTop={1}>
          <Text>Select filter type:</Text>
          <SelectInput items={FILTER_TYPES} onSelect={handleTypeSelect} />
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
          <SelectInput items={SEVERITY_OPTIONS} onSelect={handleFilterSelect} />
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
          <SelectInput items={getIssueTypeOptions()} onSelect={handleFilterSelect} />
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press ESC to cancel</Text>
      </Box>
    </Box>
  );
};

export default FilterModal;
