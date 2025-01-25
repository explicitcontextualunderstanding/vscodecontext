import * as vscode from 'vscode';
import type { ErrorMetrics, ErrorPattern } from './types.js';
export declare class ErrorLogger {
  private readonly channel;
  constructor(channel: vscode.OutputChannel);
  logError(
    error: Error,
    errorCode: string,
    metrics?: ErrorMetrics,
    context?: Record<string, unknown>,
  ): void;
  logPattern(pattern: ErrorPattern): void;
  logTelemetry(pattern: ErrorPattern): void;
}
