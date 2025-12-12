/**
 * SearchModal Component
 * Modal for text search
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

export const SearchModal = ({ currentSearch, onSearch, onClose }) => {
  const [searchText, setSearchText] = useState(currentSearch || '');

  useInput((input, key) => {
    // Only intercept ESC when typing - remove 'b' key interception
    if (key.escape) {
      onClose();
    }
  });

  const handleSubmit = () => {
    onSearch(searchText || null);
    onClose();
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      width="50%"
      marginX="auto"
    >
      <Text bold color="cyan">🔍 Search</Text>

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
        {currentSearch && (
          <Text dimColor>Leave empty to clear search</Text>
        )}
      </Box>
    </Box>
  );
};

export default SearchModal;
