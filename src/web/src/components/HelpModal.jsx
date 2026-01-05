import React from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';

const HelpModal = () => {
  const handleClose = () => {
    useWebStore.getState().setShowHelpModal(false);
  };

  return (
    <Modal title="Keyboard Shortcuts" onClose={handleClose} width="500px">
      <div style={{ lineHeight: '2' }}>
        <div>
          <strong>[a]</strong> - Change application
        </div>
        <div>
          <strong>[s]</strong> - Change scan
        </div>
        <div>
          <strong>[f]</strong> - Filter issues
        </div>
        <div>
          <strong>[/]</strong> - Search issues
        </div>
        <div>
          <strong>[l]</strong> - Show links
        </div>
        <div>
          <strong>[u]</strong> - Update status
        </div>
        <div>
          <strong>[j]</strong> - Create Jira issue
        </div>
        <div>
          <strong>[c]</strong> - Toggle context pane
        </div>
        <div>
          <strong>[r]</strong> - Refresh
        </div>
        <div>
          <strong>[h] or [?]</strong> - Show help
        </div>
        <div>
          <strong>[q]</strong> - Quit
        </div>
        <div>
          <strong>[Escape]</strong> - Go back
        </div>
        <div>
          <strong>[Space]</strong> - Toggle selection
        </div>
        <div>
          <strong>[Enter]</strong> - View details
        </div>
      </div>
    </Modal>
  );
};

export default HelpModal;
