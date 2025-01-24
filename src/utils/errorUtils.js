import * as vscode from 'vscode';
import { VSCodeContextError } from '../errors/VSCodeContextError';
import { errorMonitor } from '../monitoring/errorMonitor';
export function withErrorHandling(fn, metadata, channel) {
  try {
    const result = fn();
    const promise =
      result instanceof Promise ? result : Promise.resolve(result);
    return promise.catch((error) => {
      const err = error instanceof Error ? error : new Error(String(error));
      handleError(err, metadata, channel);
      return Promise.reject(err);
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    handleError(err, metadata, channel);
    return Promise.reject(err);
  }
}
function isErrorWithMessage(error) {
  return error instanceof Error;
}
export function handleError(error, metadata, channel) {
  const timestamp = new Date().toISOString();
  const contextStr = metadata.context
    ? `\nContext: ${JSON.stringify(metadata.context, null, 2)}`
    : '';
  let fullMessage = `[${timestamp}] ERROR in ${metadata.operation}: `;
  let stack = 'No stack trace available';
  // Convert to guaranteed Error instance upfront
  const err = error instanceof Error ? error : new Error(String(error));
  fullMessage += err.message;
  stack = err.stack ?? 'No stack trace available';
  channel.appendLine(fullMessage);
  channel.appendLine(stack ?? 'No stack trace available');
  if (contextStr) {
    channel.appendLine(contextStr);
  }
  // Convert to Error instance if needed
  const trackedError = isErrorWithMessage(error)
    ? error
    : new Error(String(error));
  errorMonitor.trackError(trackedError, metadata);
  // Error already tracked by errorMonitor and logged to channel
}
/**
 * Validate input data
 */
export function validateInput(input, validator, errorMessage) {
  if (!validator(input)) {
    throw new VSCodeContextError(errorMessage, 'INVALID_INPUT');
  }
}
/**
 * Create a formatted error response
 */
export function createErrorResponse(error) {
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
function getUserFriendlyMessage(error) {
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
 * Central error handler
 */
export function handleErrorWithUserMessage(error, context, channel) {
  // Log the error
  handleError(
    error,
    { operation: 'handleErrorWithUserMessage', context },
    channel || vscode.window.createOutputChannel('VSCode Context Error'),
  );
  // Show error message to user based on error type
  const userMessage = getUserFriendlyMessage(error);
  vscode.window.showErrorMessage(userMessage);
}
//# sourceMappingURL=errorUtils.js.map
