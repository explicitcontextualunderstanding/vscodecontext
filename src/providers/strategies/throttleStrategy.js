/**
 * Implements a throttle strategy for event aggregation that limits the rate
 * at which events are processed. Only the most recent event within the throttle
 * window is processed.
 */
export class ThrottleStrategy {
    /**
     * Creates a new ThrottleStrategy
     * @param throttleMs Minimum time (in milliseconds) between event emissions
     * @param maxDelay Maximum time to wait before forcing emission (in milliseconds)
     */
    constructor(throttleMs = 1000, maxDelay = 5000) {
        this.throttleMs = throttleMs;
        this.maxDelay = maxDelay;
        this.lastEmitTime = 0;
        this.pendingEvents = [];
        this.timeoutHandle = null;
    }
    /**
     * Process an incoming event according to throttle rules
     */
    async process(event, metadata, emit) {
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
    async emitPendingEvents(emit) {
        if (this.pendingEvents.length === 0)
            return;
        // Only emit the most recent event
        const eventToEmit = this.pendingEvents[this.pendingEvents.length - 1];
        this.pendingEvents = [];
        this.lastEmitTime = Date.now();
        await emit([eventToEmit]);
    }
    /**
     * Cancel any pending event emissions
     */
    cancel() {
        if (this.timeoutHandle) {
            globalThis.clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
        this.pendingEvents = [];
    }
    /**
     * Get the current throttle delay
     */
    getThrottleDelay() {
        return this.throttleMs;
    }
    /**
     * Get the current maximum delay
     */
    getMaxDelay() {
        return this.maxDelay;
    }
    /**
     * Check if there are any pending events
     */
    hasPendingEvents() {
        return this.pendingEvents.length > 0;
    }
    /**
     * Get time until next possible emission
     */
    getTimeUntilNextEmit() {
        const now = Date.now();
        const timeSinceLastEmit = now - this.lastEmitTime;
        if (timeSinceLastEmit >= this.throttleMs) {
            return 0;
        }
        return this.throttleMs - timeSinceLastEmit;
    }
}
//# sourceMappingURL=throttleStrategy.js.map