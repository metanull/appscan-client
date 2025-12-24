import React, { useState } from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';
import { apiClient } from '../api/client';

const UnlinkJiraModal = () => {
  const selectedIssue = useWebStore((state) => state.selectedIssue);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    useWebStore.getState().setShowUnlinkJiraModal(false);
  };

  const handleUnlink = async () => {
    if (!selectedIssue) return;

    try {
      setLoading(true);
      await apiClient.unlinkJiraIssue(selectedIssue.Id);
      window.location.reload();
    } catch (err) {
      useWebStore.getState().setError(err.message);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Modal title="Unlink Jira Issue" onClose={handleClose} width="400px">
      <p style={{ marginBottom: '20px' }}>
        Are you sure you want to unlink Jira issue{' '}
        <strong>{selectedIssue?.ExternalId}</strong>?
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleUnlink}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Unlinking...' : 'Unlink'}
        </button>
        <button
          onClick={handleClose}
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
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default UnlinkJiraModal;
