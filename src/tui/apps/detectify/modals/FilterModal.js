/**
 * FilterModal for Detectify Vulnerabilities
 * Multi-step filter selection following AZDO FilterModal pattern
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Modal } from '../../../shared/components/Modal.js';
import { Panel } from '../../../shared/components/Panel.js';
import {
  VulnerabilityStatus,
  Severity,
  ScanSource,
} from '../../../../services/detectify-service.js';
import {
  getStatusName,
  getSeverityName,
  getScanSourceName,
  getEffectiveSeverity,
} from '../utils/vulnerability.js';

const FILTER_TYPES = [
  { label: 'Status Filter', value: 'status' },
  { label: 'Severity Filter', value: 'severity' },
  { label: 'Scan Source Filter', value: 'scanSource' },
  { label: 'Clear All Filters', value: 'clear' },
  { label: 'Cancel', value: 'cancel' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: null },
  { label: 'Active', value: VulnerabilityStatus.Active },
  { label: 'New', value: VulnerabilityStatus.New },
  { label: 'Patched', value: VulnerabilityStatus.Patched },
  { label: 'Regression', value: VulnerabilityStatus.Regression },
  { label: 'Accepted Risk', value: VulnerabilityStatus.AcceptedRisk },
  { label: 'False Positive', value: VulnerabilityStatus.FalsePositive },
];

const SEVERITY_OPTIONS = [
  { label: 'All Severities', value: null },
  { label: 'Critical', value: Severity.Critical },
  { label: 'High', value: Severity.High },
  { label: 'Medium', value: Severity.Medium },
  { label: 'Low', value: Severity.Low },
  { label: 'Information', value: Severity.Information },
];

const SCAN_SOURCE_OPTIONS = [
  { label: 'All Sources', value: null },
  { label: 'Asset Monitoring', value: ScanSource.AssetMonitoring },
  { label: 'Deep Scan', value: ScanSource.DeepScan },
  { label: 'Application Scanning', value: ScanSource.ApplicationScanning },
  { label: 'Surface Monitoring', value: ScanSource.SurfaceMonitoring },
  { label: 'API Scanning', value: ScanSource.ApiScanning },
];

/**
 * Modal for filtering Detectify vulnerability list by status, severity, and scan source
 * Provides multi-step interface for selecting filter type and specific values
 * @param {Object} props - Component props
 * @param {Array} props.vulnerabilities - Array of vulnerabilities for generating statistics
 * @param {Function} props.onSelect - Callback with filter type and value when filter is applied
 * @param {Function} props.onClear - Callback when filters are cleared
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const FilterModal = ({ vulnerabilities = [], onSelect, onClear, onClose }) => {
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

    if (item.value === 'clear') {
      onClear();
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

  const getStatusOptionsWithCounts = () => {
    const counts = {};
    vulnerabilities.forEach((vuln) => {
      const status = vuln.status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    });

    return STATUS_OPTIONS.map((opt) => {
      if (opt.value === null) {
        return { ...opt, label: `${opt.label} (${vulnerabilities.length})` };
      }
      const count = counts[opt.value] || 0;
      return { ...opt, label: `${getStatusName(opt.value)} (${count})` };
    });
  };

  const getSeverityOptionsWithCounts = () => {
    const counts = {};
    vulnerabilities.forEach((vuln) => {
      // Use effective severity (CVSS v3.1 if available)
      const severity = getEffectiveSeverity(vuln);
      counts[severity] = (counts[severity] || 0) + 1;
    });

    return SEVERITY_OPTIONS.map((opt) => {
      if (opt.value === null) {
        return { ...opt, label: `${opt.label} (${vulnerabilities.length})` };
      }
      const count = counts[opt.value] || 0;
      return { ...opt, label: `${getSeverityName(opt.value)} (${count})` };
    });
  };

  const getScanSourceOptionsWithCounts = () => {
    const counts = {};
    vulnerabilities.forEach((vuln) => {
      const source = vuln.scan_source || 'unknown';
      counts[source] = (counts[source] || 0) + 1;
    });

    return SCAN_SOURCE_OPTIONS.map((opt) => {
      if (opt.value === null) {
        return { ...opt, label: `${opt.label} (${vulnerabilities.length})` };
      }
      const count = counts[opt.value] || 0;
      return { ...opt, label: `${getScanSourceName(opt.value)} (${count})` };
    });
  };

  return (
    <Modal width={50} height={60}>
      <Panel title="🔍 Filter Vulnerabilities" borderColor="yellow">
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

        {step === 'severity' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select severity:</Text>
            <SelectInput
              items={getSeverityOptionsWithCounts()}
              onSelect={handleFilterSelect}
            />
          </Box>
        )}

        {step === 'scanSource' && (
          <Box flexDirection="column" marginTop={1}>
            <Text>Select scan source:</Text>
            <SelectInput
              items={getScanSourceOptionsWithCounts()}
              onSelect={handleFilterSelect}
            />
          </Box>
        )}

        <Box marginTop={2}>
          <Text dimColor>Esc to cancel</Text>
        </Box>
      </Panel>
    </Modal>
  );
};

FilterModal.displayName = 'FilterModal';

export default FilterModal;
