/**
 * SearchModal Component
 * Modal for text search
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { Modal } from './components/Modal.js';
import { Panel } from './components/Panel.js';

export const SearchModal = ({ currentSearch, onSearch, onClose }) => {
  const [searchText, setSearchText] = useState(currentSearch || '');

  const handleSubmit = () => {
    onSearch(searchText || null);
    onClose();
  };

  return (
    <Modal width={60} height={40}>
      <Panel title="🔍 Search" borderColor="cyan">
        <Box flexDirection="column" marginTop={1}>
          <Text>Enter search text (searches type, location, API):</Text>
          <Box marginTop={1}>
            <Text color="cyan">&gt; </Text>
            <TextInput
              value={searchText}
              onChange={setSearchText}
              onSubmit={handleSubmit}
              placeholder="Search..."
            />
          </Box>
        </Box>

        <Box marginTop={1}>
          <Text dimColor>Press Enter to search, ESC to cancel</Text>
          {currentSearch && <Text dimColor>Leave empty to clear search</Text>}
        </Box>
      </Panel>
    </Modal>
  );
};

export default SearchModal;
