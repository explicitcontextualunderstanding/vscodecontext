import * as vscode from 'vscode';
import { VSCodeContextError } from '../errors/VSCodeContextError';
export class ErrorMonitor {
    constructor() {
        this.errorMetrics = new Map();
        // Threshold for error patterns (e.g., 3 similar errors in 5 minutes)
        this.patternThreshold = {
            frequency: 3,
            timeWindow: 5 * 60 * 1000, // 5 minutes in milliseconds
        };
        this.channel = vscode.window.createOutputChannel('VSCode Context Error Monitor');
    }
    static getInstance() {
        if (!ErrorMonitor.instance) {
            ErrorMonitor.instance = new ErrorMonitor();
        }
        return ErrorMonitor.instance;
    }
    /**
     * Track an error occurrence
     */
    trackError(error, context) {
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
    getMetrics() {
        return new Map(this.errorMetrics);
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.errorMetrics.clear();
    }
    /**
     * Detect error patterns
     */
    detectPatterns() {
        const patterns = [];
        this.errorMetrics.forEach((metrics, code) => {
            const now = Date.now();
            const timeWindow = now - this.patternThreshold.timeWindow;
            if (metrics.count >= this.patternThreshold.frequency &&
                metrics.lastOccurrence.getTime() >= timeWindow) {
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
    reportPatterns(patterns) {
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
    getErrorCode(error) {
        if (error instanceof VSCodeContextError) {
            return error.code;
        }
        return error.name || 'UNKNOWN_ERROR';
    }
    /**
     * Log error occurrence to output channel
     */
    logErrorOccurrence(error, context) {
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
    sendTelemetry(pattern) {
        // Implementation would depend on telemetry system
        // This is a placeholder for future implementation
        this.channel.appendLine(`[Telemetry] Pattern detected: ${JSON.stringify(pattern)}`);
    }
}
// Export singleton instance
export const errorMonitor = ErrorMonitor.getInstance();
//# sourceMappingURL=errorMonitor.js.map