import type { Logger} from './loggingInterface';
import { LogLevel } from './loggingInterface';

export class DevelopmentLogger implements Logger {
  private context: Record<string, unknown> = {};
  private currentLevel: LogLevel = LogLevel.DEBUG;

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  getLevel(): LogLevel {
    return this.currentLevel;
  }

  addContext(key: string, value: unknown): void {
    this.context[key] = value;
  }

  removeContext(key: string): void {
    delete this.context[key];
  }

  getContext(): Record<string, unknown> {
    return { ...this.context };
  }

  verbose(message: string, metadata?: Record<string, unknown>): void {
    const mergedMetadata = { ...this.context, ...(metadata || {}) };
    console.debug('[VERBOSE]', message, mergedMetadata);
  }
  debug(message: string, metadata?: Record<string, unknown>): void {
    console.debug('[DEBUG]', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    console.info('[INFO]', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn('[WARN]', message, metadata);
  }

  error(error: Error | string, metadata?: Record<string, unknown>): void {
    console.error('[ERROR]', error, metadata);
  }

  log(levelOrMessage: LogLevel | string, message?: string, metadata?: Record<string, unknown>): void {
    const mergedMetadata = { ...this.context, ...(metadata || {}) };
    
    if (typeof levelOrMessage === 'string') {
      // Backward compatibility
      this.info(levelOrMessage, mergedMetadata);
    } else {
      // Structured logging
      switch (levelOrMessage) {
        case LogLevel.ERROR:
          this.error(message || '', mergedMetadata);
          break;
        case LogLevel.WARN:
          this.warn(message || '', mergedMetadata);
          break;
        case LogLevel.INFO:
          this.info(message || '', mergedMetadata);
          break;
        case LogLevel.DEBUG:
          this.debug(message || '', mergedMetadata);
          break;
        case LogLevel.VERBOSE:
          this.verbose(message || '', mergedMetadata);
          break;
      }
    }
  }
}
