/**
 * Logger Utility for Web App
 *
 * Provides a centralized logging abstraction that can be:
 * - Conditionally disabled in production
 * - Extended with remote error reporting (Sentry, LogRocket)
 * - Configured per log level
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  remoteEnabled: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isDevelopment = process.env.NODE_ENV === 'development';

let config: LoggerConfig = {
  enabled: isDevelopment,
  minLevel: 'debug',
  remoteEnabled: false,
};

export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
}

function formatMessage(level: LogLevel, message: string, context?: string): string {
  const parts: string[] = [];
  parts.push(`[${level.toUpperCase()}]`);
  if (context) {
    parts.push(`[${context}]`);
  }
  parts.push(message);
  return parts.join(' ');
}

function sendToRemote(
  _level: LogLevel,
  _message: string,
  _error?: Error,
  _extra?: Record<string, unknown>
): void {
  if (!config.remoteEnabled) return;
  // Placeholder for Sentry/LogRocket integration
  // import * as Sentry from '@sentry/nextjs';
  // if (_level === 'error' && _error) {
  //   Sentry.captureException(_error, { extra: { message: _message, ..._extra } });
  // }
}

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

export const logger = {
  debug(message: string, extra?: Record<string, unknown>): void {
    log('debug', message, undefined, undefined, extra);
  },

  info(message: string, extra?: Record<string, unknown>): void {
    log('info', message, undefined, undefined, extra);
  },

  warn(message: string, extra?: Record<string, unknown>): void {
    log('warn', message, undefined, undefined, extra);
  },

  error(message: string, error?: Error | unknown, extra?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : undefined;
    log('error', message, undefined, err, extra);
  },

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
