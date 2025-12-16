/**
 * Unit tests for audit service
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import auditService from '../../src/tui/utils/audit.js';

describe('AuditService', () => {
  const auditFile = auditService.getAuditFilePath();

  beforeEach(() => {
    // Clear audit file before each test
    if (fs.existsSync(auditFile)) {
      fs.unlinkSync(auditFile);
    }
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(auditFile)) {
      fs.unlinkSync(auditFile);
    }
  });

  it('should log audit entries', () => {
    const entry = auditService.log('TEST_ACTION', { key: 'value' }, { success: true });

    expect(entry.action).toBe('TEST_ACTION');
    expect(entry.params.key).toBe('value');
    expect(entry.result.success).toBe(true);
    expect(entry.timestamp).toBeDefined();
  });

  it('should sanitize sensitive parameters', () => {
    const entry = auditService.log('TEST_ACTION', { password: 'secret123', token: 'abc' });

    expect(entry.params.password).toBe('***REDACTED***');
    expect(entry.params.token).toBe('***REDACTED***');
  });

  it('should log AppScan updates', () => {
    const entry = auditService.logAppScanUpdate(
      ['issue1', 'issue2'],
      'app123',
      { Status: 'Fixed' },
      { success: true }
    );

    expect(entry.action).toBe('APPSCAN_UPDATE');
    expect(entry.params.issueIds).toEqual(['issue1', 'issue2']);
    expect(entry.params.applicationId).toBe('app123');
    expect(entry.metadata.issueCount).toBe(2);
  });

  it('should log Jira creation', () => {
    const entry = auditService.logJiraCreate('PROJ', 'Test Issue', 5, {
      success: true,
      jiraKey: 'PROJ-123',
    });

    expect(entry.action).toBe('JIRA_CREATE');
    expect(entry.params.projectKey).toBe('PROJ');
    expect(entry.params.issueCount).toBe(5);
    expect(entry.result.jiraKey).toBe('PROJ-123');
  });

  it('should log Jira link', () => {
    const entry = auditService.logJiraLink('issue1', 'app123', 'PROJ-123', { success: true });

    expect(entry.action).toBe('JIRA_LINK');
    expect(entry.params.issueId).toBe('issue1');
    expect(entry.params.jiraKey).toBe('PROJ-123');
  });

  it('should read audit log entries', () => {
    auditService.log('ACTION1', {}, { success: true });
    auditService.log('ACTION2', {}, { success: true });
    auditService.log('ACTION3', {}, { success: true });

    const entries = auditService.readAuditLog();

    expect(entries.length).toBe(3);
    expect(entries[0].action).toBe('ACTION1');
    expect(entries[2].action).toBe('ACTION3');
  });

  it('should limit read entries', () => {
    for (let i = 0; i < 50; i++) {
      auditService.log(`ACTION${i}`, {}, { success: true });
    }

    const entries = auditService.readAuditLog(10);

    expect(entries.length).toBe(10);
  });

  it('should handle missing audit file', () => {
    const entries = auditService.readAuditLog();

    expect(entries).toEqual([]);
  });

  it('should clear audit log', () => {
    auditService.log('TEST_ACTION', {}, { success: true });
    expect(fs.existsSync(auditFile)).toBe(true);

    auditService.clearAuditLog();

    const content = fs.readFileSync(auditFile, 'utf8');
    // After clear, only the AUDIT_CLEARED entry should exist
    expect(content).toContain('AUDIT_CLEARED');
    expect(content).not.toContain('TEST_ACTION');
  });
});
