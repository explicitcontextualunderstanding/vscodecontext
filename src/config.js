import * as vscode from 'vscode';
import { name as packageName } from '../package.json';
const extensionNamespace = packageName;
export const DEFAULT_CONFIG = {
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
export function getConfig() {
    const config = vscode.workspace.getConfiguration(extensionNamespace);
    return {
        categories: {
            enableWorkspaceContext: config.get('categories.enableWorkspaceContext', DEFAULT_CONFIG.categories.enableWorkspaceContext),
            enableWindowContext: config.get('categories.enableWindowContext', DEFAULT_CONFIG.categories.enableWindowContext),
            enableLanguageContext: config.get('categories.enableLanguageContext', DEFAULT_CONFIG.categories.enableLanguageContext),
            enableDebugContext: config.get('categories.enableDebugContext', DEFAULT_CONFIG.categories.enableDebugContext),
            enableSourceControlContext: config.get('categories.enableSourceControlContext', DEFAULT_CONFIG.categories.enableSourceControlContext),
            enableTasksContext: config.get('categories.enableTasksContext', DEFAULT_CONFIG.categories.enableTasksContext),
            enableTerminalContext: config.get('categories.enableTerminalContext', DEFAULT_CONFIG.categories.enableTerminalContext),
            enableExtensionContext: config.get('categories.enableExtensionContext', DEFAULT_CONFIG.categories.enableExtensionContext),
            enableExtensionHostContext: config.get('categories.enableExtensionHostContext', DEFAULT_CONFIG.categories.enableExtensionHostContext),
            enableSettingsContext: config.get('categories.enableSettingsContext', DEFAULT_CONFIG.categories.enableSettingsContext),
            enableKeybindingsContext: config.get('categories.enableKeybindingsContext', DEFAULT_CONFIG.categories.enableKeybindingsContext),
            enableThemeContext: config.get('categories.enableThemeContext', DEFAULT_CONFIG.categories.enableThemeContext),
            enableViewsContext: config.get('categories.enableViewsContext', DEFAULT_CONFIG.categories.enableViewsContext),
            enableCustomEditorsContext: config.get('categories.enableCustomEditorsContext', DEFAULT_CONFIG.categories.enableCustomEditorsContext),
        },
    };
}
//# sourceMappingURL=config.js.map