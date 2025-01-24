/**
 * Utility class for managing timeouts with cleanup
 */
export class Timer {
  constructor(callback, delayMs) {
    this.callback = callback;
    this.delayMs = delayMs;
    this.handle = null;
  }
  start() {
    this.stop();
    this.handle = globalThis.setTimeout(() => {
      this.callback();
      this.handle = null;
    }, this.delayMs);
  }
  stop() {
    if (this.handle) {
      globalThis.clearTimeout(this.handle);
      this.handle = null;
    }
  }
  isRunning() {
    return this.handle !== null;
  }
}
/**
 * Utility for time-based calculations
 */
export class TimeWindow {
  constructor(windowMs, lastEventTime = 0) {
    this.windowMs = windowMs;
    this.lastEventTime = lastEventTime;
  }
  reset() {
    this.lastEventTime = Date.now();
  }
  isExpired() {
    return this.getTimeElapsed() >= this.windowMs;
  }
  getTimeElapsed() {
    return Date.now() - this.lastEventTime;
  }
  getTimeRemaining() {
    const remaining = this.windowMs - this.getTimeElapsed();
    return remaining > 0 ? remaining : 0;
  }
}
//# sourceMappingURL=timer.js.map
