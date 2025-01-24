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
export declare const DEFAULT_CONFIG: ContextConfiguration;
export declare function getConfig(): ContextConfiguration;
