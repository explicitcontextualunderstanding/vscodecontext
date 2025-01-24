import type { ContextEvent, ContextEventType } from './events.js';
import * as vscode from 'vscode';

/**
 * Configuration for event aggregation
 */
export interface AggregationConfig {
  batchWindow: number; // Time window in ms for batching similar events
  maxBatchSize: number; // Maximum number of events in a batch
  flushInterval: number; // Interval in ms to force flush events
}

/**
 * Strategy for aggregating events
 */
export interface AggregationStrategy {
  shouldAggregate: (event1: ContextEvent, event2: ContextEvent) => boolean;
  aggregate: (events: ContextEvent[]) => ContextEvent;
}

/**
 * Manages event aggregation and processing
 */
export interface LoadMetrics {
  queueSize: number;
  maxProcessingTime: number;
  avgProcessingTime: number;
  eventsProcessed: number;
  eventsDropped: number;
}

export interface OutputAdapter {
  logEvent(event: ContextEvent): void;
  logMetrics(metrics: LoadMetrics): void;
}

export class EventAggregator implements OutputAdapter {
  private readonly eventQueue = new Map<ContextEventType, ContextEvent[]>();
  private readonly strategies = new Map<
    ContextEventType,
    AggregationStrategy
  >();
  private flushTimer: ReturnType<typeof globalThis.setInterval> | null = null;
  private readonly outputChannel: vscode.OutputChannel;
  private readonly loadMetrics: LoadMetrics = {
    queueSize: 0,
    maxProcessingTime: 0,
    avgProcessingTime: 0,
    eventsProcessed: 0,
    eventsDropped: 0,
  };

  constructor(
    private readonly config: AggregationConfig,
    outputChannel?: vscode.OutputChannel,
  ) {
    this.eventQueue = new Map();
    this.strategies = new Map();
    this.flushTimer = null;
    this.outputChannel =
      outputChannel || vscode.window.createOutputChannel('Event Aggregator');
    this.startFlushTimer();
  }
  // OutputAdapter implementation
  public logEvent(event: ContextEvent): void {
    this.outputChannel.appendLine(`[Event] ${JSON.stringify(event)}`);
    this.loadMetrics.eventsProcessed++;
  }

  public logMetrics(metrics: LoadMetrics): void {
    this.outputChannel.appendLine(`[Metrics] ${JSON.stringify(metrics)}`);
    this.loadMetrics.queueSize = this.eventQueue.size;
  }

  /**
   * Registers an aggregation strategy for a specific event type
   */
  registerStrategy(
    eventType: ContextEventType,
    strategy: AggregationStrategy,
  ): void {
    this.strategies.set(eventType, strategy);
  }

  /**
   * Adds an event to the queue for processing
   */
  queueEvent(event: ContextEvent): void {
    const existingEvents = this.eventQueue.get(event.type) || [];

    if (this.shouldProcessImmediately(event)) {
      this.processEvent(event);
      return;
    }

    existingEvents.push(event);
    this.eventQueue.set(event.type, existingEvents);

    if (existingEvents.length >= this.config.maxBatchSize) {
      this.flushEventType(event.type);
    }
  }

  /**
   * Processes all queued events
   */
  flush(): void {
    Array.from(this.eventQueue.keys()).forEach((type) =>
      this.flushEventType(type),
    );
  }

  /**
   * Determines if an event should bypass aggregation
   */
  private shouldProcessImmediately(event: ContextEvent): boolean {
    return event.metadata.priority === 'high' || event.type.includes('ERROR');
  }

  /**
   * Processes a single event
   */
  private processEvent(event: ContextEvent): void {
    const startTime = Date.now();
    this.outputChannel.appendLine(`Processing event: ${event.type}`);
    this.outputChannel.appendLine(JSON.stringify(event, null, 2));
    const processingTime = Date.now() - startTime;
    this.loadMetrics.maxProcessingTime = Math.max(
      this.loadMetrics.maxProcessingTime,
      processingTime,
    );
    this.loadMetrics.avgProcessingTime =
      (this.loadMetrics.avgProcessingTime * this.loadMetrics.eventsProcessed +
        processingTime) /
      (this.loadMetrics.eventsProcessed + 1);
    this.logMetrics(this.loadMetrics);
  }

  /**
   * Processes all events of a specific type
   */
  private flushEventType(type: ContextEventType): void {
    const events = this.eventQueue.get(type) || [];
    if (events.length === 0) return;

    const strategy = this.strategies.get(type);
    if (strategy && events.length > 1) {
      const aggregatedEvent = strategy.aggregate(events);
      this.processEvent(aggregatedEvent);
    } else {
      events.forEach((event) => this.processEvent(event));
    }

    this.eventQueue.delete(type);
  }

  /**
   * Starts the periodic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      globalThis.clearInterval(this.flushTimer);
    }

    this.flushTimer = globalThis.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Cleans up resources
   */
  dispose(): void {
    if (this.flushTimer) {
      globalThis.clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
    this.eventQueue.clear();
    this.strategies.clear();
    this.outputChannel.dispose();
  }
}

/**
 * Creates a default configuration for event aggregation
 */
export function createDefaultConfig(): AggregationConfig {
  return {
    batchWindow: 1000, // 1 second batch window
    maxBatchSize: 100, // Maximum 100 events per batch
    flushInterval: 5000, // Flush every 5 seconds
  };
}
