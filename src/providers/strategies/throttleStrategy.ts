import type { AggregationStrategy, ContextEvent, EventMetadata } from '../events.js';
import { Timer, TimeWindow } from './utils/timer.js';

/**
 * Implements a throttle strategy for event aggregation that limits the rate
 * at which events are processed. Only the most recent event within the throttle
 * window is processed.
 */
export class ThrottleStrategy implements AggregationStrategy {
  private readonly timeWindow: TimeWindow;
  private readonly pendingEvents: Array<ContextEvent<unknown>> = [];
  private emitTimer: Timer | null = null;

  constructor(
    private readonly throttleMs: number,
    private readonly maxDelay: number = 5000,
  ) {
    this.timeWindow = new TimeWindow(throttleMs);
  }

  async process<T>(
    event: ContextEvent<T>,
    _metadata: EventMetadata,
    emit: (events: Array<ContextEvent<unknown>>) => Promise<void>,
  ): Promise<void> {
    this.pendingEvents.push(event);

    if (this.timeWindow.isExpired()) {
      await this.emitPendingEvents(emit);
      return;
    }

    const nextEmitDelay = Math.min(this.timeWindow.getTimeRemaining(), this.maxDelay);

    if (!this.emitTimer) {
      this.emitTimer = new Timer(() => {
        void this.emitPendingEvents(emit);
        this.emitTimer = null;
      }, nextEmitDelay);
      this.emitTimer.start();
    }
  }

  private async emitPendingEvents(
    emit: (events: Array<ContextEvent<unknown>>) => Promise<void>,
  ): Promise<void> {
    if (this.pendingEvents.length === 0) {
      return;
    }

    const eventToEmit = this.pendingEvents[this.pendingEvents.length - 1];
    this.pendingEvents.length = 0;
    this.timeWindow.reset();

    await emit([eventToEmit]);
  }

  public cancel(): void {
    this.emitTimer?.stop();
    this.emitTimer = null;
    this.pendingEvents.length = 0;
  }

  public getThrottleDelay(): number {
    return this.throttleMs;
  }

  public getMaxDelay(): number {
    return this.maxDelay;
  }

  public hasPendingEvents(): boolean {
    return this.pendingEvents.length > 0;
  }

  public getTimeUntilNextEmit(): number {
    return this.timeWindow.getTimeRemaining();
  }
}