/**
 * RepositorySelectionWindow
 * Standalone window for selecting an Azure DevOps repository with search and keyboard navigation
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { ScrollableList } from '../../../shared/components/ScrollableList.js';
import { useTerminalSize } from '../../../shared/hooks/useTerminalSize.js';
import {
  getAllRepositoryCounts,
  setRepositoryCounts,
  calculateCountsFromAlerts,
} from '../../../shared/services/alertCountCache.js';

const BATCH_SIZE = 5;

/**
 * Full-screen repository selection window with search and alert counts
 *
 * @param {Object} props
 * @param {Array} props.repositories - List of repositories to display
 * @param {Function} props.onSelect - Callback when a repository is selected
 * @param {Function} props.onCancel - Callback when selection is cancelled
 * @param {Object} props.azdoService - Service for Azure DevOps operations
 * @param {Object} props.selectedProject - Currently selected project
 * @param {Object} [props.selectedRepository] - Currently selected repository (for initial cursor positioning)
 * @returns {JSX.Element}
 */
export const FolderSelectionWindow = React.memo(
  ({
    repositories,
    onSelect,
    onCancel,
    azdoService,
    selectedProject,
    selectedRepository,
  }) => {
    const { height } = useTerminalSize();
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    // Initialize cursor to current repository index if available
    const initialCursor = useMemo(() => {
      if (!selectedRepository?.id) return 0;
      const index = repositories.findIndex(
        (r) => r.id === selectedRepository.id
      );
      return index >= 0 ? index : 0;
    }, []);
    const [cursor, setCursor] = useState(initialCursor);
    // Initialize with cached counts for this project
    const [alertCounts, setAlertCounts] = useState(() =>
      selectedProject?.id ? getAllRepositoryCounts(selectedProject.id) : {}
    );
    const [loadingRepos, setLoadingRepos] = useState(
      () => new Set(repositories.map((r) => r.id))
    );
    const isMountedRef = useRef(true);
    const isInitialRenderRef = useRef(true);

    // Load alert counts in parallel batches
    useEffect(() => {
      isMountedRef.current = true;

      const loadCountsInBatches = async () => {
        if (!selectedProject?.id) {
          setLoadingRepos(new Set());
          return;
        }

        const repoIds = repositories.map((r) => r.id);

        for (let i = 0; i < repoIds.length; i += BATCH_SIZE) {
          if (!isMountedRef.current) break;

          const batch = repoIds.slice(i, i + BATCH_SIZE);
          const promises = batch.map(async (repoId) => {
            try {
              const alerts = await azdoService.listAlerts(
                selectedProject.id,
                repoId,
                {}
              );
              const counts = calculateCountsFromAlerts(alerts);
              setRepositoryCounts(selectedProject.id, repoId, counts);
              return { repoId, counts };
            } catch {
              const counts = {
                open: 0,
                inProgress: 0,
                total: 0,
                timestamp: Date.now(),
              };
              return { repoId, counts };
            }
          });

          const results = await Promise.all(promises);

          if (isMountedRef.current) {
            setAlertCounts((prev) => {
              const updated = { ...prev };
              for (const { repoId, counts } of results) {
                updated[repoId] = counts;
              }
              return updated;
            });
            setLoadingRepos((prev) => {
              const updated = new Set(prev);
              for (const { repoId } of results) {
                updated.delete(repoId);
              }
              return updated;
            });
          }
        }
      };

      loadCountsInBatches();

      return () => {
        isMountedRef.current = false;
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

    // Reset cursor when filtered list changes (skip initial render to preserve initial cursor)
    useEffect(() => {
      if (isInitialRenderRef.current) {
        isInitialRenderRef.current = false;
        return;
      }
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
        const counts = alertCounts[repo.id];
        const isLoading = loadingRepos.has(repo.id);

        // Display format: (inProgress | open | total) - same as ASOC
        let countDisplay;
        if (!counts && isLoading) {
          countDisplay = <Text dimColor>...</Text>;
        } else if (counts) {
          countDisplay = (
            <>
              <Text dimColor>(</Text>
              <Text color={counts.inProgress > 0 ? 'green' : 'gray'}>
                {counts.inProgress}
              </Text>
              <Text dimColor> | </Text>
              <Text color={counts.open > 0 ? 'red' : 'gray'}>
                {counts.open}
              </Text>
              <Text dimColor> | </Text>
              <Text color="gray">{counts.total}</Text>
              <Text dimColor>)</Text>
            </>
          );
        } else {
          countDisplay = <Text dimColor>(0 | 0 | 0)</Text>;
        }

        return (
          <Box>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}
              {repo.name}
            </Text>
            <Text dimColor> </Text>
            {countDisplay}
          </Box>
        );
      },
      [alertCounts, loadingRepos]
    );

    const visibleRows = Math.max(5, height - 14);

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

          {/* Legend */}
          <Box marginBottom={1}>
            <Text dimColor>(</Text>
            <Text color="green">in-progress</Text>
            <Text dimColor> | </Text>
            <Text color="red">open</Text>
            <Text dimColor> | </Text>
            <Text color="gray">total</Text>
            <Text dimColor>)</Text>
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
