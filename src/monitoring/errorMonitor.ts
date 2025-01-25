import * as vscode from 'vscode';
import { VSCodeContextError } from '../errors/VSCodeContextError';
import { ErrorLogger } from './errorLogger';
import type { ErrorMetrics, ErrorPattern } from './types';

export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private readonly errorMetrics: Map<string, ErrorMetrics> = new Map();
  private readonly logger: ErrorLogger;
  private readonly patternThreshold = {
    frequency: 3,
    timeWindow: 5 * 60 * 1000, // 5 minutes in milliseconds
  };

  private constructor() {
    const channel = vscode.window.createOutputChannel(
      'VSCode Context Error Monitor',
    );
    this.logger = new ErrorLogger(channel);
  }

  public static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  public trackError(error: Error, context?: Record<string, unknown>): void {
    const errorCode = this.getErrorCode(error);
    const metrics = this.updateMetrics(errorCode, context);
    this.logger.logError(error, errorCode, metrics, context);
    this.detectPatterns();
  }

  public getMetrics(): Map<string, ErrorMetrics> {
    return new Map(this.errorMetrics);
  }

  public resetMetrics(): void {
    this.errorMetrics.clear();
  }

  private updateMetrics(
    errorCode: string,
    context?: Record<string, unknown>,
  ): ErrorMetrics {
    const currentMetrics = this.errorMetrics.get(errorCode) || {
      count: 0,
      lastOccurrence: new Date(),
      contexts: [],
    };

    currentMetrics.count++;
    currentMetrics.lastOccurrence = new Date();

    if (context) {
      currentMetrics.contexts.push(context);
      if (currentMetrics.contexts.length > 10) {
        currentMetrics.contexts.shift();
      }
    }

    this.errorMetrics.set(errorCode, currentMetrics);
    return currentMetrics;
  }

  private detectPatterns(): void {
    const patterns = this.findPatterns();
    patterns.forEach((pattern) => {
      this.logger.logPattern(pattern);
      this.logger.logTelemetry(pattern);
    });
  }

  private findPatterns(): ErrorPattern[] {
    const patterns: ErrorPattern[] = [];
    const now = Date.now();
    const timeWindow = now - this.patternThreshold.timeWindow;

    this.errorMetrics.forEach((metrics, code) => {
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

    return patterns;
  }

  private getErrorCode(error: Error): string {
    if (error instanceof VSCodeContextError) {
      return error.code;
    }
    return error.name || 'UNKNOWN_ERROR';
  }
}

export const errorMonitor = ErrorMonitor.getInstance();
