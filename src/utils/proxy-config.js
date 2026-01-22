/**
 * HTTP Proxy Configuration Utility
 * @module utils/proxy-config
 */

import logger from './logger.js';

/**
 * Parse proxy URL into components
 * @param {string} proxyUrl
 * @returns {Object|undefined}
 */
export function parseProxyUrl(proxyUrl) {
  if (!proxyUrl) return undefined;

  try {
    const url = new URL(proxyUrl);
    return {
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : url.protocol === 'https:' ? 443 : 80,
      auth: url.username
        ? { username: decodeURIComponent(url.username), password: decodeURIComponent(url.password || '') }
        : undefined,
    };
  } catch {
    return undefined;
  }
}

/**
 * Get proxy configuration from environment variables
 * @returns {Object|undefined}
 */
export function getProxyConfig() {
  const httpsProxy =
    process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy || httpsProxy;
  const noProxy = process.env.NO_PROXY || process.env.no_proxy || '';

  if (!httpsProxy && !httpProxy) return undefined;

  return {
    httpProxy,
    httpsProxy,
    noProxyList: noProxy
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

/**
 * Check if a host should bypass the proxy
 * @param {string} host
 * @param {string[]} noProxyList
 * @returns {boolean}
 */
export function shouldBypassProxy(host, noProxyList = []) {
  if (!host || noProxyList.length === 0) return false;

  return noProxyList.some((pattern) => {
    if (pattern === '*') return true;
    if (pattern.startsWith('.')) {
      return host.endsWith(pattern) || host === pattern.slice(1);
    }
    if (pattern.startsWith('*.')) {
      return host.endsWith(pattern.slice(1)) || host === pattern.slice(2);
    }
    return host === pattern || host.endsWith(`.${pattern}`);
  });
}

/**
 * @returns {boolean}
 */
export function isProxyConfigured() {
  return !!(
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy
  );
}

/**
 * @returns {boolean}
 */
export function shouldDisableCertVerification() {
  const nodeEnv = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  const proxyEnv = process.env.PROXY_REJECT_UNAUTHORIZED;

  if (nodeEnv === '0') return true;
  if (proxyEnv === 'false' || proxyEnv === '0') return true;

  return false;
}

/**
 * @returns {string|undefined}
 */
export function getCustomCACert() {
  return process.env.PROXY_CA_CERT || process.env.NODE_EXTRA_CA_CERTS;
}

/**
 * Get axios configuration options for proxy support with proper HTTPS tunneling
 * @returns {Promise<Object>}
 */
export async function getAxiosProxyConfig() {
  if (!isProxyConfigured()) {
    return {};
  }

  if (globalThis.__PROXY_HTTPS_AGENT || globalThis.__PROXY_HTTP_AGENT) {
    return {
      httpsAgent: globalThis.__PROXY_HTTPS_AGENT,
      httpAgent: globalThis.__PROXY_HTTP_AGENT,
      proxy: false,
    };
  }

  const config = getProxyConfig();
  if (!config) return {};

  try {
    const [{ HttpsProxyAgent }, { HttpProxyAgent }] = await Promise.all([
      import('https-proxy-agent'),
      import('http-proxy-agent'),
    ]);

    const result = { proxy: false };
    const rejectUnauthorized = !shouldDisableCertVerification();

    if (config.httpsProxy) {
      result.httpsAgent = new HttpsProxyAgent(config.httpsProxy, { rejectUnauthorized });
    }
    if (config.httpProxy) {
      result.httpAgent = new HttpProxyAgent(config.httpProxy);
    }

    return result;
  } catch (error) {
    logger.warn('Proxy agents not available, proxy may not work for HTTPS', { error: error.message });
    return {};
  }
}

/**
 * Get proxy options for azure-devops-node-api WebApi constructor
 * @returns {Promise<Object>}
 */
export async function getAzdoProxyOptions() {
  if (!isProxyConfigured()) {
    return {};
  }

  const config = getProxyConfig();
  if (!config) return {};

  const options = {};

  if (config.httpsProxy) {
    options.proxy = {
      proxyUrl: config.httpsProxy,
      proxyBypassHosts: config.noProxyList,
    };
  }

  if (shouldDisableCertVerification()) {
    options.ignoreSslError = true;
  }

  return options;
}

/**
 * Get request config for jira.js client
 * @returns {Promise<Object>}
 */
export async function getJiraProxyConfig() {
  return getAxiosProxyConfig();
}

/**
 * @returns {string}
 */
export function getProxyConfigSummary() {
  const config = getProxyConfig();
  if (!config) return 'No proxy configured';

  const parts = [];
  if (config.httpsProxy) parts.push(`HTTPS: ${config.httpsProxy}`);
  if (config.httpProxy && config.httpProxy !== config.httpsProxy) parts.push(`HTTP: ${config.httpProxy}`);
  if (config.noProxyList.length > 0) parts.push(`Bypass: ${config.noProxyList.join(', ')}`);
  if (shouldDisableCertVerification()) parts.push('TLS verification: DISABLED');
  const caCert = getCustomCACert();
  if (caCert) parts.push(`Custom CA: ${caCert}`);

  return parts.join(' | ');
}
