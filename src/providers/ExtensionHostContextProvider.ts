import * as vscode from 'vscode';
import { getConfig } from '../config';

import type { IContextProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../providers/contextContracts'; // Correct ContextCategory import - import from contextContracts.ts
import type { ContextProviderConfig } from './contextContracts'; // Import ContextProviderConfig
import type { ContextData } from '@/contextProvider'; // Import ContextData
import { withErrorHandling } from '../utils/errorUtils';

/**
 * Defines the structure for Extension Host context data.
 */
export type ExtensionHostContext = {
  // Export ExtensionHostContext type
  extensionCount: number;
  enabledExtensionCount: number;
  disabledExtensionCount: number;
};

/**
 * Provides context information about the VS Code extension host.
 * This provider gathers:
 * - Total number of extensions installed
 * - Number of enabled extensions
 * - Number of disabled extensions
 *
 * Part of the Configurable Context Providers pattern, this provider
 * can be enabled/disabled through VS Code settings.
 */
export class ExtensionHostContextProvider implements IContextProvider {
  /** Category of context provided by this provider */
  readonly category = ContextCategory.ExtensionHost;
  config!: ContextProviderConfig;

  /**
   * Creates a new ExtensionHostContextProvider
   */
  constructor() {}

  /**
   * Checks if this provider is enabled in settings
   * @returns true if extension host context is enabled
   */
  isEnabled(): boolean {
    const config = getConfig().categories;
    return config.enableExtensionHostContext;
  }

  /**
   * Gathers context data about the extension host
   * @returns Extension host context data
   */
  async getContext(): Promise<ContextData> {
    // Change return type to Promise<ContextData>
    const tempChannel = vscode.window.createOutputChannel('temp'); // Create temp output channel
    try {
      return withErrorHandling(
        () => ({
          extensionHost: {
            // Wrap ExtensionHostContext in 'extensionHost' property
            extensionCount: vscode.extensions.all.length,
            enabledExtensionCount: vscode.extensions.all.filter(
              (ext) => ext.isActive,
            ).length,
            disabledExtensionCount: vscode.extensions.all.filter(
              (ext) => !ext.isActive,
            ).length,
          },
        }),
        {
          operation: 'getExtensionHostContext',
          category: this.category,
        },
        tempChannel, // Pass temp output channel
      ) as Promise<ContextData>; // Type assertion to ContextData
    } finally {
      tempChannel.dispose(); // Dispose of temp output channel
    }
  }
  configure(config: ContextProviderConfig): void {
    this.config = config;
  }
  initialize(): Promise<void> {
    return Promise.resolve();
  }
  triggerContextExtraction(): void {
    // No implementation needed for ExtensionHostContextProvider
  }
  async getAllContext(): Promise<ContextData> {
    // Removed categories parameter
    return this.getContext();
  }
}
