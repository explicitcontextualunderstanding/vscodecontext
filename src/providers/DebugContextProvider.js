import * as vscode from 'vscode';
import { getConfig } from '../config';
import { ContextCategory } from '../interfaces/IContextProvider';
import { withErrorHandling } from '../utils/errorUtils';
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
export class DebugContextProvider {
  /**
   * Creates a new DebugContextProvider and sets up debug session lifecycle event handlers
   * @param channel Output channel for logging provider operations
   * @throws Error if initialization fails
   */
  constructor(channel) {
    this.channel = channel;
    /** Identifies this provider's context category */
    this.category = ContextCategory.Debug;
    /**
     * Event handler for debug session start
     * Updates internal tracking and logs the event
     * @param session The newly started debug session
     */
    this.handleDebugSessionStart = (session) => {
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
    this.handleDebugSessionEnd = (session) => {
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
    this.handleBreakpointChange = (event) => {
      try {
        this.channel.appendLine(
          `Breakpoints changed: ${event.added.length} added, ${event.removed.length} removed`,
        );
      } catch (error) {
        this.channel.appendLine(`Error handling breakpoint change: ${error}`);
      }
    };
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
  isEnabled() {
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
  async getContext() {
    return withErrorHandling(
      () => ({
        activeSession: this.getActiveDebugSession(),
        allSessions: vscode.debug.activeDebugSession
          ? this.getAllDebugSessions()
          : [],
        breakpoints: this.getBreakpoints(),
      }),
      {
        operation: 'getDebugContext',
        category: this.category,
      },
      this.channel,
    );
  }
  /**
   * Gets information about the active debug session
   * @returns Object containing session metadata or null if no active session
   */
  getActiveDebugSession() {
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
  getAllDebugSessions() {
    return vscode.debug.activeDebugSession
      ? [
          {
            id: vscode.debug.activeDebugSession.id,
            name: vscode.debug.activeDebugSession.name,
            type: vscode.debug.activeDebugSession.type,
          },
        ]
      : [];
  }
  /**
   * Gets information about all breakpoints
   * @returns Array of breakpoint metadata
   */
  getBreakpoints() {
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
}
//# sourceMappingURL=DebugContextProvider.js.map
