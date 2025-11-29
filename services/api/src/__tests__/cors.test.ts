import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getCorsConfig } from '../config/cors';

describe('CORS Configuration', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.NODE_ENV;
    delete process.env.CORS_ORIGIN;
  });

  describe('Development Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should allow localhost origins by default', () => {
      const config = getCorsConfig();
      expect(config).toBeDefined();
      expect(config.credentials).toBe(true);
      expect(config.methods).toContain('GET');
      expect(config.methods).toContain('POST');
    });

    it('should allow custom origins from environment', async () => {
      process.env.CORS_ORIGIN = 'http://localhost:3000,http://localhost:19006';
      const config = getCorsConfig();
      
      // Test origin function
      if (typeof config.origin === 'function') {
        const callback = jest.fn();
        await config.origin('http://localhost:3000', callback);
        expect(callback).toHaveBeenCalledWith(null, true);
        
        callback.mockClear();
        await config.origin('http://evil.com', callback);
        expect(callback).toHaveBeenCalledWith(
          expect.any(Error),
          false
        );
      }
    });

    it('should allow requests with no origin (mobile apps)', async () => {
      const config = getCorsConfig();
      
      if (typeof config.origin === 'function') {
        const callback = jest.fn();
        await config.origin(undefined, callback);
        expect(callback).toHaveBeenCalledWith(null, true);
      }
    });
  });

  describe('Production Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://bookofmormon.app,https://api.bookofmormon.app';
    });

    it('should reject requests with no origin', async () => {
      const config = getCorsConfig();
      
      if (typeof config.origin === 'function') {
        const callback = jest.fn();
        await config.origin(undefined, callback);
        expect(callback).toHaveBeenCalledWith(
          expect.any(Error),
          false
        );
      }
    });

    it('should only allow configured production origins', async () => {
      const config = getCorsConfig();
      
      if (typeof config.origin === 'function') {
        const callback = jest.fn();
        
        // Should allow configured origin
        await config.origin('https://bookofmormon.app', callback);
        expect(callback).toHaveBeenCalledWith(null, true);
        
        callback.mockClear();
        
        // Should reject unconfigured origin
        await config.origin('https://evil.com', callback);
        expect(callback).toHaveBeenCalledWith(
          expect.any(Error),
          false
        );
      }
    });

    it('should have security-focused configuration', () => {
      const config = getCorsConfig();
      
      expect(config.methods).not.toContain('OPTIONS');
      expect(config.maxAge).toBeDefined();
      expect(config.credentials).toBe(true);
    });
  });

  describe('Test Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should allow all origins for testing', () => {
      const config = getCorsConfig();
      expect(config.origin).toBe(true);
      expect(config.credentials).toBe(true);
    });
  });

  describe('Invalid Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'invalid';
    });

    it('should default to development configuration', () => {
      const config = getCorsConfig();
      expect(config.credentials).toBe(true);
      expect(typeof config.origin).toBe('function');
    });
  });
});