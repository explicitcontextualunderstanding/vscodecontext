import * as vscode from 'vscode';
import type { IContextProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../providers/contextContracts';
import type { ContextProviderConfig } from './contextContracts'; // Import ContextProviderConfig
import type { ContextData } from '@/contextProvider'; // Import ContextData

/**
 * Defines the structure for Editor context data.
 */
export type EditorContext = {
  // Export EditorContext type
  activeTextEditor: vscode.TextEditor | undefined;
  selections: readonly vscode.Selection[] | undefined;
  visibleTextEditors: readonly vscode.TextEditor[];
};

export class EditorContextProvider implements IContextProvider {
  // Implement IContextProvider
  readonly category = ContextCategory.Editor;
  config!: ContextProviderConfig; // Add config property

  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('yourExtension');
    return config.get('enableEditorContext', true);
  }

  async getContext(): Promise<ContextData> {
    // Change return type to Promise<ContextData>
    return {
      editor: {
        // Wrap EditorContext in 'editor' property
        activeTextEditor: vscode.window.activeTextEditor,
        selections: vscode.window.activeTextEditor?.selections,
        visibleTextEditors: vscode.window.visibleTextEditors,
      },
    } as ContextData; // Type assertion to ContextData
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
    // No implementation needed for EditorContextProvider
  }
  async getAllContext(_categories: string[]): Promise<ContextData> {
    // Implement getAllContext method
    return this.getContext();
  }
}
