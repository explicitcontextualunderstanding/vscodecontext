export class DebounceStrategy {
    constructor(windowMs) {
        this.windowMs = windowMs;
    }
    shouldAggregate(event1, event2) {
        return (event1.type === event2.type &&
            event2.metadata.timestamp - event1.metadata.timestamp <= this.windowMs);
    }
    aggregate(events) {
        return events[events.length - 1];
    }
}
//# sourceMappingURL=debounceStrategy.js.map