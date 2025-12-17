/**
 * React hook for keyboard shortcuts
 * Simplifies usage of the keyboard shortcut manager
 */

import { useEffect } from 'react';
import { useInput } from 'ink';
import { keyboardManager } from '../utils/keyboard-shortcuts.js';

/**
 * Hook to register and handle keyboard shortcuts for a view
 * @param {string} view - Current view name
 * @param {Array} shortcuts - Array of shortcut definitions
 * @param {Object} options - Options
 * @param {boolean} options.enabled - Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(view, shortcuts, options = {}) {
  const { enabled = true } = options;

  // Register shortcuts when component mounts or shortcuts change
  useEffect(() => {
    if (shortcuts && shortcuts.length > 0) {
      keyboardManager.register(view, shortcuts);
    }
  }, [view, shortcuts]);

  // Handle input
  useInput(
    (input, key) => {
      if (!enabled) return;
      keyboardManager.handleInput(view, input, key);
    },
    { isActive: enabled }
  );
}

/**
 * Hook to get help text for current view
 * @param {string} view - View name
 * @returns {string} Help text
 */
export function useKeyboardHelpText(view) {
  return keyboardManager.generateHelpText(view);
}

/**
 * Hook to get command bar hints for current view
 * @param {string} view - View name
 * @returns {string} Command bar hint text
 */
export function useCommandBarHints(view) {
  return keyboardManager.generateCommandBarHints(view);
}

/**
 * Hook to get grouped shortcuts for help modal
 * @param {string} view - View name
 * @returns {Object} Grouped shortcuts
 */
export function useGroupedShortcuts(view) {
  return keyboardManager.getGroupedShortcuts(view);
}
