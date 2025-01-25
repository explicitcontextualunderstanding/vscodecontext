import * as vscode from 'vscode';
import type { ErrorMetrics, ErrorPattern } from './types.js';

export class ErrorLogger {
  constructor(private readonly channel: vscode.OutputChannel) {}

  logError(
    error: Error,
    errorCode: string,
    metrics?: ErrorMetrics,
    context?: Record<string, unknown>,
  ): void {
    const timestamp = new Date().toISOString();

    const message = [
      `[${timestamp}] Error Occurrence:`,
      `Code: ${errorCode}`,
      `Message: ${error.message}`,
      metrics ? `Occurrence Count: ${metrics.count}` : undefined,
      context ? `Context: ${JSON.stringify(context, null, 2)}` : undefined,
      error.stack ? `Stack: ${error.stack}` : undefined,
    ]
      .filter(Boolean)
      .join('\n');

    this.channel.appendLine(message + '\n');
  }

  logPattern(pattern: ErrorPattern): void {
    const message = `Error Pattern Detected: ${pattern.code} occurred ${pattern.frequency} times in the last ${pattern.timeWindow / 60000} minutes`;
    this.channel.appendLine(message);
    vscode.window.showWarningMessage(message);
  }

  logTelemetry(pattern: ErrorPattern): void {
    this.channel.appendLine(
      `[Telemetry] Pattern detected: ${JSON.stringify(pattern)}`,
    );
  }
}
