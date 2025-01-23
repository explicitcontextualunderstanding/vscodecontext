import * as vscode from 'vscode';
import { name as packageName } from '../package.json';

const extensionNamespace = packageName;

export interface ContextConfiguration {
  categories: {
    enableWorkspaceContext: boolean;
    enableWindowContext: boolean;
    enableLanguageContext: boolean;
    enableDebugContext: boolean;
    enableSourceControlContext: boolean;
    enableTasksContext: boolean;
    enableTerminalContext: boolean;
    enableExtensionContext: boolean;
    enableExtensionHostContext: boolean;
    enableSettingsContext: boolean;
    enableKeybindingsContext: boolean;
    enableThemeContext: boolean;
    enableViewsContext: boolean;
    enableCustomEditorsContext: boolean;
  };
}

export const DEFAULT_CONFIG: ContextConfiguration = {
  categories: {
    enableWorkspaceContext: true,
    enableWindowContext: true,
    enableLanguageContext: true,
    enableDebugContext: true,
    enableSourceControlContext: true,
    enableTasksContext: true,
    enableTerminalContext: true,
    enableExtensionContext: true,
    enableExtensionHostContext: true,
    enableSettingsContext: true,
    enableKeybindingsContext: false,
    enableThemeContext: true,
    enableViewsContext: true,
    enableCustomEditorsContext: true,
  },
};

export function getConfig(): ContextConfiguration {
  const config = vscode.workspace.getConfiguration(extensionNamespace);
  return {
    categories: {
      enableWorkspaceContext: config.get<boolean>(
        'categories.enableWorkspaceContext',
        DEFAULT_CONFIG.categories.enableWorkspaceContext,
      ),
      enableWindowContext: config.get<boolean>(
        'categories.enableWindowContext',
        DEFAULT_CONFIG.categories.enableWindowContext,
      ),
      enableLanguageContext: config.get<boolean>(
        'categories.enableLanguageContext',
        DEFAULT_CONFIG.categories.enableLanguageContext,
      ),
      enableDebugContext: config.get<boolean>(
        'categories.enableDebugContext',
        DEFAULT_CONFIG.categories.enableDebugContext,
      ),
      enableSourceControlContext: config.get<boolean>(
        'categories.enableSourceControlContext',
        DEFAULT_CONFIG.categories.enableSourceControlContext,
      ),
      enableTasksContext: config.get<boolean>(
        'categories.enableTasksContext',
        DEFAULT_CONFIG.categories.enableTasksContext,
      ),
      enableTerminalContext: config.get<boolean>(
        'categories.enableTerminalContext',
        DEFAULT_CONFIG.categories.enableTerminalContext,
      ),
      enableExtensionContext: config.get<boolean>(
        'categories.enableExtensionContext',
        DEFAULT_CONFIG.categories.enableExtensionContext,
      ),
      enableExtensionHostContext: config.get<boolean>(
        'categories.enableExtensionHostContext',
        DEFAULT_CONFIG.categories.enableExtensionHostContext,
      ),
      enableSettingsContext: config.get<boolean>(
        'categories.enableSettingsContext',
        DEFAULT_CONFIG.categories.enableSettingsContext,
      ),
      enableKeybindingsContext: config.get<boolean>(
        'categories.enableKeybindingsContext',
        DEFAULT_CONFIG.categories.enableKeybindingsContext,
      ),
      enableThemeContext: config.get<boolean>(
        'categories.enableThemeContext',
        DEFAULT_CONFIG.categories.enableThemeContext,
      ),
      enableViewsContext: config.get<boolean>(
        'categories.enableViewsContext',
        DEFAULT_CONFIG.categories.enableViewsContext,
      ),
      enableCustomEditorsContext: config.get<boolean>(
        'categories.enableCustomEditorsContext',
        DEFAULT_CONFIG.categories.enableCustomEditorsContext,
      ),
    },
  };
}
