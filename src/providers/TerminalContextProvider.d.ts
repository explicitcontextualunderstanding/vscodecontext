import * as vscode from 'vscode';
import type { ContextDataProvider } from '../interfaces/IContextProvider';
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
export declare class TerminalContextProvider implements ContextDataProvider {
  /** Identifies this provider's context category */
  readonly category: any;
  /** Maintains list of all active terminals */
  private readonly terminals;
  constructor();
  private onDidOpenTerminal;
  private onDidCloseTerminal;
  private onDidChangeActiveTerminal;
  getContext(): Promise<Record<string, unknown>>;
  getTerminalData(): {
    terminal: vscode.Terminal;
    creationTime: Date;
    lastActivity: Date;
    inputCount: number;
    outputCount: number;
    totalLifetime: number;
  }[];
  /**
   * Checks if terminal context gathering is enabled in settings
   * @returns true if terminal context gathering is enabled
   */
  isEnabled(): boolean;
}
