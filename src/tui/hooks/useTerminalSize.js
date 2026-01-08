/**
 * Hook to get terminal size
 * Returns width and height, updates on resize
 */

import { useStdout } from 'ink';
import { useEffect, useState } from 'react';

export function useTerminalSize() {
  const { stdout } = useStdout();
  const [size, setSize] = useState({
    width: Math.max(120, stdout?.columns || 80),
    height: Math.max(20, stdout?.rows || 24),
  });

  useEffect(() => {
    if (!stdout) return;

    const updateSize = () => {
      setSize({
        width: Math.max(120, stdout.columns || 80),
        height: Math.max(20, stdout.rows || 24),
      });
    };

    // Listen for resize events
    stdout.on('resize', updateSize);

    // Update immediately in case size changed
    updateSize();

    return () => {
      stdout.off('resize', updateSize);
    };
  }, [stdout]);

  return size;
}
