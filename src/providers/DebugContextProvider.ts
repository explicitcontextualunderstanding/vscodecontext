import * as vscode from 'vscode';
import { getConfig } from '../config';

import type { IContextProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../providers/contextContracts'; // Correct ContextCategory import - import from contextContracts.ts
import type { ContextProviderConfig } from './contextContracts'; // Import ContextProviderConfig
import type { ContextData } from '@/contextProvider'; // Import ContextData
import { withErrorHandling } from '../utils/errorUtils';

/**
 * Defines the structure for Debug context data.
 */
export type DebugContext = {
  activeSession: Record<string, unknown> | null;
  allSessions: Array<Record<string, unknown>>;
  breakpoints: Array<Record<string, unknown>>;
};

/**
 * Manages and provides context information about VS Code debug sessions.
 * This provider tracks:
 * - Active debug sessions
 * - Debug configuration
 * - Breakpoint information
 * - Debug state changes
 *
 * Part of the Configurable Context Providers pattern, this provider
 * can be enabled/disabled through VS Code settings.
 */
export class DebugContextProvider implements IContextProvider {
  // Implement IContextProvider
  /** Identifies this provider's context category */
  readonly category = ContextCategory.Debug;
  config!: ContextProviderConfig; // Add config property

  /**
   * Creates a new DebugContextProvider and sets up debug session lifecycle event handlers
   * @param channel Output channel for logging provider operations
   * @throws Error if initialization fails
   */
  constructor(private readonly channel: vscode.OutputChannel) {
    try {
      this.channel.appendLine('Initializing DebugContextProvider...');
      vscode.debug.onDidStartDebugSession(this.handleDebugSessionStart);
      vscode.debug.onDidTerminateDebugSession(this.handleDebugSessionEnd);
      vscode.debug.onDidChangeBreakpoints(this.handleBreakpointChange);
      this.channel.appendLine('DebugContextProvider initialized');
    } catch (error) {
      this.channel.appendLine(
        `DebugContextProvider initialization failed: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Checks if this provider is enabled in VS Code settings
   * Part of the Configurable Context Providers pattern
   * @returns true if debug context gathering is enabled
   */
  isEnabled(): boolean {
    const config = getConfig().categories;
    return config.enableDebugContext;
  }

  /**
   * Gathers current debug context information
   * @returns Object containing:
   * - activeSession: Information about the currently active debug session
   * - allSessions: Array of metadata for all debug sessions
   * - breakpoints: Array of breakpoint information
   */
  async getContext(): Promise<ContextData> {
    // Change return type to Promise<ContextData>
    return withErrorHandling(
      () => ({
        debug: {
          // Wrap debug context in a 'debug' property to match ContextData type
          activeSession: this.getActiveDebugSession(),
          allSessions: this.getAllDebugSessions(), // Return empty array from getAllDebugSessions
          breakpoints: this.getBreakpoints(),
        },
      }),
      {
        operation: 'getDebugContext',
        category: this.category,
      },
      this.channel,
    ) as Promise<ContextData>; // Type assertion to ContextData
  }

  /**
   * Event handler for debug session start
   * Updates internal tracking and logs the event
   * @param session The newly started debug session
   */
  private readonly handleDebugSessionStart = (
    session: vscode.DebugSession,
  ): void => {
    try {
      this.channel.appendLine(`Debug session started: ${session.name}`);
    } catch (error) {
      this.channel.appendLine(`Error handling debug session start: ${error}`);
    }
  };

  /**
   * Event handler for debug session termination
   * Updates tracking and logs the event
   * @param session The terminated debug session
   */
  private readonly handleDebugSessionEnd = (
    session: vscode.DebugSession,
  ): void => {
    try {
      this.channel.appendLine(`Debug session ended: ${session.name}`);
    } catch (error) {
      this.channel.appendLine(`Error handling debug session end: ${error}`);
    }
  };

  /**
   * Event handler for breakpoint changes
   * Logs breakpoint additions, removals, and changes
   * @param event The breakpoint change event
   */
  private readonly handleBreakpointChange = (
    event: vscode.BreakpointsChangeEvent,
  ): void => {
    try {
      this.channel.appendLine(
        `Breakpoints changed: ${event.added.length} added, ${event.removed.length} removed`,
      );
    } catch (error) {
      this.channel.appendLine(`Error handling breakpoint change: ${error}`);
    }
  };

  /**
   * Gets information about the active debug session
   * @returns Object containing session metadata or null if no active session
   */
  private getActiveDebugSession(): Record<string, unknown> | null {
    const activeSession = vscode.debug.activeDebugSession;
    if (!activeSession) {
      return null;
    }

    return {
      id: activeSession.id,
      name: activeSession.name,
      type: activeSession.type,
      configuration: activeSession.configuration,
    };
  }

  /**
   * Gets information about all debug sessions
   * @returns Array of debug session metadata
   */
  private getAllDebugSessions(): Array<Record<string, unknown>> {
    return []; // Return empty array for now
  }

  /**
   * Gets information about all breakpoints
   * @returns Array of breakpoint metadata
   */
  private getBreakpoints(): Array<Record<string, unknown>> {
    return vscode.debug.breakpoints.map((breakpoint) => ({
      id: breakpoint.id,
      enabled: breakpoint.enabled,
      location:
        breakpoint instanceof vscode.SourceBreakpoint
          ? {
              uri: breakpoint.location.uri.toString(),
              range: {
                start: {
                  line: breakpoint.location.range.start.line,
                  character: breakpoint.location.range.start.character,
                },
                end: {
                  line: breakpoint.location.range.end.line,
                  character: breakpoint.location.range.end.character,
                },
              },
            }
          : undefined,
      condition: breakpoint.condition,
      hitCondition: breakpoint.hitCondition,
      logMessage: breakpoint.logMessage,
    }));
  }

  configure(config: ContextProviderConfig): void {
    // Implement configure method
    this.config = config;
  }
  initialize(): Promise<void> {
    // Implement initialize method
    return Promise.resolve();
  }
  triggerContextExtraction(): void {
    // Implement triggerContextExtraction method
    // Implementation not needed for DebugContextProvider
  }
  async getAllContext(): Promise<ContextData> {
    // Implement getAllContext method, removed categories parameter
    return this.getContext();
  }
}
