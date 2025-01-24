/**
 * Type guard to check if a value is an Error object
 */
export function isError(value) {
  return value instanceof Error;
}
/**
 * Type guard to check if a value implements the Logger interface
 * @param value - The value to check
 * @returns True if the value has a valid `info` method matching Logger interface
 */
export function hasInfoMethod(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const potentialLogger = value;
  return typeof potentialLogger.info === 'function';
}
/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value) {
  return typeof value === 'object' && value !== null;
}
/**
 * Type guard to check if a value is an object with a message property
 */
export function isObjectWithMessage(value) {
  return (
    isObject(value) && 'message' in value && typeof value.message === 'string'
  );
}
/**
 * Safely cast unknown error to Error type
 */
export function toError(value) {
  return isError(value) ? value : new Error(String(value));
}
//# sourceMappingURL=typeGuards.js.map
