interface Logger {
  info: (message: string, metadata?: object) => void;
}

/**
 * Type guard to check if a value is an Error object
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if a value has an 'info' method
 */
export function hasInfoMethod(value: unknown): value is Logger {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const potentialLogger = value as Partial<Logger>;
  return typeof potentialLogger.info === 'function';
}

/**
 * Safely cast unknown error to Error type
 */
export function toError(value: unknown): Error {
  return isError(value) ? value : new Error(String(value));
}