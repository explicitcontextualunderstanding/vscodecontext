/**
 * Utility class for managing timeouts with cleanup
 */
export declare class Timer {
  private readonly callback;
  private readonly delayMs;
  private handle;
  constructor(callback: () => void, delayMs: number);
  start(): void;
  stop(): void;
  isRunning(): boolean;
}
/**
 * Utility for time-based calculations
 */
export declare class TimeWindow {
  private readonly windowMs;
  private lastEventTime;
  constructor(windowMs: number, lastEventTime?: number);
  reset(): void;
  isExpired(): boolean;
  getTimeElapsed(): number;
  getTimeRemaining(): number;
}
