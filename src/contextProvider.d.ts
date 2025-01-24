/// <reference types="node" />
import { EventEmitter } from 'events';
import type { ContextData } from './interfaces/ContextProviderInterface';
import type { IContextProvider } from './interfaces/IContextProvider';
/**
 * Event emitted when context extraction is requested
 */
export declare const EXTRACT_REQUEST = "EXTRACT_REQUEST";
import * as vscode from 'vscode';
/**
 * Core provider class that manages VS Code context gathering.
 * Implements the Configurable Context Providers pattern and acts as the main
 * coordinator for all context-related operations.
 *
 * This class:
 * - Coordinates context gathering from various providers
 * - Manages terminal lifecycle tracking
 * - Handles context extraction requests
 * - Provides logging capabilities
 *
 * Extends EventEmitter to support event-based communication
 * for context updates and extraction requests.
 */
export declare class ContextProvider extends EventEmitter implements IContextProvider {
    /** Channel for logging operations and debug information */
    private readonly outputChannel;
    /**
     * Creates a new ContextProvider instance
     * @param outputChannel VS Code output channel for logging
     */
    constructor(outputChannel: vscode.OutputChannel);
    /**
     * Retrieves context data for specified categories
     * Part of the Configurable Context Providers pattern
     *
     * @param categories Array of context categories to gather (e.g., ['workspace', 'editor'])
     * @returns Promise resolving to context data for requested categories
     */
    getAllContext(categories: string[]): Promise<ContextData>;
    /**
     * Triggers a context extraction event
     * Emits an EXTRACT_REQUEST event to notify listeners that new context should be gathered
     * This is used to initiate context updates when workspace or editor state changes
     */
    triggerContextExtraction(): void;
    /**
     * Initializes terminal tracking system
     * Sets up event listeners for terminal lifecycle events (creation, deletion)
     * and begins collecting terminal history and metadata.
     * Part of the terminal context gathering functionality described in the architecture.
     */
    startTrackingTerminals(): void;
    /**
     * Logs informational messages and structured data to the output channel
     * Provides a consistent logging interface for context-related operations
     *
     * @param message The message to log
     * @param data Optional structured data to log as formatted JSON
     */
    info(message: string, data?: Record<string, unknown>): void;
    /**
     * Gathers context data for all categories
     * @returns Promise resolving to context data for all categories
     * @description Gathers context data for all categories
     */
    gatherContext(): Promise<ContextData>;
}
