import type { AggregationStrategy, ContextEvent, EventMetadata } from '../events';

/**
 * Implements a throttle strategy for event aggregation that limits the rate
 * at which events are processed. Only the most recent event within the throttle
 * window is processed.
 */
export class ThrottleStrategy implements AggregationStrategy {
  private lastEmitTime: number = 0;
  private pendingEvents: Array<ContextEvent<unknown>> = [];
  private timeoutHandle: ReturnType<typeof globalThis.setTimeout> | null = null;

  /**
   * Creates a new ThrottleStrategy
   * @param throttleMs Minimum time (in milliseconds) between event emissions
   * @param maxDelay Maximum time to wait before forcing emission (in milliseconds)
   */
  constructor(
    private readonly throttleMs: number = 1000,
    private readonly maxDelay: number = 5000,
  ) {}

  /**
   * Process an incoming event according to throttle rules
   */
  async process<T>(
    event: ContextEvent<T>,
    metadata: EventMetadata,
    emit: (events: Array<ContextEvent<unknown>>) => Promise<void>,
  ): Promise<void> {
    const now = Date.now();
    this.pendingEvents.push(event);

    // Check if we're within the throttle window
    const timeSinceLastEmit = now - this.lastEmitTime;
    
    // Clear any existing timeout
    if (this.timeoutHandle) {
      globalThis.clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }

    // If we've passed the throttle window, emit immediately
    if (timeSinceLastEmit >= this.throttleMs) {
      await this.emitPendingEvents(emit);
      return;
    }

    // Schedule emission at the end of throttle window
    const nextEmitDelay = Math.min(this.throttleMs - timeSinceLastEmit, this.maxDelay);

    this.timeoutHandle = globalThis.setTimeout(async () => {
      await this.emitPendingEvents(emit);
    }, nextEmitDelay);
  }

  /**
   * Emit pending events and update last emit time
   */
  private async emitPendingEvents(
    emit: (events: Array<ContextEvent<unknown>>) => Promise<void>,
  ): Promise<void> {
    if (this.pendingEvents.length === 0) return;

    // Only emit the most recent event
    const eventToEmit = this.pendingEvents[this.pendingEvents.length - 1];
    this.pendingEvents = [];
    this.lastEmitTime = Date.now();

    await emit([eventToEmit]);
  }

  /**
   * Cancel any pending event emissions
   */
  public cancel(): void {
    if (this.timeoutHandle) {
      globalThis.clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    this.pendingEvents = [];
  }

  /**
   * Get the current throttle delay
   */
  public getThrottleDelay(): number {
    return this.throttleMs;
  }

  /**
   * Get the current maximum delay
   */
  public getMaxDelay(): number {
    return this.maxDelay;
  }

  /**
   * Check if there are any pending events
   */
  public hasPendingEvents(): boolean {
    return this.pendingEvents.length > 0;
  }

  /**
   * Get time until next possible emission
   */
  public getTimeUntilNextEmit(): number {
    const now = Date.now();
    const timeSinceLastEmit = now - this.lastEmitTime;
    if (timeSinceLastEmit >= this.throttleMs) {
      return 0;
    }
    return this.throttleMs - timeSinceLastEmit;
  }
}