import * as vscode from 'vscode';

import type { ContextDataProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../interfaces/IContextProvider';
import { withErrorHandling } from '../utils/errorUtils';

/**
 * Manages and provides context information about VS Code integrated terminals.
 * This provider tracks:
 * - Terminal creation and deletion
 * - Active terminal information
 * - Terminal metadata (name, process ID, shell path)
 * - Terminal state changes
 *
 * Part of the Configurable Context Providers pattern, this provider
 * can be enabled/disabled through VS Code settings.
 */
export class TerminalContextProvider implements ContextDataProvider {
  /** Identifies this provider's context category */
  readonly category = ContextCategory.Terminal;
  /** Maintains list of all active terminals */
  private terminals: vscode.Terminal[] = [];

  /**
   * Creates a new TerminalContextProvider and sets up terminal lifecycle event handlers
   * @param channel Output channel for logging provider operations
   * @throws Error if initialization fails
   */
  constructor(private readonly channel: vscode.OutputChannel) {
    try {
      this.channel.appendLine('Initializing TerminalContextProvider...');
      this.terminals = [...vscode.window.terminals];
      vscode.window.onDidOpenTerminal(this.handleTerminalOpened);
      vscode.window.onDidCloseTerminal(this.handleTerminalClosed);
      this.channel.appendLine('TerminalContextProvider initialized');
    } catch (error) {
      this.channel.appendLine(`TerminalContextProvider initialization failed: ${error}`);
      throw error;
    }
  }

  /**
   * Checks if this provider is enabled in VS Code settings
   * Part of the Configurable Context Providers pattern
   * @returns true if terminal context gathering is enabled
   */
  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('vscode-context');
    return config.get('enableTerminalContext', true);
  }

  /**
   * Gathers current terminal context information
   * @returns Object containing:
   * - activeTerminal: Information about the currently active terminal
   * - allTerminals: Array of metadata for all terminals
   */
  async getContext(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      () => ({
        activeTerminal: this.getActiveTerminalContext(),
        allTerminals: this.terminals.map((terminal) => this.getTerminalMetadata(terminal)),
      }),
      {
        operation: 'getTerminalContext',
        category: this.category,
      },
      this.channel,
    );
  }

  /**
   * Event handler for terminal creation
   * Updates internal terminal list and logs the event
   * @param terminal The newly created terminal
   */
  private readonly handleTerminalOpened = (terminal: vscode.Terminal): void => {
    try {
      this.channel.appendLine(`Terminal opened: ${terminal.name}`);
      this.terminals.push(terminal);
    } catch (error) {
      this.channel.appendLine(`Error handling terminal open: ${error}`);
    }
  };

  /**
   * Event handler for terminal closure
   * Removes terminal from internal tracking list
   * @param terminal The terminal being closed
   */
  private readonly handleTerminalClosed = (terminal: vscode.Terminal): void => {
    this.terminals = this.terminals.filter((t) => t !== terminal);
  };

  /**
   * Retrieves context information for the currently active terminal
   * @returns Terminal metadata object including name, creation options,
   * state, process ID, and shell path, or null if no active terminal
   */
  private getActiveTerminalContext(): {
    name: string;
    creationOptions: vscode.TerminalOptions | vscode.ExtensionTerminalOptions;
    state: vscode.TerminalState;
    processId: string | null;
    shellPath: string | null;
  } | null {
    const activeTerminal = vscode.window.activeTerminal;
    return activeTerminal ? this.getTerminalMetadata(activeTerminal) : null;
  }

  /**
   * Extracts metadata information from a terminal instance
   * @param terminal The terminal to get metadata from
   * @returns Object containing terminal metadata:
   * - name: Terminal display name
   * - creationOptions: Original options used to create the terminal
   * - state: Current terminal state
   * - processId: Process ID of the terminal shell (if available)
   * - shellPath: Path to the shell executable (if available)
   */
  private getTerminalMetadata(terminal: vscode.Terminal): {
    name: string;
    creationOptions: vscode.TerminalOptions | vscode.ExtensionTerminalOptions;
    state: vscode.TerminalState;
    processId: string | null;
    shellPath: string | null;
  } {
    return {
      name: terminal.name,
      creationOptions: terminal.creationOptions,
      state: terminal.state,
      processId: terminal.processId !== undefined ? String(terminal.processId) : null, // eslint-disable-line @typescript-eslint/no-base-to-string
      shellPath: this.getShellPath(terminal),
    };
  }

  private getShellPath(terminal: vscode.Terminal): string | null {
    try {
      // Handle different terminal types safely
      const options = terminal.creationOptions;
      if (options && 'shellPath' in options) {
        return (options as vscode.TerminalOptions).shellPath ?? null;
      }

      // Safely access internal properties as last resort
      // Using precise type assertion for internal VS Code properties
      interface VSCodeTerminalInternal {
        _shellPath?: { value: string };
        _ptyProcess?: { shellPath: string };
      }

      /* @ts-expect-error - Accessing internal VS Code API */
      const internalTerm: VSCodeTerminalInternal = terminal;

      const shellPath = internalTerm._shellPath?.value ?? internalTerm._ptyProcess?.shellPath;

      return typeof shellPath === 'string' ? shellPath : null;
    } catch (error) {
      this.channel.appendLine(
        `Error getting shell path: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
