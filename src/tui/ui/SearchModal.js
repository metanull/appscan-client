import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Modal } from './components/Modal.js';
import { Panel } from './components/Panel.js';

/**
 * Modal for text-based search across vulnerability properties
 * Searches type, location, and API fields
 * @param {Object} props - Component props
 * @param {string} props.currentSearch - Current search text to pre-fill
 * @param {Function} props.onSearch - Callback with search text (or null to clear)
 * @param {Function} props.onClose - Callback when modal is closed
 * @returns {JSX.Element}
 */
export const SearchModal = React.memo(
  ({ currentSearch, onSearch, onClose }) => {
    const [searchText, setSearchText] = useState(currentSearch || '');

    useInput((input, key) => {
      if (key.escape) {
        onClose();
      }
    });

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
  }
);

SearchModal.displayName = 'SearchModal';

export default SearchModal;
