export class WindowedBatchingStrategy {
    constructor(windowMs = 1000, maxBatchSize = 50) {
        this.windowMs = windowMs;
        this.maxBatchSize = maxBatchSize;
        this.buffer = [];
        this.timer = null;
    }
    async process(event, metadata, emit) {
        this.buffer.push(event);
        if (!this.timer) {
            this.timer = setTimeout(async () => {
                await this.flush(emit);
            }, this.windowMs);
        }
        if (this.buffer.length >= this.maxBatchSize) {
            await this.flush(emit);
        }
    }
    async flush(emit) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.buffer.length > 0) {
            await emit([...this.buffer]);
            this.buffer = [];
        }
    }
}
//# sourceMappingURL=windowedBatchingStrategy.js.map