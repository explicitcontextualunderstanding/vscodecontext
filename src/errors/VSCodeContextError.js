/**
 * Base error class for VSCode Context extension
 */
export class VSCodeContextError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'VSCodeContextError';
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
/**
 * Configuration related errors
 */
export class ConfigurationError extends VSCodeContextError {
  constructor(message, code = 'CONFIG_ERROR') {
    super(message, code);
    this.name = 'ConfigurationError';
  }
}
/**
 * Context provider related errors
 */
export class ContextProviderError extends VSCodeContextError {
  constructor(message, code = 'CONTEXT_PROVIDER_ERROR', operation) {
    super(message, code);
    this.operation = operation;
    this.name = 'ContextProviderError';
  }
}
/**
 * Cache related errors
 */
export class CacheError extends VSCodeContextError {
  constructor(message, code = 'CACHE_ERROR') {
    super(message, code);
    this.name = 'CacheError';
  }
}
/**
 * Output related errors
 */
export class OutputError extends VSCodeContextError {
  constructor(message, code = 'OUTPUT_ERROR') {
    super(message, code);
    this.name = 'OutputError';
  }
}
//# sourceMappingURL=VSCodeContextError.js.map
