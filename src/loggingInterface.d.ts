export declare enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}
export interface Logger {
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  error(error: Error | string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
  verbose(message: string, metadata?: Record<string, unknown>): void;
  log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
  ): void;
  log(message: string): void;
  addContext(key: string, value: unknown): void;
  removeContext(key: string): void;
  getContext(): Record<string, unknown>;
}
