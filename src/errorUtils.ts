import { ContextProviderError } from './errors/VSCodeContextError';

export function withErrorHandling<T>(
  fn: () => Promise<T>,
  metadata: { operation: string }
): Promise<T> {
  try {
    return fn();
  } catch (error) {
    throw new ContextProviderError(
      `Failed during ${metadata.operation}: ${error instanceof Error ? error.message : String(error)}`,
      'OPERATION_FAILED',
      metadata.operation
    );
  }
}