/**
 * ProjectSelectionWindow
 * Standalone window for selecting an Azure DevOps project with search and keyboard navigation
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { ScrollableList } from '../../../shared/components/ScrollableList.js';
import { useTerminalSize } from '../../../shared/hooks/useTerminalSize.js';

/**
 * Full-screen project selection window with search and alert counts
 *
 * @param {Object} props
 * @param {Array} props.projects - List of projects to display
 * @param {Function} props.onSelect - Callback when a project is selected
 * @param {Function} props.onCancel - Callback when selection is cancelled
 * @param {Object} props.azdoService - Service for Azure DevOps operations
 * @returns {JSX.Element}
 */
export const RootSelectionWindow = React.memo(
  ({ projects, onSelect, onCancel, azdoService }) => {
    const { height } = useTerminalSize();
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [cursor, setCursor] = useState(0);
    const [alertCounts, setAlertCounts] = useState({});
    const [loadingCounts, setLoadingCounts] = useState(true);

    // Load alert counts for all projects on mount
    useEffect(() => {
      let isMounted = true;

      const loadCounts = async () => {
        const counts = {};
        for (const project of projects) {
          try {
            counts[project.id] = await azdoService.getProjectAlertCount(
              project.id
            );
          } catch {
            counts[project.id] = 0;
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

    // Reset cursor when filtered list changes
    useEffect(() => {
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
        const alertCount = alertCounts[project.id];
        const countDisplay = loadingCounts ? '...' : alertCount || 0;

        return (
          <Box>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}
              {project.name}
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
