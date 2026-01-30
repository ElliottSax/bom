/**
 * Logger Utility
 *
 * Provides a centralized logging abstraction that can be:
 * - Conditionally disabled in production
 * - Extended with remote error reporting (Sentry, LogRocket)
 * - Configured per log level
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  /** Enable/disable all logging */
  enabled: boolean;
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Enable remote error reporting */
  remoteEnabled: boolean;
  /** Include timestamps in logs */
  timestamps: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default configuration - can be overridden
let config: LoggerConfig = {
  enabled: __DEV__, // Only enable in development by default
  minLevel: 'debug',
  remoteEnabled: false,
  timestamps: true,
};

/**
 * Configure the logger
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Format a log message with optional timestamp and context
 */
function formatMessage(level: LogLevel, message: string, context?: string): string {
  const parts: string[] = [];

  if (config.timestamps) {
    parts.push(`[${new Date().toISOString()}]`);
  }

  parts.push(`[${level.toUpperCase()}]`);

  if (context) {
    parts.push(`[${context}]`);
  }

  parts.push(message);

  return parts.join(' ');
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
}

/**
 * Send error to remote service (placeholder for Sentry/LogRocket)
 */
function sendToRemote(level: LogLevel, message: string, error?: Error, extra?: Record<string, unknown>): void {
  if (!config.remoteEnabled) return;

  // TODO: Implement remote error reporting
  // Example with Sentry:
  // if (level === 'error' && error) {
  //   Sentry.captureException(error, { extra: { message, ...extra } });
  // } else if (level === 'error') {
  //   Sentry.captureMessage(message, { level: 'error', extra });
  // }
}

/**
 * Core logging function
 */
function log(
  level: LogLevel,
  message: string,
  context?: string,
  error?: Error,
  extra?: Record<string, unknown>
): void {
  if (!shouldLog(level)) return;

  const formattedMessage = formatMessage(level, message, context);

  switch (level) {
    case 'debug':
      console.debug(formattedMessage, extra ?? '');
      break;
    case 'info':
      console.info(formattedMessage, extra ?? '');
      break;
    case 'warn':
      console.warn(formattedMessage, extra ?? '');
      break;
    case 'error':
      console.error(formattedMessage, error ?? '', extra ?? '');
      sendToRemote(level, message, error, extra);
      break;
  }
}

/**
 * Logger instance with all log methods
 */
export const logger = {
  /**
   * Debug level logging - for development debugging
   */
  debug(message: string, extra?: Record<string, unknown>): void {
    log('debug', message, undefined, undefined, extra);
  },

  /**
   * Info level logging - for general information
   */
  info(message: string, extra?: Record<string, unknown>): void {
    log('info', message, undefined, undefined, extra);
  },

  /**
   * Warning level logging - for potential issues
   */
  warn(message: string, extra?: Record<string, unknown>): void {
    log('warn', message, undefined, undefined, extra);
  },

  /**
   * Error level logging - for errors and exceptions
   */
  error(message: string, error?: Error | unknown, extra?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : undefined;
    log('error', message, undefined, err, extra);
  },

  /**
   * Create a scoped logger with a context prefix
   * Useful for module-specific logging
   *
   * @example
   * const log = logger.scope('OfflineStorage');
   * log.info('Database initialized'); // [INFO] [OfflineStorage] Database initialized
   */
  scope(context: string) {
    return {
      debug(message: string, extra?: Record<string, unknown>): void {
        log('debug', message, context, undefined, extra);
      },
      info(message: string, extra?: Record<string, unknown>): void {
        log('info', message, context, undefined, extra);
      },
      warn(message: string, extra?: Record<string, unknown>): void {
        log('warn', message, context, undefined, extra);
      },
      error(message: string, error?: Error | unknown, extra?: Record<string, unknown>): void {
        const err = error instanceof Error ? error : undefined;
        log('error', message, context, err, extra);
      },
    };
  },
};

export default logger;
