/* global clearTimeout */
import type { AggregationStrategy, ContextEvent, EventMetadata } from '../events';

export class WindowedBatchingStrategy implements AggregationStrategy {
  private buffer: Array<ContextEvent<unknown>> = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly windowMs: number = 1000,
    private readonly maxBatchSize: number = 50,
  ) {}

  async process<T>(
    event: ContextEvent<T>,
    metadata: EventMetadata,
    emit: (events: Array<ContextEvent<unknown>>) => Promise<void>,
  ): Promise<void> {
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

  private async flush(
    emit: (events: Array<ContextEvent<unknown>>) => Promise<void>,
  ): Promise<void> {
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
