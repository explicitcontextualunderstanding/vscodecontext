import type { ContextEvent, ContextEventType } from './events';
import * as vscode from 'vscode';
/**
 * Configuration for event aggregation
 */
export interface AggregationConfig {
    batchWindow: number;
    maxBatchSize: number;
    flushInterval: number;
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
export declare class EventAggregator implements OutputAdapter {
    private readonly config;
    private readonly eventQueue;
    private readonly strategies;
    private flushTimer;
    private readonly outputChannel;
    private readonly loadMetrics;
    constructor(config: AggregationConfig, outputChannel?: vscode.OutputChannel);
    logEvent(event: ContextEvent): void;
    logMetrics(metrics: LoadMetrics): void;
    /**
     * Registers an aggregation strategy for a specific event type
     */
    registerStrategy(eventType: ContextEventType, strategy: AggregationStrategy): void;
    /**
     * Adds an event to the queue for processing
     */
    queueEvent(event: ContextEvent): void;
    /**
     * Processes all queued events
     */
    flush(): void;
    /**
     * Determines if an event should bypass aggregation
     */
    private shouldProcessImmediately;
    /**
     * Processes a single event
     */
    private processEvent;
    /**
     * Processes all events of a specific type
     */
    private flushEventType;
    /**
     * Starts the periodic flush timer
     */
    private startFlushTimer;
    /**
     * Cleans up resources
     */
    dispose(): void;
}
/**
 * Creates a default configuration for event aggregation
 */
export declare function createDefaultConfig(): AggregationConfig;
