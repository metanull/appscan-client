/**
 * Centralized Keyboard Shortcut Management
 * Provides a clean API for defining shortcuts and auto-generating help text
 */

import logger from '../../utils/logger.js';

/**
 * Keyboard shortcut definition
 * @typedef {Object} KeyBinding
 * @property {string} key - The key or key combination (e.g., 'a', 'ctrl+a', 'alt+a', 'escape', 'space')
 * @property {Function} action - The action to execute
 * @property {string} description - Human-readable description
 * @property {Function} [condition] - Optional condition function that must return true for action to execute
 * @property {string} [group] - Optional group for organizing help text (e.g., 'Navigation', 'Selection', 'Actions')
 */

/**
 * Parse key string into key definition
 * @param {string} keyString - Key string like 'ctrl+a', 'alt+shift+x', 'escape'
 * @returns {Object} Key definition for matching
 */
export function parseKeyString(keyString) {
  const parts = keyString.toLowerCase().split('+');
  const def = {
    ctrl: false,
    alt: false,
    shift: false,
    input: null,
    specialKey: null,
  };

  for (const part of parts) {
    if (part === 'ctrl' || part === 'control') def.ctrl = true;
    else if (part === 'alt' || part === 'meta') def.alt = true;
    else if (part === 'shift') def.shift = true;
    // Special keys
    else if (part === 'escape' || part === 'esc') def.specialKey = 'escape';
    else if (part === 'return' || part === 'enter') def.specialKey = 'return';
    else if (part === 'backspace') def.specialKey = 'backspace';
    else if (part === 'delete' || part === 'del') def.specialKey = 'delete';
    else if (part === 'tab') def.specialKey = 'tab';
    else if (part === 'space') def.input = ' ';
    // Arrow keys
    else if (part === 'uparrow' || part === 'up') def.specialKey = 'upArrow';
    else if (part === 'downarrow' || part === 'down')
      def.specialKey = 'downArrow';
    else if (part === 'leftarrow' || part === 'left')
      def.specialKey = 'leftArrow';
    else if (part === 'rightarrow' || part === 'right')
      def.specialKey = 'rightArrow';
    // Page keys
    else if (part === 'pageup' || part === 'pgup') def.specialKey = 'pageUp';
    else if (part === 'pagedown' || part === 'pgdown')
      def.specialKey = 'pageDown';
    else if (part === 'home') def.specialKey = 'home';
    else if (part === 'end') def.specialKey = 'end';
    // Function keys
    else if (/^f([1-9]|1[0-2])$/.test(part))
      def.specialKey = part; // f1-f12
    // Regular input
    else {
      def.input = part;
    }
  }

  return def;
}

/**
 * Check if key matches definition
 * @param {Object} keyDef - Parsed key definition
 * @param {string} input - Input from useInput
 * @param {Object} key - Key object from useInput
 * @returns {boolean} True if matches
 */
export function matchesKey(keyDef, input, key) {
  // Check modifiers - must match exactly
  if (keyDef.ctrl !== !!key.ctrl) return false;
  if (keyDef.alt !== !!key.meta) return false;
  // Note: We're more lenient with shift as it can be implicit for some chars like '?'

  // Check special keys
  if (keyDef.specialKey) {
    // Direct property check for most keys
    if (key[keyDef.specialKey]) return true;

    // Handle escape (sometimes reported as 'escape' property)
    if (keyDef.specialKey === 'escape' && (key.escape || input === '\u001b'))
      return true;

    // Handle delete key (can be reported as delete or input char 127)
    if (keyDef.specialKey === 'delete' && (key.delete || input === '\u007f'))
      return true;

    // Handle backspace (can be reported as backspace property)
    if (keyDef.specialKey === 'backspace' && key.backspace) return true;

    // Handle function keys f1-f12
    if (/^f([1-9]|1[0-2])$/.test(keyDef.specialKey)) {
      // Ink reports function keys in the key object
      return key[keyDef.specialKey] === true;
    }

    return false;
  }

  // Check regular input
  if (keyDef.input !== null) {
    // Direct match
    if (input === keyDef.input) return true;

    return false;
  }

  return false;
}

/**
 * Format key string for display in help
 * @param {string} keyString - Key string like 'ctrl+a'
 * @returns {string} Formatted string like 'CTRL+a'
 */
