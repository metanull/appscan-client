/**
 * Bootstrap HTTP Proxy Support
 * Configures proxy agents for axios and sets TLS options.
 * Must be imported after dotenv.config() has loaded environment variables.
 * @module utils/bootstrap-proxy
 */

import logger from './logger.js';
import { readFileSync } from 'node:fs';
import tls from 'node:tls';
import {
  isProxyConfigured,
  getProxyConfig,
  getProxyConfigSummary,
  shouldDisableCertVerification,
  getCustomCACert,
} from './proxy-config.js';

let customCACert;

function configureTlsVerification() {
  if (shouldDisableCertVerification()) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    logger.info(
      'TLS certificate verification is DISABLED',
      {},
      { fileOnly: true }
    );
  }
}

function configureCustomCACert() {
  const certPath = getCustomCACert();
  if (!certPath) return;

  try {
    customCACert = readFileSync(certPath, 'utf8');

    const origCreateSecureContext = tls.createSecureContext;
    tls.createSecureContext = function (options = {}) {
      if (!options.ca) {
        options = { ...options, ca: [...tls.rootCertificates, customCACert] };
      } else {
        const existingCA = Array.isArray(options.ca)
          ? options.ca
          : [options.ca];
        options = { ...options, ca: [...existingCA, customCACert] };
      }
      return origCreateSecureContext.call(this, options);
    };

    logger.debug(
      'Custom CA certificate configured globally',
      { path: certPath },
      { fileOnly: true }
    );
  } catch (error) {
    logger.warn(
      'Failed to load custom CA certificate',
      { path: certPath, error: error.message },
      { fileOnly: true }
    );
  }
}

async function configureAxiosProxy() {
  const config = getProxyConfig();
  if (!config) return;

  try {
    const [axiosModule, { HttpsProxyAgent }, { HttpProxyAgent }] =
      await Promise.all([
        import('axios'),
        import('https-proxy-agent'),
        import('http-proxy-agent'),
      ]);

    const axios = axiosModule.default;
    const rejectUnauthorized = !shouldDisableCertVerification();

    if (config.httpsProxy) {
      const httpsAgent = new HttpsProxyAgent(config.httpsProxy, {
        rejectUnauthorized,
      });
      axios.defaults.httpsAgent = httpsAgent;
      globalThis.__PROXY_HTTPS_AGENT = httpsAgent;
    }

    if (config.httpProxy) {
      const httpAgent = new HttpProxyAgent(config.httpProxy);
      axios.defaults.httpAgent = httpAgent;
      globalThis.__PROXY_HTTP_AGENT = httpAgent;
    }

    axios.defaults.proxy = false;
    logger.debug('Axios proxy agents configured', {}, { fileOnly: true });
  } catch (error) {
    logger.warn(
      'Could not configure axios proxy agents',
      { error: error.message },
      { fileOnly: true }
    );
  }
}

async function initializeProxy() {
  configureCustomCACert();
  configureTlsVerification();

  if (!isProxyConfigured()) {
    return;
  }

  await configureAxiosProxy();
  logger.info(
    'Proxy enabled',
    { config: getProxyConfigSummary() },
    { fileOnly: true }
  );
}

await initializeProxy();
