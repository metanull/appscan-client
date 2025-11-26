import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export class Config {
  constructor() {
    this.apiKey = process.env.APPSCAN_API_KEY || null;
    this.apiSecret = process.env.APPSCAN_API_SECRET || null;
    this.baseUrl = process.env.APPSCAN_BASE_URL || 'https://cloud.appscan.com';
  }

  isValid() {
    return !!(this.apiKey && this.apiSecret);
  }

  getApiKey() {
    return this.apiKey;
  }

  getApiSecret() {
    return this.apiSecret;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  static loadFromFile(filePath) {
    if (fs.existsSync(filePath)) {
      const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const instance = new Config();
      instance.apiKey = config.apiKey || instance.apiKey;
      instance.apiSecret = config.apiSecret || instance.apiSecret;
      instance.baseUrl = config.baseUrl || instance.baseUrl;
      return instance;
    }
    return new Config();
  }
}

export default Config;
