import { logger, configureLogger } from '../utils/logger';

describe('Logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset logger config
    configureLogger({
      enabled: true,
      minLevel: 'debug',
      remoteEnabled: false,
      timestamps: false, // Disable for easier testing
    });
  });

  describe('configureLogger', () => {
    it('should allow disabling logging', () => {
      configureLogger({ enabled: false });

      logger.info('test message');

      expect(console.info).not.toHaveBeenCalled();
    });

    it('should respect minimum log level', () => {
      configureLogger({ minLevel: 'warn' });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('logger methods', () => {
    it('should log debug messages', () => {
      logger.debug('debug test');
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('info test');
      expect(console.info).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('warn test');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('error test', new Error('test error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('scoped logger', () => {
    it('should create a scoped logger with context', () => {
      const scopedLog = logger.scope('TestModule');

      scopedLog.info('scoped message');

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[TestModule]'),
        expect.anything()
      );
    });

    it('should support all log levels in scoped logger', () => {
      const scopedLog = logger.scope('TestScope');

      scopedLog.debug('debug');
      scopedLog.info('info');
      scopedLog.warn('warn');
      scopedLog.error('error');

      expect(console.debug).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('extra data', () => {
    it('should include extra data in log output', () => {
      const extra = { userId: '123', action: 'test' };
      logger.info('test with extra', extra);

      expect(console.info).toHaveBeenCalledWith(
        expect.any(String),
        extra
      );
    });
  });
});
