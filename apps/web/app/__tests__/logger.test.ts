import { logger, configureLogger } from '../utils/logger';

describe('Logger Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env = { ...originalEnv, NODE_ENV: 'development' };
    configureLogger({ enabled: true, minLevel: 'debug' });
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('basic logging', () => {
    it('should log debug messages in development', () => {
      logger.debug('test debug message');
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('test info message');
      expect(console.info).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('test warn message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const error = new Error('test error');
      logger.error('test error message', error);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('scoped logging', () => {
    it('should include scope in log output', () => {
      const scopedLogger = logger.scope('TestScope');
      scopedLogger.info('scoped message');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[TestScope]'),
        expect.anything()
      );
    });

    it('should work with all log levels', () => {
      const scopedLogger = logger.scope('MyModule');

      scopedLogger.debug('debug');
      scopedLogger.info('info');
      scopedLogger.warn('warn');
      scopedLogger.error('error');

      expect(console.debug).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('log level filtering', () => {
    it('should filter debug logs when minLevel is info', () => {
      configureLogger({ minLevel: 'info' });
      logger.debug('should not log');
      logger.info('should log');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
    });

    it('should filter warn logs when minLevel is error', () => {
      configureLogger({ minLevel: 'error' });
      logger.warn('should not log');
      logger.error('should log');

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('configureLogger', () => {
    it('should disable logging when enabled is false', () => {
      configureLogger({ enabled: false });

      logger.debug('test');
      logger.info('test');
      logger.warn('test');
      logger.error('test');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should merge config with existing settings', () => {
      configureLogger({ minLevel: 'warn' });
      configureLogger({ remoteEnabled: true });

      logger.debug('should not log');
      logger.warn('should log');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('extra data', () => {
    it('should pass extra data to console', () => {
      const extra = { userId: '123', action: 'test' };
      logger.info('message with extra', extra);

      expect(console.info).toHaveBeenCalledWith(
        expect.any(String),
        extra
      );
    });
  });
});
