import type { Logger } from './loggingInterface';
import { LogLevel } from './loggingInterface';
export declare class DevelopmentLogger implements Logger {
    private context;
    private currentLevel;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    addContext(key: string, value: unknown): void;
    removeContext(key: string): void;
    getContext(): Record<string, unknown>;
    private _writeLog;
    verbose(message: string, metadata?: Record<string, unknown>): void;
    debug(message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    error(error: Error | string, metadata?: Record<string, unknown>): void;
    log(levelOrMessage: LogLevel | string, message?: string, metadata?: Record<string, unknown>): void;
}
