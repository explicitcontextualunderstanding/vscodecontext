import type { ErrorMetrics } from './types.js';
export declare class ErrorMonitor {
  private static instance;
  private readonly errorMetrics;
  private readonly logger;
  private readonly patternThreshold;
  private constructor();
  static getInstance(): ErrorMonitor;
  trackError(error: Error, context?: Record<string, unknown>): void;
  getMetrics(): Map<string, ErrorMetrics>;
  resetMetrics(): void;
  private updateMetrics;
  private detectPatterns;
  private findPatterns;
  private getErrorCode;
}
export declare const errorMonitor: ErrorMonitor;
