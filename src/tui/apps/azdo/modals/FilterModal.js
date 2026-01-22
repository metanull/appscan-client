import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';
import {
  State,
  Severity,
  AlertType,
} from '../../../../services/azdo-service.js';
import {
  getStateName,
  getSeverityName,
  getAlertTypeName,
  getComputedStatus,
  COMPUTED_STATUS,
} from '../utils/issue.js';

const FILTER_TYPES = [
  { label: 'Status Filter', value: 'status' },
  { label: 'State Filter', value: 'state' },
  { label: 'Severity Filter', value: 'severity' },
  { label: 'Alert Type Filter', value: 'alertType' },
  { label: 'Jira Filter', value: 'jira' },
  { label: 'Cancel', value: 'cancel' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: null },
  { label: 'Open', value: COMPUTED_STATUS.Open },
  { label: 'InProgress', value: COMPUTED_STATUS.InProgress },
  { label: 'Passed', value: COMPUTED_STATUS.Passed },
  { label: 'Noise', value: COMPUTED_STATUS.Noise },
  { label: 'Fixed', value: COMPUTED_STATUS.Fixed },
];

const STATE_OPTIONS = [
  { label: 'All States', value: null },
  { label: 'Active', value: State.Active },
  { label: 'Dismissed', value: State.Dismissed },
  { label: 'Fixed', value: State.Fixed },
  { label: 'Auto Dismissed', value: State.AutoDismissed },
];

const SEVERITY_OPTIONS = [
  { label: 'All Severities', value: null },
  { label: 'Critical', value: Severity.Critical },
  { label: 'High', value: Severity.High },
  { label: 'Medium', value: Severity.Medium },
  { label: 'Low', value: Severity.Low },
  { label: 'Note', value: Severity.Note },
  { label: 'Warning', value: Severity.Warning },
  { label: 'Error', value: Severity.Error },
];

const ALERT_TYPE_OPTIONS = [
  { label: 'All Types', value: null },
  { label: 'Dependency', value: AlertType.Dependency },
  { label: 'Secret', value: AlertType.Secret },
  { label: 'Code', value: AlertType.Code },
  { label: 'License', value: AlertType.License },
  { label: 'Unknown', value: AlertType.Unknown },
];

const JIRA_OPTIONS = [
  { label: 'Show All', value: null },
  { label: 'Only alerts WITH Jira link', value: 'with' },
  { label: 'Only alerts WITHOUT Jira link', value: 'without' },
];

/**
 * Modal for filtering Azure DevOps alert list by state, severity, type, and Jira linkage
 * Provides multi-step interface for selecting filter type and specific values
 * @param {Object} props - Component props
 * @param {Array} props.alerts - Array of alerts for generating statistics
 * @param {Function} props.onSelect - Callback with filter type and value when filter is applied
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const FilterModal = ({ alerts = [], onSelect, onClose }) => {
  const [step, setStep] = useState('type');
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

    setFilterType(item.value);
    setStep(item.value);
  };

  const handleFilterSelect = (item) => {
    const value = item.value == null ? null : item.value;
    onSelect(filterType, value);
    onClose();
  };

  const getStateOptionsWithCounts = () => {
    const counts = {};
    alerts.forEach((alert) => {
      const stateName = getStateName(alert.state);
      counts[stateName] = (counts[stateName] || 0) + 1;
    });

    return STATE_OPTIONS.map((opt) => {
      if (opt.value === null) {
        return { ...opt, label: `${opt.label} (${alerts.length})` };
      }
      const stateName = getStateName(opt.value);
      const count = counts[stateName] || 0;
      return { ...opt, label: `${opt.label} (${count})` };
    });
  };

  const getSeverityOptionsWithCounts = () => {
    const counts = {};
    alerts.forEach((alert) => {
      const severityName = getSeverityName(alert.severity);
      counts[severityName] = (counts[severityName] || 0) + 1;
    });

    return SEVERITY_OPTIONS.map((opt) => {
      if (opt.value === null) {
        return { ...opt, label: `${opt.label} (${alerts.length})` };
      }
      const severityName = getSeverityName(opt.value);
      const count = counts[severityName] || 0;
      return { ...opt, label: `${opt.label} (${count})` };
    });
  };

  const getAlertTypeOptionsWithCounts = () => {
    const counts = {};
    alerts.forEach((alert) => {
      const typeName = getAlertTypeName(alert.alertType);
      counts[typeName] = (counts[typeName] || 0) + 1;
    });

    return ALERT_TYPE_OPTIONS.map((opt) => {
      if (opt.value === null) {
        return { ...opt, label: `${opt.label} (${alerts.length})` };
      }
      const typeName = getAlertTypeName(opt.value);
      const count = counts[typeName] || 0;
      return { ...opt, label: `${opt.label} (${count})` };
    });
  };

  const getStatusOptionsWithCounts = () => {
    const counts = {};
    alerts.forEach((alert) => {
      const status = getComputedStatus(alert);
      if (status) {
        counts[status] = (counts[status] || 0) + 1;
      }
    });

    return STATUS_OPTIONS.map((opt) => {
      if (opt.value === null) {
        return { ...opt, label: `${opt.label} (${alerts.length})` };
      }
      const count = counts[opt.value] || 0;
      return { ...opt, label: `${opt.label} (${count})` };
    });
  };

  return (
    <Modal width={50} height={60}>
      <Panel title="🔍 Filter Alerts" borderColor="yellow">
        {step === 'type' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select filter type:</Text>
            <SelectInput items={FILTER_TYPES} onSelect={handleTypeSelect} />
          </Box>
        )}

        {step === 'status' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select status:</Text>
            <SelectInput
              items={getStatusOptionsWithCounts()}
              onSelect={handleFilterSelect}
            />
          </Box>
        )}

        {step === 'state' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select state:</Text>
            <SelectInput
              items={getStateOptionsWithCounts()}
              onSelect={handleFilterSelect}
            />
          </Box>
        )}

        {step === 'severity' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select severity:</Text>
            <SelectInput
              items={getSeverityOptionsWithCounts()}
              onSelect={handleFilterSelect}
            />
          </Box>
        )}

        {step === 'alertType' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select alert type:</Text>
            <SelectInput
              items={getAlertTypeOptionsWithCounts()}
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

        <Box marginTop={1}>
          <Text dimColor>Press ESC to cancel</Text>
        </Box>
      </Panel>
    </Modal>
  );
};

export default FilterModal;
