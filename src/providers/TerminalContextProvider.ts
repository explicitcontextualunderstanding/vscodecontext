import * as vscode from 'vscode';
import type { ContextDataProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../interfaces/IContextProvider';
import { getConfig } from '../config';

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
  private readonly terminals: {
    terminal: vscode.Terminal;
    creationTime: Date;
    lastActivity: Date;
    inputCount: number;
    outputCount: number;
    totalLifetime: number;
  }[] = [];

  constructor() {
    vscode.window.onDidOpenTerminal(this.onDidOpenTerminal, this);
    vscode.window.onDidCloseTerminal(this.onDidCloseTerminal, this);
    vscode.window.onDidChangeActiveTerminal(this.onDidChangeActiveTerminal, this);
  }

  private onDidOpenTerminal(terminal: vscode.Terminal): void {
    this.terminals.push({
      terminal,
      creationTime: new Date(),
      lastActivity: new Date(),
      inputCount: 0,
      outputCount: 0,
      totalLifetime: 0,
    });
  }

  private onDidCloseTerminal(terminal: vscode.Terminal): void {
    const index = this.terminals.findIndex((t) => t.terminal === terminal);
    if (index !== -1) {
      this.terminals.splice(index, 1);
    }
  }

  private onDidChangeActiveTerminal(terminal: vscode.Terminal | undefined): void {
    if (terminal) {
      const terminalData = this.terminals.find((t) => t.terminal === terminal);
      if (terminalData) {
        terminalData.lastActivity = new Date();
      }
    }
  }

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

  public async getContext(): Promise<Record<string, unknown>> {
    return {
      terminals: this.terminals.map((t) => ({
        name: t.terminal.name,
        creationTime: t.creationTime.toISOString(),
        lastActivity: t.lastActivity.toISOString(),
        inputCount: t.inputCount,
        outputCount: t.outputCount,
        totalLifetime: Date.now() - t.creationTime.getTime(),
      })),
    };
  }

  public getTerminalData(): {
    terminal: vscode.Terminal;
    creationTime: Date;
    lastActivity: Date;
    inputCount: number;
    outputCount: number;
    totalLifetime: number;
  }[] {
    return this.terminals;
  }

  /**
   * Checks if terminal context gathering is enabled in settings
   * @returns true if terminal context gathering is enabled
   */
  public isEnabled(): boolean {
    const config = getConfig().categories;
    return config.enableTerminalContext;
  }
}
