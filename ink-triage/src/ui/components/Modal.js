/**
 * Modal wrapper component
 * Centralizes modal rendering, overlay, and keyboard handling
 */

import React, { useEffect } from 'react';
import { Box } from 'ink';
import { useKeyboardManager, KeyboardMode } from '../../utils/KeyboardManager.js';

/**
 * Modal component
 * Automatically manages keyboard mode when mounted/unmounted
 *
 * @param {ReactNode} children - Modal content
 * @param {Function} onClose - Close handler (optional)
 * @param {boolean} showOverlay - Show dark overlay behind modal (default: true)
 * @param {number} width - Modal width percentage (default: 80)
 * @param {number} height - Modal height percentage (default: 80)
 */
export const Modal = ({
  children,
  onClose: _onClose,
  showOverlay = true,
  width = 80,
  height = 80,
}) => {
  const { setKeyboardMode } = useKeyboardManager();

  // Set keyboard mode to MODAL when mounted
  useEffect(() => {
    setKeyboardMode(KeyboardMode.MODAL);

    return () => {
      // Restore normal mode when unmounted
      setKeyboardMode(KeyboardMode.NORMAL);
    };
  }, [setKeyboardMode]);

  return (
    <Box
      position="absolute"
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {/* Background overlay */}
      {showOverlay && <Box position="absolute" width="100%" height="100%" />}

      {/* Modal content */}
      <Box
        flexDirection="column"
        width={`${width}%`}
        maxHeight={`${height}%`}
        borderStyle="double"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Modal;
