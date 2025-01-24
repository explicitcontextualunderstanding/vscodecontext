import * as vscode from 'vscode';
export class EventAggregator {
  constructor(config, outputChannel) {
    this.config = config;
    this.eventQueue = new Map();
    this.strategies = new Map();
    this.flushTimer = null;
    this.loadMetrics = {
      queueSize: 0,
      maxProcessingTime: 0,
      avgProcessingTime: 0,
      eventsProcessed: 0,
      eventsDropped: 0,
    };
    this.eventQueue = new Map();
    this.strategies = new Map();
    this.flushTimer = null;
    this.outputChannel =
      outputChannel || vscode.window.createOutputChannel('Event Aggregator');
    this.startFlushTimer();
  }
  // OutputAdapter implementation
  logEvent(event) {
    this.outputChannel.appendLine(`[Event] ${JSON.stringify(event)}`);
    this.loadMetrics.eventsProcessed++;
  }
  logMetrics(metrics) {
    this.outputChannel.appendLine(`[Metrics] ${JSON.stringify(metrics)}`);
    this.loadMetrics.queueSize = this.eventQueue.size;
  }
  /**
   * Registers an aggregation strategy for a specific event type
   */
  registerStrategy(eventType, strategy) {
    this.strategies.set(eventType, strategy);
  }
  /**
   * Adds an event to the queue for processing
   */
  queueEvent(event) {
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
  flush() {
    Array.from(this.eventQueue.keys()).forEach((type) =>
      this.flushEventType(type),
    );
  }
  /**
   * Determines if an event should bypass aggregation
   */
  shouldProcessImmediately(event) {
    return event.metadata.priority === 'high' || event.type.includes('ERROR');
  }
  /**
   * Processes a single event
   */
  processEvent(event) {
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
  flushEventType(type) {
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
  startFlushTimer() {
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
  dispose() {
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
export function createDefaultConfig() {
  return {
    batchWindow: 1000,
    maxBatchSize: 100,
    flushInterval: 5000, // Flush every 5 seconds
  };
}
//# sourceMappingURL=eventAggregator.js.map
