import * as vscode from 'vscode';
import { getConfig } from '../config';

import type { IContextProvider } from '../interfaces/IContextProvider'; // Correct import to IContextProvider
import { ContextCategory } from './contextContracts';
import { withErrorHandling } from '../utils/errorUtils';
import type { ContextProviderConfig } from './contextContracts'; // Import ContextProviderConfig
import type { ContextData } from '@/contextProvider'; // Import ContextData

/**
 * Defines the structure for Workspace context data.
 */
export type WorkspaceContext = {
  // Export WorkspaceContext type
  workspaceFolders: Array<{ name: string; uri: string }> | undefined;
  configuration: {
    settings: {
      editor: vscode.WorkspaceConfiguration;
      files: vscode.WorkspaceConfiguration;
      search: vscode.WorkspaceConfiguration;
    };
    extensions: Array<{ id: string; packageJSON: unknown }>;
  };
};

/**
 * Provides context information about the VS Code workspace.
 * This provider gathers:
 * - Workspace folder information
 * - Workspace settings (editor, files, search configurations)
 * - Installed extensions and their metadata
 *
 * Part of the Configurable Context Providers pattern, this provider
 * can be enabled/disabled through VS Code settings.
 */
export class WorkspaceContextProvider implements IContextProvider {
  // Implement IContextProvider
  /** Identifies this provider's context category */
  readonly category = ContextCategory.Workspace;
  config!: ContextProviderConfig;

  /**
   * Creates a new WorkspaceContextProvider
   * @param channel Output channel for logging provider operations
   */
  constructor(private readonly channel: vscode.OutputChannel) {}

  /**
   * Checks if this provider is enabled in VS Code settings
   * Part of the Configurable Context Providers pattern
   * @returns true if workspace context gathering is enabled
   */
  isEnabled(): boolean {
    const config = getConfig().categories;
    return config.enableWorkspaceContext;
  }

  /**
   * Gathers current workspace context information
   * @returns Object containing:
   * - workspaceFolders: Information about opened workspace folders
   * - configuration: Workspace settings and extension information
   */
  async getContext(): Promise<ContextData> {
    // Change return type to Promise<ContextData>
    return withErrorHandling(
      () => ({
        workspace: {
          // Wrap WorkspaceContext in 'workspace' property
          workspaceFolders: vscode.workspace.workspaceFolders?.map(
            (folder) => ({
              name: folder.name,
              uri: folder.uri.toString(),
            }),
          ),
          configuration: this.getWorkspaceConfiguration(),
        },
      }),
      {
        operation: 'getWorkspaceContext',
        category: this.category,
      },
      this.channel,
    ) as Promise<ContextData>; // Type assertion to ContextData
  }

  private getWorkspaceConfiguration(): WorkspaceContext['configuration'] {
    return {
      settings: {
        editor: vscode.workspace.getConfiguration('editor'),
        files: vscode.workspace.getConfiguration('files'),
        search: vscode.workspace.getConfiguration('search'),
      },
      extensions: this.getWorkspaceExtensions(),
    };
  }

  private getWorkspaceExtensions(): Array<{
    id: string;
    packageJSON: unknown;
  }> {
    return vscode.extensions.all.map((ext) => ({
      id: ext.id,
      packageJSON: ext.packageJSON as unknown,
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
    // No implementation needed for WorkspaceContextProvider
  }
  async getAllContext(_categories: string[]): Promise<ContextData> {
    // Implement getAllContext method
    return this.getContext();
  }
}
