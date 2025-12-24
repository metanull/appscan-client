import React from 'react';

const Modal = ({ title, onClose, children, width = '600px' }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width,
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: '#1e1e1e',
          border: '2px solid #007acc',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #3e3e3e',
            backgroundColor: '#252525',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#007acc' }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4d4d4',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 8px',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
