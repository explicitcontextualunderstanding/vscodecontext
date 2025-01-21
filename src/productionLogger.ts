import { Logger, LogLevel } from './loggingInterface';
import winston from 'winston';
import { VSCodeContextError } from './errors/VSCodeContextError';

const { combine, timestamp, json } = winston.format;

export class ProductionLogger implements Logger {
  private logger: winston.Logger;
  private context: Record<string, unknown> = {};
  private currentLevel: LogLevel = LogLevel.INFO;

  constructor() {
    this.logger = winston.createLogger({
      level: this.currentLevel,
      format: combine(
        timestamp(),
        json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/extension.log',
          maxsize: 1024 * 1024 * 5, // 5MB
          maxFiles: 5
        })
      ]
    });
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
    this.logger.level = level;
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
    this.log(LogLevel.VERBOSE, message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug(message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info(message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn(message, metadata);
  }

  error(error: Error | string, metadata?: Record<string, unknown>): void {
    if (typeof error === 'string') {
      this.logger.error(error, metadata);
    } else {
      const errorData = {
        message: error.message,
        stack: error.stack,
        code: error instanceof VSCodeContextError ? error.code : undefined
      };
      this.logger.error('Error occurred', { ...metadata, error: errorData });
    }
  }

  log(levelOrMessage: LogLevel | string, message?: string, metadata?: Record<string, unknown>): void {
    const mergedMetadata = { ...this.context, ...(metadata || {}) };
    
    if (typeof levelOrMessage === 'string') {
      // Backward compatibility
      this.info(levelOrMessage, mergedMetadata);
    } else {
      // Structured logging
      this.logger.log(levelOrMessage, message || '', mergedMetadata);
    }
  }
}
