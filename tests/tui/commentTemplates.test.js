import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import * as ct from '../../src/tui/services/commentTemplates.js';

const sampleContent = `# Comment Templates\n# Format: [IssueType]|Comment text\n\nSQLi|Remember to sanitize inputs\nXSS|Encode output\nInvalidLineWithoutSep\nSQLi|Use prepared statements\n`;

describe('commentTemplates', () => {
  let existsSpy;
  let readSpy;
  let writeSpy;
  let appendSpy;

  beforeEach(() => {
    existsSpy = vi.spyOn(fs, 'existsSync');
    readSpy = vi.spyOn(fs, 'readFileSync');
    writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    appendSpy = vi.spyOn(fs, 'appendFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loadTemplates creates file when missing and returns empty map', () => {
    existsSpy.mockImplementation(() => false);
    const templates = ct.loadTemplates();
    expect(writeSpy).toHaveBeenCalled();
    expect(templates instanceof Map).toBe(true);
    expect(templates.size).toBe(0);
  });

  it('loadTemplates parses valid templates and ignores invalid lines/comments', () => {
    existsSpy.mockImplementation(() => true);
    readSpy.mockImplementation(() => sampleContent);
    const templates = ct.loadTemplates();
    expect(templates.get('SQLi')).toEqual([
      'Remember to sanitize inputs',
      'Use prepared statements',
    ]);
    expect(templates.get('XSS')).toEqual(['Encode output']);
    expect(templates.has('InvalidLineWithoutSep')).toBe(false);
  });

  it('saveTemplate appends only when new', () => {
    // Existing file with SQLi template
    existsSpy.mockImplementation(() => true);
    readSpy.mockImplementation(() => 'SQLi|Existing\n');

    // Saving same template should not append
    ct.saveTemplate('SQLi', 'Existing');
    expect(appendSpy).not.toHaveBeenCalled();

    // Saving new template should append
    ct.saveTemplate('SQLi', 'New Template');
    expect(appendSpy).toHaveBeenCalled();
  });

  it('getTemplatesForType returns empty array when none', () => {
    existsSpy.mockImplementation(() => true);
    readSpy.mockImplementation(() => sampleContent);
    expect(ct.getTemplatesForType('Nope')).toEqual([]);
  });

  it('getCommonTemplates returns intersection for multiple types', () => {
    // Create content where both types share a template
    const content = 'A|Common\nA|A1\nB|Common\nB|B1\n';
    existsSpy.mockImplementation(() => true);
    readSpy.mockImplementation(() => content);
    const common = ct.getCommonTemplates(['A', 'B']);
    expect(common).toEqual(['Common']);
  });
});
