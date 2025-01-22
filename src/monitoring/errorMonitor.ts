import * as vscode from 'vscode';

import { VSCodeContextError } from '../errors/VSCodeContextError';

/**
 * Represents metrics collected about errors in the extension
 *
 * @property {number} count - Total number of occurrences of this error
 * @property {Date} lastOccurrence - Timestamp of the most recent occurrence
 * @property {Array<Record<string, unknown>>} contexts - Array of context objects captured with each occurrence (last 10 only)
 */
export interface ErrorMetrics {
  /** Total number of occurrences of this error */
  count: number;
  /** Timestamp of the most recent occurrence */
  lastOccurrence: Date;
  /** Array of context objects captured with each occurrence (last 10 only) */
  contexts: Array<Record<string, unknown>>;
}

interface ErrorPattern {
  code: string;
  frequency: number;
  timeWindow: number; // in milliseconds
}

export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private readonly errorMetrics: Map<string, ErrorMetrics> = new Map();
  private readonly channel: vscode.OutputChannel;

  // Threshold for error patterns (e.g., 3 similar errors in 5 minutes)
  private readonly patternThreshold = {
    frequency: 3,
    timeWindow: 5 * 60 * 1000, // 5 minutes in milliseconds
  };

  private constructor() {
    this.channel = vscode.window.createOutputChannel('VSCode Context Error Monitor');
  }

  public static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  /**
   * Track an error occurrence
   */
  public trackError(error: Error, context?: Record<string, unknown>): void {
    const errorCode = this.getErrorCode(error);
    const currentMetrics = this.errorMetrics.get(errorCode) || {
      count: 0,
      lastOccurrence: new Date(),
      contexts: [],
    };

    // Update metrics
    currentMetrics.count++;
    currentMetrics.lastOccurrence = new Date();
    if (context) {
      currentMetrics.contexts.push(context);
      // Keep only last 10 contexts to manage memory
      if (currentMetrics.contexts.length > 10) {
        currentMetrics.contexts.shift();
      }
    }

    this.errorMetrics.set(errorCode, currentMetrics);

    // Check for patterns
    this.detectPatterns();

    // Log to channel
    this.logErrorOccurrence(error, context);
  }

  /**
   * Get current error metrics
   */
  public getMetrics(): Map<string, ErrorMetrics> {
    return new Map(this.errorMetrics);
  }

  /**
   * Reset metrics
   */
  public resetMetrics(): void {
    this.errorMetrics.clear();
  }

  /**
   * Detect error patterns
   */
  private detectPatterns(): void {
    const patterns: ErrorPattern[] = [];

    this.errorMetrics.forEach((metrics, code) => {
      const now = Date.now();
      const timeWindow = now - this.patternThreshold.timeWindow;

      if (
        metrics.count >= this.patternThreshold.frequency &&
        metrics.lastOccurrence.getTime() >= timeWindow
      ) {
        patterns.push({
          code,
          frequency: metrics.count,
          timeWindow: this.patternThreshold.timeWindow,
        });
      }
    });

    if (patterns.length > 0) {
      this.reportPatterns(patterns);
    }
  }

  /**
   * Report detected error patterns
   */
  private reportPatterns(patterns: ErrorPattern[]): void {
    patterns.forEach((pattern) => {
      const message = `Error Pattern Detected: ${pattern.code} occurred ${pattern.frequency} times in the last ${pattern.timeWindow / 60000} minutes`;
      this.channel.appendLine(message);

      // Show warning to user about frequent errors
      vscode.window.showWarningMessage(message);

      // If telemetry is enabled, send pattern data
      this.sendTelemetry(pattern);
    });
  }

  /**
   * Get error code from error object
   */
  private getErrorCode(error: Error): string {
    if (error instanceof VSCodeContextError) {
      return error.code;
    }
    return error.name || 'UNKNOWN_ERROR';
  }

  /**
   * Log error occurrence to output channel
   */
  private logErrorOccurrence(error: Error, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const errorCode = this.getErrorCode(error);
    const metrics = this.errorMetrics.get(errorCode);

    const message = [
      `[${timestamp}] Error Occurrence:`,
      `Code: ${errorCode}`,
      `Message: ${error.message}`,
      `Occurrence Count: ${metrics?.count}`,
      context ? `Context: ${JSON.stringify(context, null, 2)}` : undefined,
      error.stack ? `Stack: ${error.stack}` : undefined,
    ]
      .filter(Boolean)
      .join('\n');

    this.channel.appendLine(message + '\n');
  }

  /**
   * Send telemetry data if enabled
   */
  private sendTelemetry(pattern: ErrorPattern): void {
    // Implementation would depend on telemetry system
    // This is a placeholder for future implementation
    this.channel.appendLine(`[Telemetry] Pattern detected: ${JSON.stringify(pattern)}`);
  }
}

// Export singleton instance
export const errorMonitor = ErrorMonitor.getInstance();
