import type {
  AggregationStrategy,
  ContextEvent,
  EventMetadata,
} from '../events.js';
/**
 * Implements a throttle strategy for event aggregation that limits the rate
 * at which events are processed. Only the most recent event within the throttle
 * window is processed.
 */
export declare class ThrottleStrategy implements AggregationStrategy {
  private readonly throttleMs;
  private readonly maxDelay;
  private readonly timeWindow;
  private readonly pendingEvents;
  private emitTimer;
  constructor(throttleMs: number, maxDelay?: number);
  process<T>(
    event: ContextEvent<T>,
    _metadata: EventMetadata,
    emit: (events: Array<ContextEvent<unknown>>) => Promise<void>,
  ): Promise<void>;
  private emitPendingEvents;
  cancel(): void;
  getThrottleDelay(): number;
  getMaxDelay(): number;
  hasPendingEvents(): boolean;
  getTimeUntilNextEmit(): number;
}
