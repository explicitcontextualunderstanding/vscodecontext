import type { AggregationStrategy, ContextEvent, EventMetadata } from '../events';
/**
 * Implements a throttle strategy for event aggregation that limits the rate
 * at which events are processed. Only the most recent event within the throttle
 * window is processed.
 */
export declare class ThrottleStrategy implements AggregationStrategy {
    private readonly throttleMs;
    private readonly maxDelay;
    private lastEmitTime;
    private pendingEvents;
    private timeoutHandle;
    /**
     * Creates a new ThrottleStrategy
     * @param throttleMs Minimum time (in milliseconds) between event emissions
     * @param maxDelay Maximum time to wait before forcing emission (in milliseconds)
     */
    constructor(throttleMs?: number, maxDelay?: number);
    /**
     * Process an incoming event according to throttle rules
     */
    process<T>(event: ContextEvent<T>, metadata: EventMetadata, emit: (events: Array<ContextEvent<unknown>>) => Promise<void>): Promise<void>;
    /**
     * Emit pending events and update last emit time
     */
    private emitPendingEvents;
    /**
     * Cancel any pending event emissions
     */
    cancel(): void;
    /**
     * Get the current throttle delay
     */
    getThrottleDelay(): number;
    /**
     * Get the current maximum delay
     */
    getMaxDelay(): number;
    /**
     * Check if there are any pending events
     */
    hasPendingEvents(): boolean;
    /**
     * Get time until next possible emission
     */
    getTimeUntilNextEmit(): number;
}
