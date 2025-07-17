/**
 * Logger utility for consistent logging across the application
 * Supports different log levels and formats based on environment
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  format: 'json' | 'text';
  includeTimestamp: boolean;
  enableConsole: boolean;
  remoteEndpoint?: string;
}

// Default configuration based on environment
const defaultConfig: LoggerConfig = {
  minLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  format: import.meta.env.PROD ? 'json' : 'text',
  includeTimestamp: true,
  enableConsole: true,
  remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT,
};

// Current configuration
let config: LoggerConfig = { ...defaultConfig };

/**
 * Configure the logger
 * @param newConfig - Partial configuration to merge with current config
 */
export const configureLogger = (newConfig: Partial<LoggerConfig>): void => {
  config = { ...config, ...newConfig };
};

/**
 * Format a log message based on configuration
 */
const formatLogMessage = (level: LogLevel, message: string, data?: any): string | object => {
  const timestamp = config.includeTimestamp ? new Date().toISOString() : undefined;
  const levelName = LogLevel[level];

  if (config.format === 'json') {
    return {
      level: levelName,
      message,
      ...(data && { data }),
      ...(timestamp && { timestamp }),
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION || 'unknown',
    };
  }

  // Text format
  let formattedMessage = '';
  if (timestamp) {
    formattedMessage += `[${timestamp}] `;
  }
  formattedMessage += `[${levelName}] ${message}`;
  if (data) {
    formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
  }
  return formattedMessage;
};

/**
 * Send log to remote endpoint if configured
 */
const sendRemoteLog = (level: LogLevel, message: string, data?: any): void => {
  if (!config.remoteEndpoint || level < config.minLevel) return;

  const logData = formatLogMessage(level, message, data);
  
  // Use sendBeacon for better reliability during page unload
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(logData)], { type: 'application/json' });
    navigator.sendBeacon(config.remoteEndpoint, blob);
  } else {
    // Fallback to fetch
    fetch(config.remoteEndpoint, {
      method: 'POST',
      body: JSON.stringify(logData),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Silently fail - we don't want logging errors to cause more logging
    });
  }
};

/**
 * Log a debug message
 */
export const debug = (message: string, data?: any): void => {
  if (config.minLevel <= LogLevel.DEBUG) {
    if (config.enableConsole) {
      console.debug(formatLogMessage(LogLevel.DEBUG, message, data));
    }
    sendRemoteLog(LogLevel.DEBUG, message, data);
  }
};

/**
 * Log an info message
 */
export const info = (message: string, data?: any): void => {
  if (config.minLevel <= LogLevel.INFO) {
    if (config.enableConsole) {
      console.info(formatLogMessage(LogLevel.INFO, message, data));
    }
    sendRemoteLog(LogLevel.INFO, message, data);
  }
};

/**
 * Log a warning message
 */
export const warn = (message: string, data?: any): void => {
  if (config.minLevel <= LogLevel.WARN) {
    if (config.enableConsole) {
      console.warn(formatLogMessage(LogLevel.WARN, message, data));
    }
    sendRemoteLog(LogLevel.WARN, message, data);
  }
};

/**
 * Log an error message
 */
export const error = (message: string, error?: Error, data?: any): void => {
  if (config.minLevel <= LogLevel.ERROR) {
    const errorData = error ? {
      name: error.name,
      message: error.message,
      stack: import.meta.env.DEV ? error.stack : undefined,
      ...data,
    } : data;

    if (config.enableConsole) {
      console.error(formatLogMessage(LogLevel.ERROR, message, errorData));
    }
    sendRemoteLog(LogLevel.ERROR, message, errorData);
  }
};

/**
 * Create a scoped logger with a prefix
 */
export const createScopedLogger = (scope: string) => {
  return {
    debug: (message: string, data?: any) => debug(`[${scope}] ${message}`, data),
    info: (message: string, data?: any) => info(`[${scope}] ${message}`, data),
    warn: (message: string, data?: any) => warn(`[${scope}] ${message}`, data),
    error: (message: string, error?: Error, data?: any) => error(`[${scope}] ${message}`, error, data),
  };
};

// Export default logger object
export default {
  configure: configureLogger,
  debug,
  info,
  warn,
  error,
  createScoped: createScopedLogger,
};