/**
 * Error Boundary Component
 * Catches React errors and displays graceful fallback
 */

import React from 'react';
import { Box, Text } from 'ink';
import logger from '../../utils/logger.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React component error caught by boundary', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box flexDirection="column" padding={2} borderStyle="round" borderColor="red">
          <Text bold color="red">
            ❌ Application Error
          </Text>
          <Text color="red" marginTop={1}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text dimColor marginTop={1}>
            Please check the logs for more details.
          </Text>
          <Text dimColor marginTop={1}>
            Press Ctrl+C to exit.
          </Text>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
