/**
 * ProjectSelectionWindow
 * Standalone window for selecting an Azure DevOps project with search and keyboard navigation
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
  getAllProjectCounts,
  setProjectCounts,
  calculateCountsFromAlerts,
} from '../../../shared/services/alertCountCache.js';

const BATCH_SIZE = 5;

/**
 * Full-screen project selection window with search and alert counts
 *
 * @param {Object} props
 * @param {Array} props.projects - List of projects to display
 * @param {Function} props.onSelect - Callback when a project is selected
 * @param {Function} props.onCancel - Callback when selection is cancelled
 * @param {Object} props.azdoService - Service for Azure DevOps operations
 * @param {Object} [props.selectedProject] - Currently selected project (for initial cursor positioning)
 * @returns {JSX.Element}
 */
export const RootSelectionWindow = React.memo(
  ({ projects, onSelect, onCancel, azdoService, selectedProject }) => {
    const { height } = useTerminalSize();
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    // Initialize cursor to current project index if available
    const initialCursor = useMemo(() => {
      if (!selectedProject?.id) return 0;
      const index = projects.findIndex((p) => p.id === selectedProject.id);
      return index >= 0 ? index : 0;
    }, []);
    const [cursor, setCursor] = useState(initialCursor);
    // Initialize with cached counts
    const [alertCounts, setAlertCounts] = useState(() => getAllProjectCounts());
    const [loadingProjects, setLoadingProjects] = useState(
      () => new Set(projects.map((p) => p.id))
    );
    const isMountedRef = useRef(true);
    const isInitialRenderRef = useRef(true);

    // Load alert counts in parallel batches
    useEffect(() => {
      isMountedRef.current = true;

      const loadCountsInBatches = async () => {
        const projectIds = projects.map((p) => p.id);

        for (let i = 0; i < projectIds.length; i += BATCH_SIZE) {
          if (!isMountedRef.current) break;

          const batch = projectIds.slice(i, i + BATCH_SIZE);
          const promises = batch.map(async (projectId) => {
            try {
              const alerts = await azdoService.listAlertsByProject(
                projectId,
                {}
              );
              const counts = calculateCountsFromAlerts(alerts);
              setProjectCounts(projectId, counts);
              return { projectId, counts };
            } catch {
              const counts = {
                open: 0,
                inProgress: 0,
                total: 0,
                timestamp: Date.now(),
              };
              return { projectId, counts };
            }
          });

          const results = await Promise.all(promises);

          if (isMountedRef.current) {
            setAlertCounts((prev) => {
              const updated = { ...prev };
              for (const { projectId, counts } of results) {
                updated[projectId] = counts;
              }
              return updated;
            });
            setLoadingProjects((prev) => {
              const updated = new Set(prev);
              for (const { projectId } of results) {
                updated.delete(projectId);
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
    }, [projects, azdoService]);

    // Debounce search text to avoid filtering on every keystroke
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchText(searchText);
      }, 200);

      return () => clearTimeout(timer);
    }, [searchText]);

    // Filter projects based on search text
    const filteredProjects = useMemo(() => {
      if (!debouncedSearchText) return projects;

      const search = debouncedSearchText.toLowerCase();
      return projects.filter(
        (project) =>
          project.name?.toLowerCase().includes(search) ||
          project.description?.toLowerCase().includes(search)
      );
    }, [projects, debouncedSearchText]);

    // Reset cursor when filtered list changes (skip initial render to preserve initial cursor)
    useEffect(() => {
      if (isInitialRenderRef.current) {
        isInitialRenderRef.current = false;
        return;
      }
      setCursor(0);
    }, [filteredProjects.length]);

    // Keyboard input handler
    useInput((input, key) => {
      if (key.escape) {
        onCancel();
        return;
      }

      if (key.return && filteredProjects[cursor]) {
        onSelect(filteredProjects[cursor]);
        return;
      }

      if (key.upArrow) {
        setCursor((prev) => Math.max(0, prev - 1));
        return;
      }

      if (key.downArrow) {
        setCursor((prev) => Math.min(filteredProjects.length - 1, prev + 1));
        return;
      }
    });

    const renderItem = useCallback(
      (project, isSelected) => {
        const counts = alertCounts[project.id];
        const isLoading = loadingProjects.has(project.id);

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
              {project.name}
            </Text>
            <Text dimColor> </Text>
            {countDisplay}
          </Box>
        );
      },
      [alertCounts, loadingProjects]
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
            Select Azure DevOps Project
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
              items={filteredProjects}
              cursor={cursor}
              renderItem={renderItem}
              visibleRows={visibleRows}
              emptyMessage="No projects found"
            />
          </Box>

          {/* Footer */}
          <Box marginTop={1}>
            <Text dimColor>
              {filteredProjects.length} of {projects.length} projects
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
RootSelectionWindow.displayName = 'RootSelectionWindow';
