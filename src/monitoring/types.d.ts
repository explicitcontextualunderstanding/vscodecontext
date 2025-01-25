/**
 * Represents metrics collected about errors in the extension
 */
export interface ErrorMetrics {
  /** Total number of occurrences of this error */
  count: number;
  /** Timestamp of the most recent occurrence */
  lastOccurrence: Date;
  /** Array of context objects captured with each occurrence (last 10 only) */
  contexts: Array<Record<string, unknown>>;
}
export interface ErrorPattern {
  code: string;
  frequency: number;
  timeWindow: number;
}
