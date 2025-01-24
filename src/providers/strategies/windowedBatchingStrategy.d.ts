import type { AggregationStrategy, ContextEvent, EventMetadata } from '../events';
export declare class WindowedBatchingStrategy implements AggregationStrategy {
    private readonly windowMs;
    private readonly maxBatchSize;
    private buffer;
    private timer;
    constructor(windowMs?: number, maxBatchSize?: number);
    process<T>(event: ContextEvent<T>, metadata: EventMetadata, emit: (events: Array<ContextEvent<unknown>>) => Promise<void>): Promise<void>;
    private flush;
}
