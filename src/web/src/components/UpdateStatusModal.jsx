import React, { useState } from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';
import { apiClient } from '../api/client';

const UpdateStatusModal = () => {
  const selectedIssueIds = useWebStore((state) => state.selectedIssueIds);
  const [status, setStatus] = useState('Open');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    useWebStore.getState().setShowUpdateStatusModal(false);
  };

  const handleUpdate = async () => {
    if (selectedIssueIds.length === 0) return;

    try {
      setLoading(true);
      await apiClient.bulkUpdateIssueStatus(
        selectedIssueIds,
        status,
        comment || null
      );

      // Refresh issues
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
      title={`Update Status (${selectedIssueIds.length} issues)`}
      onClose={handleClose}
      width="400px"
    >
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
          <option value="Open">Open</option>
          <option value="InProgress">InProgress</option>
          <option value="Reopened">Reopened</option>
          <option value="Noise">Noise</option>
          <option value="Passed">Passed</option>
          <option value="Fixed">Fixed</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Comment (optional):
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#252525',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
            resize: 'vertical',
          }}
          placeholder="Enter a comment..."
        />
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Updating...' : 'Update'}
      </button>
    </Modal>
  );
};

export default UpdateStatusModal;
