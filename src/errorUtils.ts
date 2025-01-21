import { ContextProviderError } from './errors/VSCodeContextError';
import { isError, isObjectWithMessage } from './utils/typeGuards';

/**
 * Wraps an async function with proper error handling
 * @param fn - The async function to execute
 * @param metadata - Contextual information about the operation
 * @returns The result of the async function
 * @throws {ContextProviderError} When operation fails
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  metadata: { operation: string }
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    const getErrorMessage = (err: unknown): string => {
      if (isError(err)) return err.message;
      if (typeof err === 'string') return err;
      if (isObjectWithMessage(err)) return err.message;
      return 'Unknown error occurred';
    };
    
    const message = getErrorMessage(error);
        
    throw new ContextProviderError(
      `Failed during ${metadata.operation}: ${message}`,
      'OPERATION_FAILED',
      metadata.operation
    );
  }
}