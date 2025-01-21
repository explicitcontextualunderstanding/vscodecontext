import * as vscode from 'vscode';

import type { ContextDataProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../interfaces/IContextProvider';
import { withErrorHandling } from '../utils/errorUtils';

export class WorkspaceContextProvider implements ContextDataProvider {
  readonly category = ContextCategory.Workspace;

  constructor(private readonly channel: vscode.OutputChannel) {}

  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('vscode-context');
    return config.get('enableWorkspaceContext', true);
  }

  async getContext(): Promise<Record<string, unknown>> {
    return withErrorHandling(() => ({
      workspaceFolders: vscode.workspace.workspaceFolders?.map(folder => ({
        name: folder.name,
        uri: folder.uri.toString()
      })),
      configuration: {
        settings: this.getWorkspaceSettings(),
        extensions: this.getWorkspaceExtensions()
      }
    }), {
      operation: 'getWorkspaceContext',
      category: this.category
    }, this.channel);
  }

  private getWorkspaceSettings(): {
    editor: vscode.WorkspaceConfiguration;
    files: vscode.WorkspaceConfiguration;
    search: vscode.WorkspaceConfiguration;
  } {
    return {
      editor: vscode.workspace.getConfiguration('editor'),
      files: vscode.workspace.getConfiguration('files'),
      search: vscode.workspace.getConfiguration('search')
    };
  }

  private getWorkspaceExtensions(): Array<{
    id: string;
    packageJSON: unknown;
  }> {
    return vscode.extensions.all.map(ext => ({
      id: ext.id,
      packageJSON: ext.packageJSON as unknown
    }));
  }
}