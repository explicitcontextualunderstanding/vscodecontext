import * as vscode from 'vscode';
import { VSCodeContextError } from '../errors/VSCodeContextError.js';
import { ErrorLogger } from './errorLogger.js';
export class ErrorMonitor {
  constructor() {
    this.errorMetrics = new Map();
    this.patternThreshold = {
      frequency: 3,
      timeWindow: 5 * 60 * 1000, // 5 minutes in milliseconds
    };
    const channel = vscode.window.createOutputChannel(
      'VSCode Context Error Monitor',
    );
    this.logger = new ErrorLogger(channel);
  }
  static getInstance() {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }
  trackError(error, context) {
    const errorCode = this.getErrorCode(error);
    const metrics = this.updateMetrics(errorCode, context);
    this.logger.logError(error, errorCode, metrics, context);
    this.detectPatterns();
  }
  getMetrics() {
    return new Map(this.errorMetrics);
  }
  resetMetrics() {
    this.errorMetrics.clear();
  }
  updateMetrics(errorCode, context) {
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
  detectPatterns() {
    const patterns = this.findPatterns();
    patterns.forEach((pattern) => {
      this.logger.logPattern(pattern);
      this.logger.logTelemetry(pattern);
    });
  }
  findPatterns() {
    const patterns = [];
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
  getErrorCode(error) {
    if (error instanceof VSCodeContextError) {
      return error.code;
    }
    return error.name || 'UNKNOWN_ERROR';
  }
}
export const errorMonitor = ErrorMonitor.getInstance();
//# sourceMappingURL=errorMonitor.js.map
