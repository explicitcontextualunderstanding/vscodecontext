import { Logger } from './loggingInterface';

export class DevelopmentLogger implements Logger {
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

  // Backward compatibility
  log(message: string): void {
    this.info(message);
  }
}
