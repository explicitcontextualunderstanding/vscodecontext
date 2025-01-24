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
export declare class ErrorMonitor {
    private static instance;
    private readonly errorMetrics;
    private readonly channel;
    private readonly patternThreshold;
    private constructor();
    static getInstance(): ErrorMonitor;
    /**
     * Track an error occurrence
     */
    trackError(error: Error, context?: Record<string, unknown>): void;
    /**
     * Get current error metrics
     */
    getMetrics(): Map<string, ErrorMetrics>;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    /**
     * Detect error patterns
     */
    private detectPatterns;
    /**
     * Report detected error patterns
     */
    private reportPatterns;
    /**
     * Get error code from error object
     */
    private getErrorCode;
    /**
     * Log error occurrence to output channel
     */
    private logErrorOccurrence;
    /**
     * Send telemetry data if enabled
     */
    private sendTelemetry;
}
export declare const errorMonitor: ErrorMonitor;
