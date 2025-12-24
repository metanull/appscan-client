import React, { useState } from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';

const SearchModal = () => {
  const searchText = useWebStore((state) => state.searchText);
  const [text, setText] = useState(searchText || '');

  const handleClose = () => {
    useWebStore.getState().setShowSearchModal(false);
  };

  const handleSearch = () => {
    useWebStore.getState().setSearchText(text || null);
    handleClose();
  };

  const handleClear = () => {
    setText('');
    useWebStore.getState().setSearchText(null);
  };

  return (
    <Modal title="Search Issues" onClose={handleClose} width="400px">
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Search:</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          autoFocus
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#252525',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
          }}
          placeholder="Search by issue type, location, status..."
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSearch}
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
          Search
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

export default SearchModal;
