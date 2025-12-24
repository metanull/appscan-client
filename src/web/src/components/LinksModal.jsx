import React from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';

const LinksModal = () => {
  const selectedIssue = useWebStore((state) => state.selectedIssue);

  const handleClose = () => {
    useWebStore.getState().setShowLinksModal(false);
  };

  if (!selectedIssue) return null;

  const baseUrl = process.env.APPSCAN_BASE_URL || 'https://cloud.appscan.com';
  const issueUrl = `${baseUrl}/main/issues/${selectedIssue.Id}`;

  return (
    <Modal title="Links" onClose={handleClose} width="500px">
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          AppScan Issue:
        </div>
        <a
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#007acc', wordBreak: 'break-all' }}
        >
          {issueUrl}
        </a>
      </div>

      {selectedIssue.ExternalId && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Jira Issue:
          </div>
          <div style={{ color: '#4ec9b0' }}>{selectedIssue.ExternalId}</div>
        </div>
      )}

      {selectedIssue.Location && (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Location:
          </div>
          <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>
            {selectedIssue.Location}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LinksModal;