export function formatKeyForDisplay(keyString) {
  return keyString
    .split('+')
    .map((part) => {
      const lower = part.toLowerCase();
      // Modifiers
      if (lower === 'ctrl' || lower === 'control') return 'CTRL';
      if (lower === 'alt' || lower === 'meta') return 'ALT';
      if (lower === 'shift') return 'SHIFT';
      // Special keys
      if (lower === 'escape' || lower === 'esc') return 'ESC';
      if (lower === 'return' || lower === 'enter') return 'Enter';
      if (lower === 'space') return 'Space';
      if (lower === 'backspace') return 'Backspace';
      if (lower === 'delete' || lower === 'del') return 'Del';
      if (lower === 'tab') return 'Tab';
      // Arrow keys
      if (lower === 'uparrow' || lower === 'up') return '↑';
      if (lower === 'downarrow' || lower === 'down') return '↓';
      if (lower === 'leftarrow' || lower === 'left') return '←';
      if (lower === 'rightarrow' || lower === 'right') return '→';
      // Page keys
      if (lower === 'pageup' || lower === 'pgup') return 'PgUp';
      if (lower === 'pagedown' || lower === 'pgdown') return 'PgDn';
      if (lower === 'home') return 'Home';
      if (lower === 'end') return 'End';
      // Function keys
      if (/^f([1-9]|1[0-2])$/.test(lower)) return part.toUpperCase();
      // Regular keys
      return part;
    })
    .join('+');
}

/**
 * Keyboard Shortcut Manager
 */
export class KeyboardShortcutManager {
  constructor() {
    this.shortcuts = new Map(); // view -> KeyBinding[]
  }

  /**
   * Register shortcuts for a view
   * @param {string} view - View name (e.g., 'issue-list', 'app-selection')
   * @param {KeyBinding[]} bindings - Array of key bindings
   */
  register(view, bindings) {
    this.shortcuts.set(view, bindings);
  }

  /**
   * Get shortcuts for a view
   * @param {string} view - View name
   * @returns {KeyBinding[]} Array of key bindings
   */
  getShortcuts(view) {
    return this.shortcuts.get(view) || [];
  }

  /**
   * Handle key input for a view
   * @param {string} view - Current view
   * @param {string} input - Input from useInput
   * @param {Object} key - Key object from useInput
   * @returns {boolean} True if a shortcut was executed
   */
  handleInput(view, input, key) {
    const bindings = this.getShortcuts(view);

    // Debug: log all keyboard input when special keys or modifiers are pressed
    // This helps debug why shortcuts aren't being triggered
    if (key.ctrl || key.meta || key.specialKey || input === undefined) {
      const inputStr = input ? `"${input}"` : '[undefined]';
      logger.debug(
        `Keyboard input: input=${inputStr} key=${JSON.stringify(key)}`
      );
    }

    for (const binding of bindings) {
      const keyDef = parseKeyString(binding.key);

      if (matchesKey(keyDef, input, key)) {
        // Check condition if provided
        if (binding.condition && !binding.condition()) {
          continue;
        }

        // Execute action
        binding.action();
        return true;
      }
    }

    return false;
  }

  /**
   * Generate help text for a view
   * @param {string} view - View name
   * @returns {string} Help text
   */
  generateHelpText(view) {
    const bindings = this.getShortcuts(view);
    return bindings
      .map((b) => `${formatKeyForDisplay(b.key)}: ${b.description}`)
      .join(' | ');
  }

  /**
   * Generate command bar hint text for a view
   * @param {string} view - View name
   * @returns {string} Command bar hint text
   */
  generateCommandBarHints(view) {
    const bindings = this.getShortcuts(view);

    // Prioritize important shortcuts for command bar (space is limited)
    const priority = [
      'uparrow',
      'downarrow',
      'space',
      'enter',
      'ctrl+a',
      'alt+a',
      'escape',
      'q',
      '?',
      'h',
    ];

    const sorted = bindings.sort((a, b) => {
      const aIndex = priority.indexOf(a.key.toLowerCase());
      const bIndex = priority.indexOf(b.key.toLowerCase());
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return sorted
      .map((b) => {
        const key = formatKeyForDisplay(b.key);
        const desc = b.description;
        return `${key} ${desc}`;
      })
      .join(' | ');
  }

  /**
   * Get shortcuts grouped by category
   * @param {string} view - View name
   * @returns {Object} Grouped shortcuts { groupName: KeyBinding[] }
   */
  getGroupedShortcuts(view) {
    const bindings = this.getShortcuts(view);
    const grouped = {};

    for (const binding of bindings) {
      const group = binding.group || 'General';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(binding);
    }

    return grouped;
  }
}

// Global instance
export const keyboardManager = new KeyboardShortcutManager();
