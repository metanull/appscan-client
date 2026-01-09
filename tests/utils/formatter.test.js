import { describe, it, expect } from 'vitest';
import { Formatter } from '../../src/utils/formatter.js';

describe('Formatter static methods', () => {
  it('normalizes scan type', () => {
    expect(Formatter.normalizeScanType('StaticAnalyzer')).toBe('SAST');
    expect(Formatter.normalizeScanType('Unknown')).toBe('Unknown');
  });

  it('converts scanner name to technology', () => {
    expect(Formatter.scannerToTechnology('AppScan Static Analyzer')).toBe('StaticAnalyzer');
    expect(Formatter.scannerToTechnology('something sca open source')).toBe('ScaAnalyzer');
  });

  it('maps severity values and colors', () => {
    expect(Formatter.severityToValue('Critical')).toBe(5);
    expect(Formatter.getSeverityColor('High')).toBe('red');
  });

  it('formats SCA context', () => {
    const issue = {
      ScaTechnology: 'JS',
      LibraryName: 'marked',
      LibraryVersion: '3.0.8',
      CvePublishDate: '2022-01-14',
      Cve: 'CVE-2022-21680',
      DetailsUrl: 'https://cve.example',
      Cvss: 7.5,
    };

    const out = Formatter.formatScaContext(issue);
    expect(out).toContain('marked 3.0.8');
    expect(out).toContain('(CVSS 7.5/10)');
    expect(out).toContain('CVE-2022-21680');
  });
});

describe('Formatter instance methods', () => {
  it('formats application', () => {
    const f = new Formatter('https://app');
    const app = { Id: 'A', Name: 'App', Scans: [{ Technology: 'StaticAnalyzer' }] };
    const out = f.formatApplication(app);
    expect(out).toHaveProperty('id', 'A');
    expect(out.scanTechnologies).toContain('SAST');
    expect(out.url).toContain('/apps/A');
  });

  it('formatTable returns message when empty', () => {
    const tbl = Formatter.formatTable([], []);
    expect(tbl).toContain('No data to display');
  });
});
