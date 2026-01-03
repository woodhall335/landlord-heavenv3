/**
 * Production-Safe Logger
 *
 * Provides structured logging with environment-aware log levels.
 * In production, debug/info logs are suppressed unless LOG_LEVEL is set.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('User signed up', { userId: '123' });
 *   logger.error('Payment failed', { error: err.message });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get the current log level from environment
 */
function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;

  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel;
  }

  // Default: production = warn, development = debug
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'warn' : 'debug';
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  const currentLevel = getLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Sanitize context to remove sensitive data
 */
function sanitizeContext(context: LogContext): LogContext {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'api_key',
    'apiKey',
    'authorization',
    'cookie',
    'session',
    'credit_card',
    'creditCard',
    'ssn',
    'stripe_key',
    'supabase_key',
  ];

  const sanitized: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(
      (s) => lowerKey.includes(s.toLowerCase())
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value as LogContext);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Format log message for output
 */
function formatMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (context && Object.keys(context).length > 0) {
    const sanitized = sanitizeContext(context);
    return `${prefix} ${message} ${JSON.stringify(sanitized)}`;
  }

  return `${prefix} ${message}`;
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return;

  const formattedMessage = formatMessage(level, message, context);

  switch (level) {
    case 'debug':
      console.debug(formattedMessage);
      break;
    case 'info':
      console.info(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'error':
      console.error(formattedMessage);
      break;
  }
}

/**
 * Logger instance
 */
export const logger = {
  /**
   * Debug level - only in development or when LOG_LEVEL=debug
   */
  debug: (message: string, context?: LogContext) => log('debug', message, context),

  /**
   * Info level - general information, suppressed in production by default
   */
  info: (message: string, context?: LogContext) => log('info', message, context),

  /**
   * Warn level - warnings, always logged
   */
  warn: (message: string, context?: LogContext) => log('warn', message, context),

  /**
   * Error level - errors, always logged
   */
  error: (message: string, context?: LogContext) => log('error', message, context),
};

export default logger;
