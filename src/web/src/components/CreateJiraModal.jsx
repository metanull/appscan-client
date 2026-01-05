import React, { useState } from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';
import { apiClient } from '../api/client';

const CreateJiraModal = () => {
  const selectedIssueIds = useWebStore((state) => state.selectedIssueIds);
  const issues = useWebStore((state) => state.issues);
  const [projectKey, setProjectKey] = useState(
    process.env.JIRA_PROJECT_KEY || ''
  );
  const [issueType, setIssueType] = useState('Bug');
  const [labels, setLabels] = useState('security');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    useWebStore.getState().setShowCreateJiraModal(false);
  };

  const handleCreate = async () => {
    if (selectedIssueIds.length === 0 || !projectKey) return;

    try {
      setLoading(true);
      const selectedIssues = issues.filter((i) =>
        selectedIssueIds.includes(i.Id)
      );
      const labelArray = labels
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      await apiClient.createJiraIssue(
        selectedIssues,
        projectKey,
        issueType,
        labelArray
      );

      useWebStore.getState().setError('Jira issues created successfully');
      window.location.reload();
    } catch (err) {
      useWebStore.getState().setError(err.message);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Modal
      title={`Create Jira Issue (${selectedIssueIds.length} issues)`}
      onClose={handleClose}
      width="400px"
    >
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Project Key:
        </label>
        <input
          type="text"
          value={projectKey}
          onChange={(e) => setProjectKey(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#252525',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
          }}
          placeholder="e.g., SEC"
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Issue Type:
        </label>
        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#252525',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
          }}
        >
          <option value="Bug">Bug</option>
          <option value="Task">Task</option>
          <option value="Story">Story</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Labels (comma-separated):
        </label>
        <input
          type="text"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#252525',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
          }}
          placeholder="security, critical"
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={loading || !projectKey}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !projectKey ? 'not-allowed' : 'pointer',
          opacity: loading || !projectKey ? 0.6 : 1,
        }}
      >
        {loading ? 'Creating...' : 'Create'}
      </button>
    </Modal>
  );
};

export default CreateJiraModal;
