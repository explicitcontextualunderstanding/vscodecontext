import { VSCodeContextError } from '../../errors/VSCodeContextError.js';
// import { ErrorLogger } from '../../monitoring/errorLogger.js';
// const errorLogger = new ErrorLogger({ appendLine: (message: string) => console.error(message) } as any); // Mock OutputChannel
import { Timer, TimeWindow } from './utils/timer.js';
/**
 * Implements a throttle strategy for event aggregation that limits the rate
 * at which events are processed. Only the most recent event within the throttle
 * window is processed.
 */
export class ThrottleStrategy {
  constructor(throttleMs, maxDelay = 5000) {
    this.throttleMs = throttleMs;
    this.maxDelay = maxDelay;
    this.pendingEvents = [];
    this.timeWindow = new TimeWindow(throttleMs);
  }
  async process(event, _metadata, emit) {
    this.pendingEvents.push(event);
    if (this.timeWindow.isExpired()) {
      try {
        await this.emitPendingEvents(emit);
      } catch (e) {
        throw new VSCodeContextError(
          `Failed to emit pending events: ${e}`,
          'EmitPendingEventsError',
        );
      }
      return;
    }
    if (!this.emitTimer) {
      const nextEmitDelay = Math.min(
        this.timeWindow.getTimeRemaining(),
        this.maxDelay,
      );
      this.emitTimer = new Timer(() => {
        void this.emitPendingEvents(emit).catch(() => {
          // errorLogger.logError(_e, 'ThrottleStrategyTimerError');
        });
        this.emitTimer = undefined;
      }, nextEmitDelay);
    }
  }
  async emitPendingEvents(emit) {
    if (this.pendingEvents.length === 0) {
      return;
    }
    const eventToEmit = this.pendingEvents[this.pendingEvents.length - 1];
    this.pendingEvents.length = 0;
    this.timeWindow.reset();
    await emit([eventToEmit]);
  }
  cancel() {
    this.emitTimer?.stop();
    this.emitTimer = undefined;
    this.pendingEvents.length = 0;
  }
  getThrottleDelay() {
    return this.throttleMs;
  }
  getMaxDelay() {
    return this.maxDelay;
  }
  hasPendingEvents() {
    return this.pendingEvents.length > 0;
  }
  getTimeUntilNextEmit() {
    return this.timeWindow.getTimeRemaining();
  }
}
//# sourceMappingURL=throttleStrategy.js.map
