/**
 * Represents a logging interface with structured logging capabilities
 */
export interface Logger {
  /**
   * Logs an informational message with optional metadata
   * @param message - The log message
   * @param metadata - Optional structured data to include with the log
   */
  info: (message: string, metadata?: object) => void;
}

/**
 * Type guard to check if a value is an Error object
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if a value implements the Logger interface
 * @param value - The value to check
 * @returns True if the value has a valid `info` method matching Logger interface
 */
export function hasInfoMethod(value: unknown): value is Logger {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const potentialLogger = value as Partial<Logger>;
  return typeof potentialLogger.info === 'function';
}
/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if a value is an object with a message property
 */
export function isObjectWithMessage(value: unknown): value is { message: string } {
  return isObject(value) && 'message' in value && typeof (value as {message: unknown}).message === 'string';
}

/**
 * Safely cast unknown error to Error type
 */
export function toError(value: unknown): Error {
  return isError(value) ? value : new Error(String(value));
}
