// config.ts
export interface ContextConfiguration {
  categories: {
    workspace: boolean;
    window: boolean;
    language: boolean;
    debug: boolean;
    sourceControl: boolean;
    tasks: boolean;
    extension: boolean;
    extensionHost: boolean;
    settings: boolean;
    keybindings: boolean;
    theme: boolean;
    views: boolean;
    customEditors: boolean;
  };
}

export const DEFAULT_CONFIG: ContextConfiguration = {
  categories: {
    workspace: true,
    window: true,
    language: true,
    debug: true,
    sourceControl: true,
    tasks: true,
    extension: true,
    extensionHost: true,
    settings: true,
    keybindings: false,
    theme: true,
    views: true,
    customEditors: true,
  },
};

// utils.ts
import * as vscode from 'vscode';
export function getConfig(): ContextConfiguration {
  const config = vscode.workspace.getConfiguration('vscode-context');
  return {
    categories: {
      workspace: config.get<boolean>('categories.workspace', DEFAULT_CONFIG.categories.workspace),
      window: config.get<boolean>('categories.window', DEFAULT_CONFIG.categories.window),
      language: config.get<boolean>('categories.language', DEFAULT_CONFIG.categories.language),
      debug: config.get<boolean>('categories.debug', DEFAULT_CONFIG.categories.debug),
      sourceControl: config.get<boolean>(
        'categories.sourceControl',
        DEFAULT_CONFIG.categories.sourceControl,
      ),
      tasks: config.get<boolean>('categories.tasks', DEFAULT_CONFIG.categories.tasks),
      extension: config.get<boolean>('categories.extension', DEFAULT_CONFIG.categories.extension),
      extensionHost: config.get<boolean>(
        'categories.extensionHost',
        DEFAULT_CONFIG.categories.extensionHost,
      ),
      settings: config.get<boolean>('categories.settings', DEFAULT_CONFIG.categories.settings),
      keybindings: config.get<boolean>(
        'categories.keybindings',
        DEFAULT_CONFIG.categories.keybindings,
      ),
      theme: config.get<boolean>('categories.theme', DEFAULT_CONFIG.categories.theme),
      views: config.get<boolean>('categories.views', DEFAULT_CONFIG.categories.views),
      customEditors: config.get<boolean>(
        'categories.customEditors',
        DEFAULT_CONFIG.categories.customEditors,
      ),
    },
  };
}
