import type {
  AggregationStrategy,
  ContextEvent,
  EventMetadata,
} from '../events.js';
import { VSCodeContextError } from '../../errors/VSCodeContextError.js';
// import { ErrorLogger } from '../../monitoring/errorLogger.js';
// const errorLogger = new ErrorLogger({ appendLine: (message: string) => console.error(message) } as any); // Mock OutputChannel
import { Timer, TimeWindow } from './utils/timer.js';
/**
 * Implements a throttle strategy for event aggregation that limits the rate
 * at which events are processed. Only the most recent event within the throttle
 * window is processed.
 */
export class ThrottleStrategy implements AggregationStrategy {
  private readonly timeWindow: TimeWindow;
  private readonly pendingEvents: Array<ContextEvent<unknown>> = [];
  private emitTimer: Timer | undefined;

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
        void this.emitPendingEvents(emit).catch((e) => {
          // eslint-disable-next-line no-console
          console.error(`Error emitting pending events in timer callback: ${e}`);
          errorLogger.logError('ThrottleStrategyTimerError', e);
        });
        this.emitTimer = undefined;
      }, nextEmitDelay);
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
    this.emitTimer = undefined;
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
