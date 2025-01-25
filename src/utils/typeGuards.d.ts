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
export declare function isError(value: unknown): value is Error;
/**
 * Type guard to check if a value implements the Logger interface
 * @param value - The value to check
 * @returns True if the value has a valid `info` method matching Logger interface
 */
export declare function hasInfoMethod(value: unknown): value is Logger;
/**
 * Type guard to check if a value is a non-null object
 */
export declare function isObject(value: unknown): value is object;
/**
 * Type guard to check if a value is an object with a message property
 */
export declare function isObjectWithMessage(value: unknown): value is {
  message: string;
};
/**
 * Safely cast unknown error to Error type
 */
export declare function toError(value: unknown): Error;
