import * as vscode from 'vscode';
import type { ContextDataProvider } from '../interfaces/IContextProvider';
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
export declare class DebugContextProvider implements ContextDataProvider {
  private readonly channel;
  /** Identifies this provider's context category */
  readonly category: any;
  /**
   * Creates a new DebugContextProvider and sets up debug session lifecycle event handlers
   * @param channel Output channel for logging provider operations
   * @throws Error if initialization fails
   */
  constructor(channel: vscode.OutputChannel);
  /**
   * Checks if this provider is enabled in VS Code settings
   * Part of the Configurable Context Providers pattern
   * @returns true if debug context gathering is enabled
   */
  isEnabled(): boolean;
  /**
   * Gathers current debug context information
   * @returns Object containing:
   * - activeSession: Information about the currently active debug session
   * - allSessions: Array of metadata for all debug sessions
   * - breakpoints: Array of breakpoint information
   */
  getContext(): Promise<Record<string, unknown>>;
  /**
   * Event handler for debug session start
   * Updates internal tracking and logs the event
   * @param session The newly started debug session
   */
  private readonly handleDebugSessionStart;
  /**
   * Event handler for debug session termination
   * Updates tracking and logs the event
   * @param session The terminated debug session
   */
  private readonly handleDebugSessionEnd;
  /**
   * Event handler for breakpoint changes
   * Logs breakpoint additions, removals, and changes
   * @param event The breakpoint change event
   */
  private readonly handleBreakpointChange;
  /**
   * Gets information about the active debug session
   * @returns Object containing session metadata or null if no active session
   */
  private getActiveDebugSession;
  /**
   * Gets information about all debug sessions
   * @returns Array of debug session metadata
   */
  private getAllDebugSessions;
  /**
   * Gets information about all breakpoints
   * @returns Array of breakpoint metadata
   */
  private getBreakpoints;
}
