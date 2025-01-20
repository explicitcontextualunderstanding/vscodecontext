import * as vscode from 'vscode';
import { VSCodeContextError } from '../errors/VSCodeContextError';

/**
 * Log an error with context
 */
export function logError(
  error: Error,
  context?: Record<string, unknown>,
  channel?: vscode.OutputChannel,
): void {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ${error.name}: ${error.message}`;
  const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
  const stackTrace = error.stack ? `\nStack: ${error.stack}` : '';

  const fullMessage = `${errorMessage}${contextStr}${stackTrace}\n`;

  // Log to output channel if available
  if (channel) {
    channel.appendLine(fullMessage);
  }

  // Also log to console for development
  console.error(fullMessage);
}

/**
 * Central error handler
 */
export function handleError(
  error: Error,
  context?: Record<string, unknown>,
  channel?: vscode.OutputChannel,
): void {
  // Log the error
  logError(error, context, channel);

  // Show error message to user based on error type
  const userMessage = getUserFriendlyMessage(error);
  vscode.window.showErrorMessage(userMessage);
}

/**
 * Validate input data
 */
export function validateInput<T>(
  input: T,
  validator: (input: T) => boolean,
  errorMessage: string,
): void {
  if (!validator(input)) {
    throw new VSCodeContextError(errorMessage, 'INVALID_INPUT');
  }
}

/**
 * Create a formatted error response
 */
export function createErrorResponse(error: Error): {
  success: false;
  error: {
    message: string;
    code?: string;
    name: string;
  };
} {
  return {
    success: false,
    error: {
      message: error.message,
      code: error instanceof VSCodeContextError ? error.code : undefined,
      name: error.name,
    },
  };
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(error: Error): string {
  if (error instanceof VSCodeContextError) {
    switch (error.code) {
      case 'CONFIG_ERROR':
        return 'Configuration error: Please check your settings';
      case 'CONTEXT_ERROR':
        return 'Error gathering VS Code context';
      case 'CACHE_ERROR':
        return 'Cache operation failed';
      case 'OUTPUT_ERROR':
        return 'Error processing output';
      case 'INVALID_INPUT':
        return 'Invalid input provided';
      default:
        return error.message;
    }
  }

  // Generic error message for unknown errors
  return 'An unexpected error occurred. Please check the output log for details.';
}

/**
 * Wrap an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: Record<string, unknown>,
  channel?: vscode.OutputChannel,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), context, channel);
    throw error;
  }
}
