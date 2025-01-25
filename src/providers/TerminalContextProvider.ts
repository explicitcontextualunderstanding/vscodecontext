import * as vscode from 'vscode';
import { getConfig } from '../config';

import type { IContextProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../providers/contextContracts';
import type { ContextProviderConfig } from './contextContracts';
import type { ContextData } from '@/contextProvider';
import { EventAggregator } from './eventAggregator';
import { withErrorHandling } from '../utils/errorUtils';
import type { ContextEventType } from './events';

/**
 * Defines the structure for Terminal context data.
 */
export type TerminalContext = {
  terminalCount: number;
  activeTerminalTitle: string | undefined;
  terminalTitles: string[];
};

/**
 * Provides context information about VS Code terminals.
 * This provider gathers:
 * - Number of terminals opened
 * - Titles of all opened terminals
 * - Title of the active terminal
 *
 * Part of the Configurable Context Providers pattern,
 * this provider can be enabled/disabled via VS Code settings.
 */
export class TerminalContextProvider implements IContextProvider {
  readonly category = ContextCategory.Terminal;
  config!: ContextProviderConfig;

  constructor(private readonly eventAggregator: EventAggregator) {
    vscode.window.onDidOpenTerminal(this.handleTerminalOpen);
    vscode.window.onDidCloseTerminal(this.handleTerminalClose);
    vscode.window.onDidChangeActiveTerminal(this.handleActiveTerminalChange);
  }

  /**
   * Checks if this provider is enabled in VS Code settings
   */
  isEnabled(): boolean {
    const config = getConfig().categories;
    return config.enableTerminalContext;
  }

  /**
   * Gathers current terminals context information
   */
  async getContext(): Promise<ContextData> {
    return withErrorHandling(
      () => ({
        terminal: {
          terminalCount: vscode.window.terminals.length,
          activeTerminalTitle: vscode.window.activeTerminal?.name,
          terminalTitles: vscode.window.terminals.map((term) => term.name),
        },
      }),
      {
        operation: 'getTerminalContext',
        category: this.category,
      },
      // Passing no output channel (now optional in withErrorHandling)
      undefined,
    ) as Promise<ContextData>;
  }

  /**
   * Handles terminal open events to update context
   */
  private readonly handleTerminalOpen = (terminal: vscode.Terminal): void => {
    this.eventAggregator.queueEvent({
      type: 'state_change' satisfies ContextEventType,
      payload: { event: 'terminalOpened', terminalName: terminal.name },
      metadata: {
        priority: 'low',
        source: 'TerminalContextProvider',
        timestamp: Date.now(),
      },
    });
  };

  /**
   * Handles terminal close events to update context
   */
  private readonly handleTerminalClose = (terminal: vscode.Terminal): void => {
    this.eventAggregator.queueEvent({
      type: 'state_change' satisfies ContextEventType,
      payload: { event: 'terminalClosed', terminalName: terminal.name },
      metadata: {
        priority: 'low',
        source: 'TerminalContextProvider',
        timestamp: Date.now(),
      },
    });
  };

  /**
   * Handles active terminal change events to update context
   */
  private readonly handleActiveTerminalChange = (
    terminal: vscode.Terminal | undefined,
  ): void => {
    this.eventAggregator.queueEvent({
      type: 'state_change' satisfies ContextEventType,
      payload: {
        event: 'activeTerminalChanged',
        terminalName: terminal?.name,
      },
      metadata: {
        priority: 'low',
        source: 'TerminalContextProvider',
        timestamp: Date.now(),
      },
    });
  };

  configure(config: ContextProviderConfig): void {
    this.config = config;
  }

  initialize(): Promise<void> {
    return Promise.resolve();
  }

  triggerContextExtraction(): void {
    this.eventAggregator.queueEvent({
      type: 'state_change' satisfies ContextEventType,
      payload: { event: 'manualContextExtractionRequest' },
      metadata: {
        priority: 'low',
        source: 'TerminalContextProvider',
        timestamp: Date.now(),
      },
    });
  }

  // Rename 'categories' -> '_categories' so ESLint doesn't complain about unused variable
  async getAllContext(_categories: string[]): Promise<ContextData> {
    return this.getContext();
  }
}
