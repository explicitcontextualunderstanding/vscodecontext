import * as vscode from 'vscode';
import type { ContextCategory } from '../interfaces/IContextProvider';
export interface ErrorMetadata {
    operation: string;
    category?: ContextCategory;
    context?: Record<string, unknown>;
    [key: string]: unknown;
}
export declare function withErrorHandling<T>(fn: () => T | Promise<T>, metadata: ErrorMetadata, channel: vscode.OutputChannel): Promise<T>;
export declare function handleError(error: unknown, metadata: ErrorMetadata, channel: vscode.OutputChannel): void;
/**
 * Validate input data
 */
export declare function validateInput<T>(input: T, validator: (input: T) => boolean, errorMessage: string): void;
/**
 * Create a formatted error response
 */
export declare function createErrorResponse(error: Error): {
    success: false;
    error: {
        message: string;
        code?: string;
        name: string;
    };
};
/**
 * Central error handler
 */
export declare function handleErrorWithUserMessage(error: Error, context?: Record<string, unknown>, channel?: vscode.OutputChannel): void;
