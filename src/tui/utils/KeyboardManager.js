/**
 * Centralized keyboard input manager using React Context
 * Prevents shortcuts from interfering with user input
 * Follows Ink best practices for input handling
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useInput } from 'ink';
import logger from '../../utils/logger.js';

// Keyboard modes
export const KeyboardMode = {
  NORMAL: 'normal', // App shortcuts active
  INPUT: 'input', // User typing in a field
  MODAL: 'modal', // Modal is open, modal handles input
  DISABLED: 'disabled', // Input completely disabled
};

const KeyboardContext = createContext(null);

/**
 * Keyboard Manager Provider - wraps the entire app to manage keyboard state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const KeyboardProvider = ({ children }) => {
  const [mode, setMode] = useState(KeyboardMode.NORMAL);
  const [activeInputId, setActiveInputId] = useState(null);
  const handlersRef = useRef(new Map());
  const throttleRef = useRef(new Map());

  /**
   * Register a keyboard handler
   * @param {string} id - Unique identifier for the handler
   * @param {Function} handler - Handler function (input, key) => void
   * @param {number} priority - Higher priority handlers execute first
   */
  const registerHandler = useCallback((id, handler, priority = 0) => {
    handlersRef.current.set(id, { handler, priority });
    logger.debug(`Keyboard handler registered: ${id}`, { priority });
  }, []);

  /**
   * Unregister a keyboard handler
   * @param {string} id - Unique identifier for the handler
   */
  const unregisterHandler = useCallback((id) => {
    handlersRef.current.delete(id);
    logger.debug(`Keyboard handler unregistered: ${id}`);
  }, []);

  /**
   * Set keyboard mode
   * @param {string} newMode - New keyboard mode from KeyboardMode enum
   * @param {string} [inputId] - Optional input identifier for INPUT mode
   */
  const setKeyboardMode = useCallback(
    (newMode, inputId = null) => {
      logger.debug(`Keyboard mode changed: ${mode} -> ${newMode}`, { inputId });
      setMode(newMode);
      setActiveInputId(inputId);
    },
    [mode]
  );

  /**
   * Throttle function to prevent rapid repeated actions
   * @param {string} key - Unique key for the throttle
   * @param {Function} callback - Function to execute
   * @param {number} [delay=100] - Minimum delay between executions in milliseconds
   * @returns {boolean} True if callback was executed, false if throttled
   */
  const throttle = useCallback((key, callback, delay = 100) => {
    const now = Date.now();
    const lastTime = throttleRef.current.get(key) || 0;

    if (now - lastTime >= delay) {
      throttleRef.current.set(key, now);
      callback();
      return true;
    }

    return false;
  }, []);

  /**
   * Main input handler - delegates to registered handlers based on mode
   */
  useInput(
    (input, key) => {
      try {
        if (mode === KeyboardMode.INPUT || mode === KeyboardMode.MODAL) {
          logger.debug('Input blocked - mode is INPUT or MODAL', { mode });
          return;
        }

        if (mode === KeyboardMode.DISABLED) {
          logger.debug('Input blocked - mode is DISABLED');
          return;
        }

        const handlers = Array.from(handlersRef.current.entries()).sort(
          ([, a], [, b]) => b.priority - a.priority
        );

        for (const [id, { handler }] of handlers) {
          try {
            const shouldStopPropagation = handler(input, key);
            if (shouldStopPropagation === true) {
              logger.debug(`Input consumed by handler: ${id}`);
              break;
            }
          } catch (err) {
            logger.error(`Error in keyboard handler: ${id}`, err);
          }
        }
      } catch (err) {
        logger.error('Error in keyboard manager', err);
      }
    },
    {
      isActive: mode !== KeyboardMode.DISABLED,
    }
  );

  const value = {
    mode,
    activeInputId,
    setKeyboardMode,
    registerHandler,
    unregisterHandler,
    throttle,
  };

  return (
    <KeyboardContext.Provider value={value}>
      {children}
    </KeyboardContext.Provider>
  );
};

/**
 * Hook to access keyboard manager context
 * @returns {{mode: string, activeInputId: string, setKeyboardMode: Function, registerHandler: Function, unregisterHandler: Function, throttle: Function}} Keyboard manager context
 * @throws {Error} If used outside KeyboardProvider
 */
export const useKeyboardManager = () => {
  const context = useContext(KeyboardContext);

  if (!context) {
    throw new Error('useKeyboardManager must be used within KeyboardProvider');
  }

  return context;
};

/**
 * Hook to register keyboard shortcuts that automatically unregister on unmount
 * @param {Function} handler - Handler function (input, key) => boolean
 * @param {Object} [options] - Configuration options
 * @param {number} options.priority - Handler priority (default: 0)
 * @param {boolean} options.enabled - Whether handler is enabled (default: true)
 * @param {Array} options.deps - Dependencies array for handler
 */
export const useKeyboardShortcuts = (handler, options = {}) => {
  const { priority = 0, enabled = true, deps = [] } = options;

  const { registerHandler, unregisterHandler } = useKeyboardManager();
  const idRef = useRef(`handler_${Math.random().toString(36).substr(2, 9)}`);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const id = idRef.current;
    registerHandler(id, handler, priority);

    return () => {
      unregisterHandler(id);
    };
  }, [enabled, priority, registerHandler, unregisterHandler, ...deps]);
};

/**
 * Hook for input fields
 * Automatically sets keyboard mode to INPUT when focused
 *
 * @param {string} inputId - Unique identifier for this input
 */
export const useInputMode = (inputId) => {
  const { setKeyboardMode } = useKeyboardManager();

  const onFocus = useCallback(() => {
    setKeyboardMode(KeyboardMode.INPUT, inputId);
  }, [inputId, setKeyboardMode]);

  const onBlur = useCallback(() => {
    setKeyboardMode(KeyboardMode.NORMAL);
  }, [setKeyboardMode]);

  return { onFocus, onBlur };
};

export default KeyboardProvider;
