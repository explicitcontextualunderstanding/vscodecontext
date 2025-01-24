/**
 * Utility class for managing timeouts with cleanup
 */
export class Timer {
  private handle: ReturnType<typeof globalThis.setTimeout> | null = null;

  constructor(
    private readonly callback: () => void,
    private readonly delayMs: number,
  ) {}

  start(): void {
    this.stop();
    this.handle = globalThis.setTimeout(() => {
      this.callback();
      this.handle = null;
    }, this.delayMs);
  }

  stop(): void {
    if (this.handle) {
      globalThis.clearTimeout(this.handle);
      this.handle = null;
    }
  }

  isRunning(): boolean {
    return this.handle !== null;
  }
}

/**
 * Utility for time-based calculations
 */
export class TimeWindow {
  constructor(
    private readonly windowMs: number,
    private lastEventTime: number = 0,
  ) {}

  reset(): void {
    this.lastEventTime = Date.now();
  }

  isExpired(): boolean {
    return this.getTimeElapsed() >= this.windowMs;
  }

  getTimeElapsed(): number {
    return Date.now() - this.lastEventTime;
  }

  getTimeRemaining(): number {
    const remaining = this.windowMs - this.getTimeElapsed();
    return remaining > 0 ? remaining : 0;
  }
}