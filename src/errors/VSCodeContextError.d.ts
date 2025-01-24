/**
 * Base error class for VSCode Context extension
 */
export declare class VSCodeContextError extends Error {
  readonly code: string;
  constructor(message: string, code: string);
}
/**
 * Configuration related errors
 */
export declare class ConfigurationError extends VSCodeContextError {
  constructor(message: string, code?: string);
}
/**
 * Context provider related errors
 */
export declare class ContextProviderError extends VSCodeContextError {
  readonly operation?: string | undefined;
  constructor(message: string, code?: string, operation?: string | undefined);
}
/**
 * Cache related errors
 */
export declare class CacheError extends VSCodeContextError {
  constructor(message: string, code?: string);
}
/**
 * Output related errors
 */
export declare class OutputError extends VSCodeContextError {
  constructor(message: string, code?: string);
}
