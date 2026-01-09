import { describe, it, expect } from 'vitest';
import {
  isAbsoluteUrl,
  convertAzureDevOpsUrl,
  convertAppScanUrl,
  convertToAbsoluteUrl,
  getUrlLabel,
  formatUrlForDisplay,
} from '../../src/utils/url-converter.js';

describe('url-converter', () => {
  it('detects absolute urls', () => {
    expect(isAbsoluteUrl('https://example.com')).toBe(true);
    expect(isAbsoluteUrl('http://x')).toBe(true);
    expect(isAbsoluteUrl('/relative')).toBe(false);
  });

  it('converts azure devops relative path and adds version param', () => {
    const input = '/org/proj/_git/repo?path=/a/b/c';
    const out = convertAzureDevOpsUrl(input, 'https://dev.azure.com');
    expect(out).toContain('https://dev.azure.com/org/proj/_git/repo');
    expect(out).toContain('path=/a/b/c');
    expect(out).toContain('version=GBmaster');
  });

  it('converts appscan api path', () => {
    expect(convertAppScanUrl('/api/v4/Issues/1', 'https://eu.cloud.appscan.com')).toBe(
      'https://eu.cloud.appscan.com/api/v4/Issues/1'
    );
  });

  it('convertToAbsoluteUrl detects types', () => {
    expect(convertToAbsoluteUrl('/api/v4/Issues/1')).toContain('/api/v4/Issues/1');
    expect(convertToAbsoluteUrl('/org/proj/_git/repo?path=/a')).toContain('dev.azure.com');
    expect(convertToAbsoluteUrl('https://x/y')).toBe('https://x/y');
  });

  it('getUrlLabel works for azure devops and appscan', () => {
    const az = 'https://dev.azure.com/org/_git/repo?path=/src/file.js';
    expect(getUrlLabel(az)).toBe('src/file.js');

    // Use capitalized `Issues` segment to match current implementation's check
    const as = 'https://eu.cloud.appscan.com/Issues/100';
    expect(getUrlLabel(as)).toBe('Issue Details');

    expect(getUrlLabel('/relative/path')).toBe('relative/path');
  });

  it('formatUrlForDisplay returns object', () => {
    const out = formatUrlForDisplay('/api/v4/Issues/1', 'https://eu.cloud.appscan.com');
    expect(out).toHaveProperty('text');
    expect(out).toHaveProperty('url');
    expect(out.isAbsolute).toBe(true);
  });
});
