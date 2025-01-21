/**
 * Base error class for VSCode Context extension
 */
export class VSCodeContextError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'VSCodeContextError';
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Configuration related errors
 */
export class ConfigurationError extends VSCodeContextError {
  constructor(message: string, code = 'CONFIG_ERROR') {
    super(message, code);
    this.name = 'ConfigurationError';
  }
}

/**
 * Context provider related errors
 */
export class ContextProviderError extends VSCodeContextError {
  constructor(
    message: string,
    code = 'CONTEXT_PROVIDER_ERROR',
    public readonly operation?: string,
  ) {
    super(message, code);
    this.name = 'ContextProviderError';
  }
}

/**
 * Cache related errors
 */
export class CacheError extends VSCodeContextError {
  constructor(message: string, code = 'CACHE_ERROR') {
    super(message, code);
    this.name = 'CacheError';
  }
}

/**
 * Output related errors
 */
export class OutputError extends VSCodeContextError {
  constructor(message: string, code = 'OUTPUT_ERROR') {
    super(message, code);
    this.name = 'OutputError';
  }
}
