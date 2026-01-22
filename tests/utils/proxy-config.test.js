import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  parseProxyUrl,
  getProxyConfig,
  shouldBypassProxy,
  isProxyConfigured,
  getProxyConfigSummary,
  shouldDisableCertVerification,
  getCustomCACert,
} from '../../src/utils/proxy-config.js';

describe('proxy-config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.NO_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;
    delete process.env.no_proxy;
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    delete process.env.PROXY_REJECT_UNAUTHORIZED;
    delete process.env.NODE_EXTRA_CA_CERTS;
    delete process.env.PROXY_CA_CERT;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('parseProxyUrl', () => {
    it('parses simple proxy URL', () => {
      const result = parseProxyUrl('http://proxy.example.com:8080');
      expect(result).toEqual({
        protocol: 'http',
        host: 'proxy.example.com',
        port: 8080,
        auth: undefined,
      });
    });

    it('parses proxy URL with authentication', () => {
      const result = parseProxyUrl('http://user:pass@proxy.example.com:8080');
      expect(result).toEqual({
        protocol: 'http',
        host: 'proxy.example.com',
        port: 8080,
        auth: { username: 'user', password: 'pass' },
      });
    });

    it('parses HTTPS proxy URL', () => {
      const result = parseProxyUrl('https://proxy.example.com:443');
      expect(result).toEqual({
        protocol: 'https',
        host: 'proxy.example.com',
        port: 443,
        auth: undefined,
      });
    });

    it('uses default port for HTTP', () => {
      const result = parseProxyUrl('http://proxy.example.com');
      expect(result.port).toBe(80);
    });

    it('uses default port for HTTPS', () => {
      const result = parseProxyUrl('https://proxy.example.com');
      expect(result.port).toBe(443);
    });

    it('handles URL-encoded credentials', () => {
      const result = parseProxyUrl('http://user%40domain:p%40ss%3Aword@proxy.example.com:8080');
      expect(result.auth).toEqual({
        username: 'user@domain',
        password: 'p@ss:word',
      });
    });

    it('returns undefined for empty input', () => {
      expect(parseProxyUrl('')).toBeUndefined();
      expect(parseProxyUrl(null)).toBeUndefined();
      expect(parseProxyUrl(undefined)).toBeUndefined();
    });

    it('returns undefined for invalid URL', () => {
      expect(parseProxyUrl('not-a-url')).toBeUndefined();
    });
  });

  describe('getProxyConfig', () => {
    it('returns undefined when no proxy env vars are set', () => {
      expect(getProxyConfig()).toBeUndefined();
    });

    it('reads HTTPS_PROXY', () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080';
      const config = getProxyConfig();
      expect(config.httpsProxy).toBe('http://proxy.example.com:8080');
    });

    it('reads HTTP_PROXY', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080';
      const config = getProxyConfig();
      expect(config.httpProxy).toBe('http://proxy.example.com:8080');
    });

    it('prefers uppercase env vars', () => {
      process.env.HTTPS_PROXY = 'http://upper.example.com:8080';
      process.env.https_proxy = 'http://lower.example.com:8080';
      const config = getProxyConfig();
      expect(config.httpsProxy).toBe('http://upper.example.com:8080');
    });

    it('falls back to lowercase env vars', () => {
      process.env.https_proxy = 'http://lower.example.com:8080';
      const config = getProxyConfig();
      expect(config.httpsProxy).toBe('http://lower.example.com:8080');
    });

    it('parses NO_PROXY list', () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080';
      process.env.NO_PROXY = 'localhost, 127.0.0.1, .local, *.internal.corp';
      const config = getProxyConfig();
      expect(config.noProxyList).toEqual(['localhost', '127.0.0.1', '.local', '*.internal.corp']);
    });

    it('handles empty NO_PROXY', () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080';
      process.env.NO_PROXY = '';
      const config = getProxyConfig();
      expect(config.noProxyList).toEqual([]);
    });
  });

  describe('shouldBypassProxy', () => {
    it('returns false for empty host', () => {
      expect(shouldBypassProxy('', ['localhost'])).toBe(false);
    });

    it('returns false for empty noProxyList', () => {
      expect(shouldBypassProxy('example.com', [])).toBe(false);
    });

    it('matches exact hostname', () => {
      expect(shouldBypassProxy('localhost', ['localhost'])).toBe(true);
      expect(shouldBypassProxy('example.com', ['localhost'])).toBe(false);
    });

    it('matches wildcard *', () => {
      expect(shouldBypassProxy('anything.com', ['*'])).toBe(true);
    });

    it('matches domain suffix with leading dot', () => {
      expect(shouldBypassProxy('api.local', ['.local'])).toBe(true);
      expect(shouldBypassProxy('local', ['.local'])).toBe(true);
      expect(shouldBypassProxy('notlocal', ['.local'])).toBe(false);
    });

    it('matches wildcard domain pattern', () => {
      expect(shouldBypassProxy('api.internal.corp', ['*.internal.corp'])).toBe(true);
      expect(shouldBypassProxy('internal.corp', ['*.internal.corp'])).toBe(true);
      expect(shouldBypassProxy('external.com', ['*.internal.corp'])).toBe(false);
    });

    it('matches subdomain of exact host', () => {
      expect(shouldBypassProxy('api.example.com', ['example.com'])).toBe(true);
      expect(shouldBypassProxy('example.com', ['example.com'])).toBe(true);
    });
  });

  describe('isProxyConfigured', () => {
    it('returns false when no proxy env vars are set', () => {
      expect(isProxyConfigured()).toBe(false);
    });

    it('returns true when HTTPS_PROXY is set', () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080';
      expect(isProxyConfigured()).toBe(true);
    });

    it('returns true when HTTP_PROXY is set', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080';
      expect(isProxyConfigured()).toBe(true);
    });

    it('returns true when lowercase env vars are set', () => {
      process.env.https_proxy = 'http://proxy.example.com:8080';
      expect(isProxyConfigured()).toBe(true);
    });
  });

  describe('getProxyConfigSummary', () => {
    it('returns "No proxy configured" when no proxy is set', () => {
      expect(getProxyConfigSummary()).toBe('No proxy configured');
    });

    it('includes HTTPS proxy in summary', () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080';
      expect(getProxyConfigSummary()).toContain('HTTPS: http://proxy.example.com:8080');
    });

    it('includes bypass list in summary', () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080';
      process.env.NO_PROXY = 'localhost,.local';
      const summary = getProxyConfigSummary();
      expect(summary).toContain('Bypass: localhost, .local');
    });

    it('includes TLS verification status in summary', () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080';
      process.env.PROXY_REJECT_UNAUTHORIZED = 'false';
      const summary = getProxyConfigSummary();
      expect(summary).toContain('TLS verification: DISABLED');
    });

    it('includes custom CA cert in summary', () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080';
      process.env.NODE_EXTRA_CA_CERTS = '/path/to/ca.crt';
      const summary = getProxyConfigSummary();
      expect(summary).toContain('Custom CA: /path/to/ca.crt');
    });
  });

  describe('shouldDisableCertVerification', () => {
    it('returns false when no env vars are set', () => {
      expect(shouldDisableCertVerification()).toBe(false);
    });

    it('returns true when NODE_TLS_REJECT_UNAUTHORIZED=0', () => {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      expect(shouldDisableCertVerification()).toBe(true);
    });

    it('returns false when NODE_TLS_REJECT_UNAUTHORIZED=1', () => {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
      expect(shouldDisableCertVerification()).toBe(false);
    });

    it('returns true when PROXY_REJECT_UNAUTHORIZED=false', () => {
      process.env.PROXY_REJECT_UNAUTHORIZED = 'false';
      expect(shouldDisableCertVerification()).toBe(true);
    });

    it('returns true when PROXY_REJECT_UNAUTHORIZED=0', () => {
      process.env.PROXY_REJECT_UNAUTHORIZED = '0';
      expect(shouldDisableCertVerification()).toBe(true);
    });

    it('returns false when PROXY_REJECT_UNAUTHORIZED=true', () => {
      process.env.PROXY_REJECT_UNAUTHORIZED = 'true';
      expect(shouldDisableCertVerification()).toBe(false);
    });
  });

  describe('getCustomCACert', () => {
    it('returns undefined when no env vars are set', () => {
      expect(getCustomCACert()).toBeUndefined();
    });

    it('returns PROXY_CA_CERT value', () => {
      process.env.PROXY_CA_CERT = '/path/to/ca.crt';
      expect(getCustomCACert()).toBe('/path/to/ca.crt');
    });

    it('falls back to NODE_EXTRA_CA_CERTS when PROXY_CA_CERT is not set', () => {
      process.env.NODE_EXTRA_CA_CERTS = '/path/to/system-ca.crt';
      expect(getCustomCACert()).toBe('/path/to/system-ca.crt');
    });

    it('prefers PROXY_CA_CERT over NODE_EXTRA_CA_CERTS', () => {
      process.env.PROXY_CA_CERT = '/path/to/app-ca.crt';
      process.env.NODE_EXTRA_CA_CERTS = '/path/to/system-ca.crt';
      expect(getCustomCACert()).toBe('/path/to/app-ca.crt');
    });
  });
});
