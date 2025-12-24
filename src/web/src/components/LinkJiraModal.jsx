import React, { useState } from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';
import { apiClient } from '../api/client';

const LinkJiraModal = () => {
  const selectedIssue = useWebStore((state) => state.selectedIssue);
  const [jiraKey, setJiraKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    useWebStore.getState().setShowLinkJiraModal(false);
  };

  const handleLink = async () => {
    if (!selectedIssue || !jiraKey) return;

    try {
      setLoading(true);
      await apiClient.linkJiraIssue(selectedIssue.Id, jiraKey);
      window.location.reload();
    } catch (err) {
      useWebStore.getState().setError(err.message);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Modal title="Link Jira Issue" onClose={handleClose} width="400px">
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Jira Issue Key:
        </label>
        <input
          type="text"
          value={jiraKey}
          onChange={(e) => setJiraKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLink()}
          autoFocus
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#252525',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
          }}
          placeholder="e.g., SEC-123"
        />
      </div>

      <button
        onClick={handleLink}
        disabled={loading || !jiraKey}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !jiraKey ? 'not-allowed' : 'pointer',
          opacity: loading || !jiraKey ? 0.6 : 1,
        }}
      >
        {loading ? 'Linking...' : 'Link'}
      </button>
    </Modal>
  );
};

export default LinkJiraModal;
