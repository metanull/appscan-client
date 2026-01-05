import React, { useState } from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';

const FilterModal = () => {
  const filterStatus = useWebStore((state) => state.filterStatus);
  const filterSeverity = useWebStore((state) => state.filterSeverity);
  const filterJira = useWebStore((state) => state.filterJira);

  const [status, setStatus] = useState(filterStatus || '');
  const [severity, setSeverity] = useState(filterSeverity || '');
  const [jira, setJira] = useState(filterJira || '');

  const handleClose = () => {
    useWebStore.getState().setShowFilterModal(false);
  };

  const handleApply = () => {
    useWebStore.getState().setFilterStatus(status || null);
    useWebStore.getState().setFilterSeverity(severity || null);
    useWebStore.getState().setFilterJira(jira || null);
    handleClose();
  };

  const handleClear = () => {
    setStatus('');
    setSeverity('');
    setJira('');
    useWebStore.getState().clearFilters();
  };

  return (
    <Modal title="Filter Issues" onClose={handleClose} width="400px">
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#252525',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
          }}
        >
          <option value="">All</option>
          <option value="Open">Open</option>
          <option value="InProgress">InProgress</option>
          <option value="Reopened">Reopened</option>
          <option value="Noise">Noise</option>
          <option value="Passed">Passed</option>
          <option value="Fixed">Fixed</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Severity:
        </label>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#252525',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
          }}
        >
          <option value="">All</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Informational">Informational</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Jira:</label>
        <select
          value={jira}
          onChange={(e) => setJira(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#252525',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
          }}
        >
          <option value="">All</option>
          <option value="with">With Jira</option>
          <option value="without">Without Jira</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleApply}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#3e3e3e',
            color: '#d4d4d4',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>
    </Modal>
  );
};

export default FilterModal;
