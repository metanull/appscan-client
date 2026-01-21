/**
 * RepositorySelectionWindow
 * Standalone window for selecting an Azure DevOps repository with search and keyboard navigation
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { ScrollableList } from '../../../shared/components/ScrollableList.js';
import { useTerminalSize } from '../../../shared/hooks/useTerminalSize.js';

/**
 * Full-screen repository selection window with search and alert counts
 *
 * @param {Object} props
 * @param {Array} props.repositories - List of repositories to display
 * @param {Function} props.onSelect - Callback when a repository is selected
 * @param {Function} props.onCancel - Callback when selection is cancelled
 * @param {Object} props.azdoService - Service for Azure DevOps operations
 * @param {Object} props.selectedProject - Currently selected project
 * @returns {JSX.Element}
 */
export const FolderSelectionWindow = React.memo(
  ({ repositories, onSelect, onCancel, azdoService, selectedProject }) => {
    const { height } = useTerminalSize();
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [cursor, setCursor] = useState(0);
    const [alertCounts, setAlertCounts] = useState({});
    const [loadingCounts, setLoadingCounts] = useState(true);

    // Load alert counts for all repositories on mount
    useEffect(() => {
      let isMounted = true;

      const loadCounts = async () => {
        if (!selectedProject?.id) {
          setLoadingCounts(false);
          return;
        }

        const counts = {};
        for (const repo of repositories) {
          try {
            counts[repo.id] = await azdoService.getRepositoryAlertCount(
              selectedProject.id,
              repo.id
            );
          } catch {
            counts[repo.id] = 0;
          }
        }

        if (isMounted) {
          setAlertCounts(counts);
          setLoadingCounts(false);
        }
      };

      loadCounts();

      return () => {
        isMounted = false;
      };
    }, [repositories, azdoService, selectedProject]);

    // Debounce search text to avoid filtering on every keystroke
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchText(searchText);
      }, 200);

      return () => clearTimeout(timer);
    }, [searchText]);

    // Filter repositories based on search text
    const filteredRepositories = useMemo(() => {
      if (!debouncedSearchText) return repositories;

      const search = debouncedSearchText.toLowerCase();
      return repositories.filter(
        (repo) =>
          repo.name?.toLowerCase().includes(search) ||
          repo.description?.toLowerCase().includes(search)
      );
    }, [repositories, debouncedSearchText]);

    // Reset cursor when filtered list changes
    useEffect(() => {
      setCursor(0);
    }, [filteredRepositories.length]);

    // Keyboard input handler
    useInput((input, key) => {
      if (key.escape) {
        onCancel();
        return;
      }

      if (key.return && filteredRepositories[cursor]) {
        onSelect(filteredRepositories[cursor]);
        return;
      }

      if (key.upArrow) {
        setCursor((prev) => Math.max(0, prev - 1));
        return;
      }

      if (key.downArrow) {
        setCursor((prev) =>
          Math.min(filteredRepositories.length - 1, prev + 1)
        );
        return;
      }
    });

    const renderItem = useCallback(
      (repo, isSelected) => {
        const alertCount = alertCounts[repo.id];
        const countDisplay = loadingCounts ? '...' : alertCount || 0;

        return (
          <Box>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}
              {repo.name}
            </Text>
            <Text dimColor> (</Text>
            <Text color={alertCount > 0 ? 'red' : 'gray'}>{countDisplay}</Text>
            <Text dimColor> alerts)</Text>
          </Box>
        );
      },
      [alertCounts, loadingCounts]
    );

    const visibleRows = Math.max(5, height - 12);

    return (
      <Box flexDirection="column" padding={2}>
        <Box
          borderStyle="round"
          borderColor="cyan"
          flexDirection="column"
          padding={1}
        >
          <Text bold color="cyan">
            Select Repository
          </Text>

          {/* Search box */}
          <Box flexDirection="column" marginTop={1} marginBottom={1}>
            <Text dimColor>Search: </Text>
            <TextInput
              value={searchText}
              onChange={setSearchText}
              placeholder="Type to search..."
            />
          </Box>

          {/* List */}
          <Box marginTop={1}>
            <ScrollableList
              items={filteredRepositories}
              cursor={cursor}
              renderItem={renderItem}
              visibleRows={visibleRows}
              emptyMessage="No repositories found"
            />
          </Box>

          {/* Footer */}
          <Box marginTop={1}>
            <Text dimColor>
              {filteredRepositories.length} of {repositories.length}{' '}
              repositories
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>↑↓: Navigate | Enter: Select | ESC: Cancel</Text>
          </Box>
        </Box>
      </Box>
    );
  }
);
FolderSelectionWindow.displayName = 'FolderSelectionWindow';
