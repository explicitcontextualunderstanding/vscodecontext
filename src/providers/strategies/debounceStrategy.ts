import type { AggregationStrategy } from '../eventAggregator';
import type { ContextEvent } from '../events';

export class DebounceStrategy implements AggregationStrategy {
  constructor(private readonly windowMs: number) {}

  shouldAggregate(event1: ContextEvent, event2: ContextEvent): boolean {
    return (
      event1.type === event2.type &&
      event2.metadata.timestamp - event1.metadata.timestamp <= this.windowMs
    );
  }

  aggregate(events: ContextEvent[]): ContextEvent {
    return events[events.length - 1];
  }
}
