import type { AggregationStrategy } from '../eventAggregator';
import type { ContextEvent } from '../events';
export declare class DebounceStrategy implements AggregationStrategy {
    private readonly windowMs;
    constructor(windowMs: number);
    shouldAggregate(event1: ContextEvent, event2: ContextEvent): boolean;
    aggregate(events: ContextEvent[]): ContextEvent;
}
