import { LogLevel } from './loggingInterface';
export class DevelopmentLogger {
  constructor() {
    this.context = {};
    this.currentLevel = LogLevel.DEBUG;
  }
  setLevel(level) {
    this.currentLevel = level;
  }
  getLevel() {
    return this.currentLevel;
  }
  addContext(key, value) {
    this.context[key] = value;
  }
  removeContext(key) {
    delete this.context[key];
  }
  getContext() {
    return { ...this.context };
  }
  _writeLog(level, message, metadata) {
    const output = `[${level}] ${message} ${JSON.stringify(metadata || {})}\n`;
    process.stdout.write(output);
  }
  verbose(message, metadata) {
    const mergedMetadata = { ...this.context, ...(metadata || {}) };
    this._writeLog('VERBOSE', message, mergedMetadata);
  }
  debug(message, metadata) {
    this._writeLog('DEBUG', message, metadata);
  }
  info(message, metadata) {
    this._writeLog('INFO', message, metadata);
  }
  warn(message, metadata) {
    this._writeLog('WARN', message, metadata);
  }
  error(error, metadata) {
    const errorMessage = error instanceof Error ? error.message : error;
    this._writeLog('ERROR', errorMessage, metadata);
  }
  log(levelOrMessage, message, metadata) {
    const mergedMetadata = { ...this.context, ...(metadata || {}) };
    if (typeof levelOrMessage === 'string') {
      // Backward compatibility
      this.info(levelOrMessage, mergedMetadata);
    } else {
      // Structured logging
      switch (levelOrMessage) {
        case LogLevel.ERROR:
          this.error(message ?? '', mergedMetadata);
          break;
        case LogLevel.WARN:
          this.warn(message ?? '', mergedMetadata);
          break;
        case LogLevel.INFO:
          this.info(message ?? '', mergedMetadata);
          break;
        case LogLevel.DEBUG:
          this.debug(message ?? '', mergedMetadata);
          break;
        case LogLevel.VERBOSE:
          this.verbose(message ?? '', mergedMetadata);
          break;
      }
    }
  }
}
//# sourceMappingURL=developmentLogger.js.map
