/**
 * Minimal Test Case - Text Input Lag Investigation
 * 
 * This standalone test isolates TextInput to determine if lag is from:
 * 1. ink-text-input component itself
 * 2. Modal/Panel wrapper overhead
 * 3. Other UI components being re-rendered
 * 4. Terminal rendering performance
 * 
 * Run with: node lab/test-text-input-lag.js
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput, useStdout } from 'ink';
import TextInput from 'ink-text-input';

// Hook to get terminal size (copied from src/tui/hooks/useTerminalSize.js)
const useTerminalSize = () => {
  const { stdout } = useStdout();
  const [size, setSize] = useState({
    width: stdout?.columns || 80,
    height: stdout?.rows || 24,
  });

  useEffect(() => {
    if (!stdout) return;

    const updateSize = () => {
      setSize({
        width: stdout.columns || 80,
        height: stdout.rows || 24,
      });
    };

    stdout.on('resize', updateSize);
    updateSize();

    return () => {
      stdout.off('resize', updateSize);
    };
  }, [stdout]);

  return size;
};

// Test 1: Minimal TextInput (no wrappers)
const MinimalTest = () => {
  const { exit } = useApp();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { bold: true, color: 'cyan' }, 'Test 1: Minimal TextInput (no Modal/Panel)'),
    React.createElement(Text, { dimColor: true }, 'Type rapidly and observe lag. Press Enter when done, ESC to quit.'),
    React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, { color: 'cyan' }, '> '),
      React.createElement(TextInput, {
        value: value,
        onChange: setValue,
        onSubmit: handleSubmit,
        placeholder: 'Type here...'
      })
    ),
    React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, { dimColor: true }, `Characters: ${value.length}`)
    )
  );
};

// Test 2: TextInput with Box nesting (similar to Modal structure)
const NestedBoxTest = () => {
  const { exit } = useApp();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { bold: true, color: 'cyan' }, 'Test 2: TextInput with nested Boxes (simulating Modal/Panel)'),
    React.createElement(Text, { dimColor: true }, 'Type rapidly and compare lag to Test 1. ESC to quit.'),
    React.createElement(Box, { marginTop: 1, borderStyle: 'double', borderColor: 'cyan', padding: 2 },
      React.createElement(Box, { flexDirection: 'column', borderStyle: 'round', borderColor: 'green', padding: 1 },
        React.createElement(Text, { bold: true }, 'Nested Panel'),
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { color: 'cyan' }, '> '),
          React.createElement(TextInput, {
            value: value,
            onChange: setValue,
            onSubmit: handleSubmit,
            placeholder: 'Type here...'
          })
        ),
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { dimColor: true }, `Characters: ${value.length}`)
        )
      )
    )
  );
};

// Test 3: TextInput with other updating components
const MultiComponentTest = () => {
  const { exit } = useApp();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  // Multiple components that update on every keystroke
  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { bold: true, color: 'cyan' }, 'Test 3: TextInput with multiple updating components'),
    React.createElement(Text, { dimColor: true }, 'Other components update on keystroke. Observe lag difference. ESC to quit.'),
    
    // Top panel - updates on every keystroke
    React.createElement(Box, { marginTop: 1, borderStyle: 'single', borderColor: 'yellow', padding: 1 },
      React.createElement(Box, { flexDirection: 'column' },
        React.createElement(Text, null, 'Character count: ', React.createElement(Text, { bold: true, color: 'yellow' }, value.length)),
        React.createElement(Text, null, 'Last 3 chars: ', React.createElement(Text, { color: 'cyan' }, value.slice(-3) || 'none')),
        React.createElement(Text, null, 'Uppercase: ', React.createElement(Text, null, value.toUpperCase()))
      )
    ),

    // Input panel
    React.createElement(Box, { marginTop: 1, borderStyle: 'double', borderColor: 'green', padding: 1 },
      React.createElement(Box, { flexDirection: 'column' },
        React.createElement(Text, { bold: true }, 'Input:'),
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { color: 'cyan' }, '> '),
          React.createElement(TextInput, {
            value: value,
            onChange: setValue,
            onSubmit: handleSubmit,
            placeholder: 'Type here...'
          })
        )
      )
    ),

    // Bottom panel - also updates on every keystroke
    React.createElement(Box, { marginTop: 1, borderStyle: 'single', borderColor: 'magenta', padding: 1 },
      React.createElement(Box, { flexDirection: 'column' },
        React.createElement(Text, null, 'Words: ', React.createElement(Text, { bold: true }, value.split(' ').filter(w => w).length)),
        React.createElement(Text, null, 'Has uppercase: ', React.createElement(Text, null, /[A-Z]/.test(value) ? 'Yes' : 'No')),
        React.createElement(Text, null, 'Has numbers: ', React.createElement(Text, null, /[0-9]/.test(value) ? 'Yes' : 'No'))
      )
    )
  );
};

// Test 4: Full screen with multiple components
const FullScreenTest = () => {
  const { exit } = useApp();
  const { width: columns, height: rows } = useTerminalSize();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  return React.createElement(Box, { flexDirection: 'column', width: columns, height: rows },
    // Header
    React.createElement(Box, { borderStyle: 'single', paddingX: 1, flexShrink: 0 },
      React.createElement(Text, { bold: true, color: 'cyan' }, `Test 4: FULL SCREEN (${columns}x${rows}) with Multiple Components`)
    ),
    
    // Main content - takes all available space
    React.createElement(Box, { flexDirection: 'column', flexGrow: 1, padding: 1 },
      React.createElement(Text, { dimColor: true }, 'Type rapidly in FULL SCREEN layout. ESC to quit.'),
      
      // Spacer
      React.createElement(Box, { flexGrow: 1 }),
      
      // Top panel
      React.createElement(Box, { borderStyle: 'single', borderColor: 'yellow', padding: 1, flexShrink: 0 },
        React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, null, 'Character count: ', React.createElement(Text, { bold: true, color: 'yellow' }, value.length)),
          React.createElement(Text, null, 'Last 3 chars: ', React.createElement(Text, { color: 'cyan' }, value.slice(-3) || 'none')),
          React.createElement(Text, null, 'Uppercase: ', React.createElement(Text, null, value.toUpperCase()))
        )
      ),

      // Input panel
      React.createElement(Box, { marginTop: 1, borderStyle: 'double', borderColor: 'green', padding: 1, flexShrink: 0 },
        React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, { bold: true }, 'Input:'),
          React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: 'cyan' }, '> '),
            React.createElement(TextInput, {
              value: value,
              onChange: setValue,
              onSubmit: handleSubmit,
              placeholder: 'Type here...'
            })
          )
        )
      ),

      // Bottom panel
      React.createElement(Box, { marginTop: 1, borderStyle: 'single', borderColor: 'magenta', padding: 1, flexShrink: 0 },
        React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, null, 'Words: ', React.createElement(Text, { bold: true }, value.split(' ').filter(w => w).length)),
          React.createElement(Text, null, 'Has uppercase: ', React.createElement(Text, null, /[A-Z]/.test(value) ? 'Yes' : 'No')),
          React.createElement(Text, null, 'Has numbers: ', React.createElement(Text, null, /[0-9]/.test(value) ? 'Yes' : 'No'))
        )
      ),
      
      // Spacer
      React.createElement(Box, { flexGrow: 1 })
    ),
    
    // Footer
    React.createElement(Box, { borderStyle: 'single', paddingX: 1, flexShrink: 0 },
      React.createElement(Text, { dimColor: true }, 'Press ESC to exit | Press Enter to submit')
    )
  );
};

// Test 5: Overlay modal with background content
const OverlayModalTest = () => {
  const { exit } = useApp();
  const { width: columns, height: rows } = useTerminalSize();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  return React.createElement(Box, { width: columns, height: rows },
    // Background content (full screen - simulating main app)
    React.createElement(Box, { flexDirection: 'column', width: columns, height: rows },
      React.createElement(Box, { borderStyle: 'single', paddingX: 1, flexShrink: 0 },
        React.createElement(Text, { bold: true }, `Test 5: FULL SCREEN (${columns}x${rows}) - Background App`)
      ),
      React.createElement(Box, { flexDirection: 'column', flexGrow: 1, padding: 1 },
        React.createElement(Text, null, 'This is background content'),
        React.createElement(Text, { dimColor: true }, 'Simulating a list of items that would normally be here...'),
        React.createElement(Box, { marginTop: 1, borderStyle: 'single', padding: 1 },
          React.createElement(Text, null, '▶ Item 1 - Some vulnerability'),
          React.createElement(Text, null, '  Item 2 - Another issue'),
          React.createElement(Text, null, '  Item 3 - More content'),
          React.createElement(Text, null, '  Item 4 - Even more items'),
          React.createElement(Text, null, '  Item 5 - Background stuff')
        )
      ),
      React.createElement(Box, { borderStyle: 'single', paddingX: 1, flexShrink: 0 },
        React.createElement(Text, { dimColor: true }, 'Background Footer')
      )
    ),
    
    // Overlay modal (absolute positioning - covers entire screen)
    React.createElement(Box, { 
      position: 'absolute', 
      width: columns,
      height: rows,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
      // Dark background overlay
      React.createElement(Box, { 
        position: 'absolute',
        width: columns,
        height: rows,
        backgroundColor: 'black'
      },
        React.createElement(Box, { width: columns, height: rows })
      ),
      
      // Modal content (centered, 80% width, auto height)
      React.createElement(Box, { 
        flexDirection: 'column',
        width: Math.floor(columns * 0.8),
        borderStyle: 'double',
        borderColor: 'cyan',
        paddingX: 2,
        paddingY: 1,
        backgroundColor: 'black'
      },
        React.createElement(Text, { bold: true, color: 'cyan' }, '📝 Modal: Add Comment (Overlay on Full Screen)'),
        React.createElement(Text, { dimColor: true, marginTop: 1 }, 'Type in this modal overlay. Observe lag. ESC to quit.'),
        
        // Top info panel
        React.createElement(Box, { marginTop: 1, borderStyle: 'single', borderColor: 'yellow', padding: 1 },
          React.createElement(Box, { flexDirection: 'column' },
            React.createElement(Text, null, 'Character count: ', React.createElement(Text, { bold: true, color: 'yellow' }, value.length)),
            React.createElement(Text, null, 'Last 3 chars: ', React.createElement(Text, { color: 'cyan' }, value.slice(-3) || 'none'))
          )
        ),

        // Input section
        React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
          React.createElement(Text, null, 'Add comment (optional, press Enter to submit):'),
          React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: 'cyan' }, '> '),
            React.createElement(TextInput, {
              value: value,
              onChange: setValue,
              onSubmit: handleSubmit,
              placeholder: 'Enter comment...'
            })
          )
        ),

        // Bottom info panel
        React.createElement(Box, { marginTop: 1, borderStyle: 'single', borderColor: 'magenta', padding: 1 },
          React.createElement(Box, { flexDirection: 'column' },
            React.createElement(Text, null, 'Words: ', React.createElement(Text, { bold: true }, value.split(' ').filter(w => w).length)),
            React.createElement(Text, null, 'Has uppercase: ', React.createElement(Text, null, /[A-Z]/.test(value) ? 'Yes' : 'No'))
          )
        ),
        
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { dimColor: true }, 'Press ESC to cancel')
        )
      )
    )
  );
};

// Test 6: Modal WITHOUT dark background overlay
const ModalNoDarkOverlayTest = () => {
  const { exit } = useApp();
  const { width: columns, height: rows } = useTerminalSize();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  return React.createElement(Box, { width: columns, height: rows },
    // Background content
    React.createElement(Box, { flexDirection: 'column', width: columns, height: rows },
      React.createElement(Box, { borderStyle: 'single', paddingX: 1, flexShrink: 0 },
        React.createElement(Text, { bold: true }, 'Test 6: Modal WITHOUT Dark Overlay - Background')
      ),
      React.createElement(Box, { flexDirection: 'column', flexGrow: 1, padding: 1 },
        React.createElement(Text, null, 'Background content'),
        React.createElement(Box, { marginTop: 1, borderStyle: 'single', padding: 1 },
          React.createElement(Text, null, '▶ Item 1'),
          React.createElement(Text, null, '  Item 2')
        )
      )
    ),
    
    // Modal overlay WITHOUT dark background
    React.createElement(Box, { 
      position: 'absolute', 
      width: columns,
      height: rows,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
      // Modal content only (no dark overlay)
      React.createElement(Box, { 
        flexDirection: 'column',
        width: Math.floor(columns * 0.6),
        borderStyle: 'double',
        borderColor: 'cyan',
        paddingX: 2,
        paddingY: 1,
        backgroundColor: 'black'
      },
        React.createElement(Text, { bold: true, color: 'cyan' }, '📝 Modal: No Dark Overlay'),
        React.createElement(Text, { dimColor: true, marginTop: 1 }, 'Type here. Is there still lag? ESC to quit.'),
        
        React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
          React.createElement(Text, null, 'Comment:'),
          React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: 'cyan' }, '> '),
            React.createElement(TextInput, {
              value: value,
              onChange: setValue,
              onSubmit: handleSubmit,
              placeholder: 'Type here...'
            })
          )
        ),
        
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { dimColor: true }, `Chars: ${value.length}`)
        )
      )
    )
  );
};

// Test 7: Modal with NO background content at all
const ModalNoBackgroundTest = () => {
  const { exit } = useApp();
  const { width: columns, height: rows } = useTerminalSize();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  return React.createElement(Box, { 
    width: columns,
    height: rows,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
    // Just the modal, no background, no overlay
    React.createElement(Box, { 
      flexDirection: 'column',
      width: Math.floor(columns * 0.6),
      borderStyle: 'double',
      borderColor: 'cyan',
      paddingX: 2,
      paddingY: 1
    },
      React.createElement(Text, { bold: true, color: 'cyan' }, '📝 Test 7: Modal with NO Background'),
      React.createElement(Text, { dimColor: true, marginTop: 1 }, 'No background content, no overlay. Still lag? ESC to quit.'),
      
      React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
        React.createElement(Text, null, 'Comment:'),
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { color: 'cyan' }, '> '),
          React.createElement(TextInput, {
            value: value,
            onChange: setValue,
            onSubmit: handleSubmit,
            placeholder: 'Type here...'
          })
        )
      ),
      
      React.createElement(Box, { marginTop: 1 },
        React.createElement(Text, { dimColor: true }, `Chars: ${value.length}`)
      )
    )
  );
};

// Test 8: TextInput at BOTTOM of screen (Task 3 suggestion)
const TextInputAtBottomTest = () => {
  const { exit } = useApp();
  const { width: columns, height: rows } = useTerminalSize();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  return React.createElement(Box, { flexDirection: 'column', width: columns, height: rows },
    // Header
    React.createElement(Box, { borderStyle: 'single', paddingX: 1, flexShrink: 0 },
      React.createElement(Text, { bold: true, color: 'cyan' }, 'Test 8: TextInput at BOTTOM (Task 3)')
    ),
    
    // Main content that fills space
    React.createElement(Box, { flexDirection: 'column', flexGrow: 1, padding: 1 },
      React.createElement(Text, { dimColor: true }, 'All content ABOVE the input. Type at bottom. Still lag?'),
      
      // Info panels
      React.createElement(Box, { marginTop: 1, borderStyle: 'single', borderColor: 'yellow', padding: 1 },
        React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, null, 'Character count: ', React.createElement(Text, { bold: true, color: 'yellow' }, value.length)),
          React.createElement(Text, null, 'Last 3 chars: ', React.createElement(Text, { color: 'cyan' }, value.slice(-3) || 'none'))
        )
      ),

      React.createElement(Box, { marginTop: 1, borderStyle: 'single', borderColor: 'magenta', padding: 1 },
        React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, null, 'Words: ', React.createElement(Text, { bold: true }, value.split(' ').filter(w => w).length)),
          React.createElement(Text, null, 'Uppercase: ', React.createElement(Text, null, value.toUpperCase()))
        )
      )
    ),

    // TextInput at BOTTOM (last element)
    React.createElement(Box, { borderStyle: 'double', borderColor: 'green', paddingX: 1, paddingY: 1, flexShrink: 0 },
      React.createElement(Box, { flexDirection: 'column' },
        React.createElement(Text, { bold: true }, 'Input (at bottom):'),
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { color: 'cyan' }, '> '),
          React.createElement(TextInput, {
            value: value,
            onChange: setValue,
            onSubmit: handleSubmit,
            placeholder: 'Type here...'
          })
        )
      )
    ),
    
    // Footer
    React.createElement(Box, { borderStyle: 'single', paddingX: 1, flexShrink: 0 },
      React.createElement(Text, { dimColor: true }, 'ESC to exit')
    )
  );
};

// Test 9: Modal with MINIMAL background (no filler box)
const ModalMinimalBackgroundTest = () => {
  const { exit } = useApp();
  const { width: columns, height: rows } = useTerminalSize();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  return React.createElement(Box, { width: columns, height: rows },
    // Background content
    React.createElement(Box, { flexDirection: 'column', width: columns, height: rows },
      React.createElement(Box, { borderStyle: 'single', paddingX: 1, flexShrink: 0 },
        React.createElement(Text, { bold: true }, 'Test 9: Modal with MINIMAL Background (no filler)')
      ),
      React.createElement(Box, { flexDirection: 'column', flexGrow: 1, padding: 1 },
        React.createElement(Text, null, 'Background content'),
        React.createElement(Box, { marginTop: 1, borderStyle: 'single', padding: 1 },
          React.createElement(Text, null, '▶ Item 1'),
          React.createElement(Text, null, '  Item 2')
        )
      )
    ),
    
    // Modal overlay with background BUT NO FILLER BOX
    React.createElement(Box, { 
      position: 'absolute', 
      width: columns,
      height: rows,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
      // Dark background - NO filler box
      React.createElement(Box, { 
        position: 'absolute',
        width: columns,
        height: rows,
        backgroundColor: 'black'
      }),
      
      // Modal content
      React.createElement(Box, { 
        flexDirection: 'column',
        width: Math.floor(columns * 0.6),
        borderStyle: 'double',
        borderColor: 'cyan',
        paddingX: 2,
        paddingY: 1,
        backgroundColor: 'black'
      },
        React.createElement(Text, { bold: true, color: 'cyan' }, '📝 Test 9: No Filler Box'),
        React.createElement(Text, { dimColor: true, marginTop: 1 }, 'Background without filler. Still lag?'),
        
        React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
          React.createElement(Text, null, 'Comment:'),
          React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: 'cyan' }, '> '),
            React.createElement(TextInput, {
              value: value,
              onChange: setValue,
              onSubmit: handleSubmit,
              placeholder: 'Type here...'
            })
          )
        ),
        
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { dimColor: true }, `Chars: ${value.length}`)
        )
      )
    )
  );
};

// Test 10: Modal-sized dark box (not full screen)
const ModalSizedDarkBoxTest = () => {
  const { exit } = useApp();
  const { width: columns, height: rows } = useTerminalSize();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      console.log('Final value:', value);
      exit();
    }, 1000);
  };

  if (submitted) {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'green' }, `✓ Submitted: ${value}`),
      React.createElement(Text, { dimColor: true }, 'Exiting...')
    );
  }

  const modalWidth = Math.floor(columns * 0.6);
  const modalHeight = 15; // Fixed height for modal

  return React.createElement(Box, { width: columns, height: rows },
    // Background content
    React.createElement(Box, { flexDirection: 'column', width: columns, height: rows },
      React.createElement(Box, { borderStyle: 'single', paddingX: 1, flexShrink: 0 },
        React.createElement(Text, { bold: true }, 'Test 10: Modal-sized Dark Box (not full screen)')
      ),
      React.createElement(Box, { flexDirection: 'column', flexGrow: 1, padding: 1 },
        React.createElement(Text, null, 'Background content'),
        React.createElement(Box, { marginTop: 1, borderStyle: 'single', padding: 1 },
          React.createElement(Text, null, '▶ Item 1'),
          React.createElement(Text, null, '  Item 2'),
          React.createElement(Text, null, '  Item 3')
        )
      )
    ),
    
    // Modal overlay - centered container
    React.createElement(Box, { 
      position: 'absolute', 
      width: columns,
      height: rows,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
      // Dark box - ONLY modal size, not full screen
      React.createElement(Box, { 
        position: 'absolute',
        width: modalWidth,
        height: modalHeight,
        backgroundColor: 'black'
      }),
      
      // Modal content on top
      React.createElement(Box, { 
        flexDirection: 'column',
        width: modalWidth,
        borderStyle: 'double',
        borderColor: 'cyan',
        paddingX: 2,
        paddingY: 1
      },
        React.createElement(Text, { bold: true, color: 'cyan' }, '📝 Test 10: Modal-sized Dark Background'),
        React.createElement(Text, { dimColor: true, marginTop: 1 }, 'Dark box is ONLY modal size. Still lag?'),
        
        React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
          React.createElement(Text, null, 'Comment:'),
          React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: 'cyan' }, '> '),
            React.createElement(TextInput, {
              value: value,
              onChange: setValue,
              onSubmit: handleSubmit,
              placeholder: 'Type here...'
            })
          )
        ),
        
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { dimColor: true }, `Chars: ${value.length}`)
        )
      )
    )
  );
};

// Test selector
const tests = {
  '1': { name: 'Minimal TextInput', component: MinimalTest },
  '2': { name: 'Nested Boxes', component: NestedBoxTest },
  '3': { name: 'Multiple Components', component: MultiComponentTest },
  '4': { name: 'Full Screen Multiple Components', component: FullScreenTest },
  '5': { name: 'Overlay Modal with Background', component: OverlayModalTest },
  '6': { name: 'Modal WITHOUT Dark Overlay', component: ModalNoDarkOverlayTest },
  '7': { name: 'Modal with NO Background', component: ModalNoBackgroundTest },
  '8': { name: 'TextInput at BOTTOM', component: TextInputAtBottomTest },
  '9': { name: 'Modal with MINIMAL Background (no filler)', component: ModalMinimalBackgroundTest },
  '10': { name: 'Modal-sized Dark Box', component: ModalSizedDarkBoxTest },
};

const testNum = process.argv[2] || '1';
const test = tests[testNum];

if (!test) {
  console.log('Usage: node test-text-input-lag.js <test-number>');
  console.log('\nAvailable tests:');
  Object.entries(tests).forEach(([num, t]) => {
    console.log(`  ${num}: ${t.name}`);
  });
  process.exit(1);
}

console.log(`\n🧪 Running: ${test.name}\n`);
render(React.createElement(test.component), {
  incrementalRendering: true,
});
