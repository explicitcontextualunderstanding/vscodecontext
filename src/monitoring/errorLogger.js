import * as vscode from 'vscode';
export class ErrorLogger {
  constructor(channel) {
    this.channel = channel;
  }
  logError(error, errorCode, metrics, context) {
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
  logPattern(pattern) {
    const message = `Error Pattern Detected: ${pattern.code} occurred ${pattern.frequency} times in the last ${pattern.timeWindow / 60000} minutes`;
    this.channel.appendLine(message);
    vscode.window.showWarningMessage(message);
  }
  logTelemetry(pattern) {
    this.channel.appendLine(
      `[Telemetry] Pattern detected: ${JSON.stringify(pattern)}`,
    );
  }
}
//# sourceMappingURL=errorLogger.js.map
