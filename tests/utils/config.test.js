import { Config } from '../../src/utils/config.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a clean environment without .env variables
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should load from environment variables', () => {
      process.env.APPSCAN_API_KEY = 'test-key';
      process.env.APPSCAN_API_SECRET = 'test-secret';
      process.env.APPSCAN_BASE_URL = 'https://test.appscan.com';

      const config = new Config();

      expect(config.getApiKey()).toBe('test-key');
      expect(config.getApiSecret()).toBe('test-secret');
      expect(config.getBaseUrl()).toBe('https://test.appscan.com');
    });

    it('should use default base URL if not specified', () => {
      const config = new Config();
      expect(config.getBaseUrl()).toBe('https://cloud.appscan.com');
    });

    it('should have null credentials if not set', () => {
      const config = new Config();
      expect(config.getApiKey()).toBeNull();
      expect(config.getApiSecret()).toBeNull();
    });
  });

  describe('isValid', () => {
    it('should return true when both key and secret are set', () => {
      process.env.APPSCAN_API_KEY = 'test-key';
      process.env.APPSCAN_API_SECRET = 'test-secret';

      const config = new Config();
      expect(config.isValid()).toBe(true);
    });

    it('should return false when key is missing', () => {
      process.env.APPSCAN_API_SECRET = 'test-secret';

      const config = new Config();
      expect(config.isValid()).toBe(false);
    });

    it('should return false when secret is missing', () => {
      process.env.APPSCAN_API_KEY = 'test-key';

      const config = new Config();
      expect(config.isValid()).toBe(false);
    });
  });

  describe('loadFromFile', () => {
    const testConfigPath = path.join(os.tmpdir(), 'test-config.json');

    afterEach(() => {
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }
    });

    it('should load configuration from file', () => {
      const configData = {
        apiKey: 'file-key',
        apiSecret: 'file-secret',
        baseUrl: 'https://file.appscan.com',
      };

      fs.writeFileSync(testConfigPath, JSON.stringify(configData));

      const config = Config.loadFromFile(testConfigPath);

      expect(config.getApiKey()).toBe('file-key');
      expect(config.getApiSecret()).toBe('file-secret');
      expect(config.getBaseUrl()).toBe('https://file.appscan.com');
    });

    it('should return default config if file does not exist', () => {
      const config = Config.loadFromFile('/non/existent/path.json');

      expect(config.getApiKey()).toBeNull();
      expect(config.getApiSecret()).toBeNull();
      expect(config.getBaseUrl()).toBe('https://cloud.appscan.com');
    });

    it('should merge file config with defaults', () => {
      const configData = {
        apiKey: 'file-key',
      };

      fs.writeFileSync(testConfigPath, JSON.stringify(configData));

      const config = Config.loadFromFile(testConfigPath);

      expect(config.getApiKey()).toBe('file-key');
      expect(config.getApiSecret()).toBeNull();
      expect(config.getBaseUrl()).toBe('https://cloud.appscan.com');
    });
  });
});
