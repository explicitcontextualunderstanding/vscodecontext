/**
 * Wraps an async function with proper error handling
 * @param fn - The async function to execute
 * @param metadata - Contextual information about the operation
 * @returns The result of the async function
 * @throws {ContextProviderError} When operation fails
 */
export declare function withErrorHandling<T>(
  fn: () => Promise<T>,
  metadata: {
    operation: string;
  },
): Promise<T>;
