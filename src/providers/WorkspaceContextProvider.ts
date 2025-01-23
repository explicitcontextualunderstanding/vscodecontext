import * as vscode from 'vscode';

import type { ContextDataProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../interfaces/IContextProvider';
import { withErrorHandling } from '../utils/errorUtils';

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
export class WorkspaceContextProvider implements ContextDataProvider {
  /** Identifies this provider's context category */
  readonly category = ContextCategory.Workspace;

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
    const config = vscode.workspace.getConfiguration('vscode-context');
    return config.get('enableWorkspaceContext', true);
  }

  /**
   * Gathers current workspace context information
   * @returns Object containing:
   * - workspaceFolders: Information about opened workspace folders
   * - configuration: Workspace settings and extension information
   */
  async getContext(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      () => ({
        workspaceFolders: vscode.workspace.workspaceFolders?.map((folder) => ({
          name: folder.name,
          uri: folder.uri.toString(),
        })),
        configuration: {
          settings: this.getWorkspaceSettings(),
          extensions: this.getWorkspaceExtensions(),
        },
      }),
      {
        operation: 'getWorkspaceContext',
        category: this.category,
      },
      this.channel,
    );
  }

  private getWorkspaceSettings(): {
    editor: vscode.WorkspaceConfiguration;
    files: vscode.WorkspaceConfiguration;
    search: vscode.WorkspaceConfiguration;
  } {
    return {
      editor: vscode.workspace.getConfiguration('editor'),
      files: vscode.workspace.getConfiguration('files'),
      search: vscode.workspace.getConfiguration('search'),
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
}
