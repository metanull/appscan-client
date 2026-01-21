import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { auditService } from '../../src/tui/shared/utils/audit.js';

describe('AuditService', () => {
  let appendSpy;
  let existsSpy;
  let readSpy;
  let writeSpy;

  beforeEach(() => {
    appendSpy = vi.spyOn(fs, 'appendFileSync').mockImplementation(() => {});
    existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(() => true);
    readSpy = vi
      .spyOn(fs, 'readFileSync')
      .mockImplementation(() => JSON.stringify({ a: 1 }) + '\n');
    writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('log redacts sensitive fields and returns an entry', () => {
    const entry = auditService.log(
      'TEST',
      { password: 'p', token: 't', keep: 1 },
      { success: true },
      { meta: true }
    );
    expect(entry.action).toBe('TEST');
    expect(entry.params.password).toBe('***REDACTED***');
    expect(entry.params.token).toBe('***REDACTED***');
    expect(entry.params.keep).toBe(1);
    expect(appendSpy).toHaveBeenCalled();
  });

  it('readAuditLog returns parsed entries', () => {
    existsSpy.mockImplementation(() => true);
    readSpy.mockImplementation(
      () => `${JSON.stringify({ x: 1 })}\n${JSON.stringify({ y: 2 })}\n`
    );
    const entries = auditService.readAuditLog(10);
    expect(entries.length).toBe(2);
    expect(entries[0].x).toBe(1);
  });

  it('clearAuditLog writes empty file and logs AUDIT_CLEARED', () => {
    auditService.clearAuditLog();
    expect(writeSpy).toHaveBeenCalledWith(expect.any(String), '', 'utf8');
    // append called via log inside clearAuditLog
    expect(appendSpy).toHaveBeenCalled();
  });

  it('logAppUpdate and logJiraCreate and logJiraLink call log and return entry', () => {
    const a = auditService.logAppUpdate(
      ['1'],
      'app',
      { f: 1 },
      { success: true }
    );
    expect(a.action).toBe('APPSCAN_APP_UPDATE');
    const b = auditService.logJiraCreate('PRJ', 'sum', 2, { success: true });
    expect(b.action).toBe('JIRA_CREATE');
    const c = auditService.logJiraLink('1', 'app', 'PRJ-1', { success: true });
    expect(c.action).toBe('JIRA_LINK');
  });
});
