/**
 * Unit tests for logger utility
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import logger from '../src/utils/logger.js';

describe('Logger', () => {
  const mockLogFile = logger.getLogFilePath();

  beforeEach(() => {
    // Clear log file before each test
    if (fs.existsSync(mockLogFile)) {
      fs.unlinkSync(mockLogFile);
    }
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(mockLogFile)) {
      fs.unlinkSync(mockLogFile);
    }
  });

  it('should log error messages', () => {
    const message = logger.error('Test error', null, { testKey: 'testValue' });

    expect(message).toContain('ERROR');
    expect(message).toContain('Test error');
    expect(message).toContain('testKey');

    const logContent = fs.readFileSync(mockLogFile, 'utf8');
    expect(logContent).toContain('Test error');
  });

  it('should log error with error object', () => {
    const testError = new Error('Test error object');
    const message = logger.error('Error occurred', testError);

    expect(message).toContain('ERROR');
    expect(message).toContain('Error occurred');
    expect(message).toContain('Test error object');
  });

  it('should log warning messages', () => {
    const message = logger.warn('Test warning', { context: 'test' });

    expect(message).toContain('WARN');
    expect(message).toContain('Test warning');

    const logContent = fs.readFileSync(mockLogFile, 'utf8');
    expect(logContent).toContain('Test warning');
  });

  it('should log info messages', () => {
    const message = logger.info('Test info');

    expect(message).toContain('INFO');
    expect(message).toContain('Test info');
  });

  it('should format log messages with timestamp', () => {
    const message = logger.info('Test message');

    expect(message).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
  });

  it('should clear log file', () => {
    logger.error('Test error');
    expect(fs.existsSync(mockLogFile)).toBe(true);

    logger.clearLogs();

    const logContent = fs.readFileSync(mockLogFile, 'utf8');
    // After clear, only the log clear message should exist
    expect(logContent).toContain('Log file cleared');
    expect(logContent).not.toContain('Test error');
  });
});
