import * as vscode from 'vscode';
import type { ContextDataProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../interfaces/IContextProvider';
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
export declare class WorkspaceContextProvider implements ContextDataProvider {
    private readonly channel;
    /** Identifies this provider's context category */
    readonly category = ContextCategory.Workspace;
    /**
     * Creates a new WorkspaceContextProvider
     * @param channel Output channel for logging provider operations
     */
    constructor(channel: vscode.OutputChannel);
    /**
     * Checks if this provider is enabled in VS Code settings
     * Part of the Configurable Context Providers pattern
     * @returns true if workspace context gathering is enabled
     */
    isEnabled(): boolean;
    /**
     * Gathers current workspace context information
     * @returns Object containing:
     * - workspaceFolders: Information about opened workspace folders
     * - configuration: Workspace settings and extension information
     */
    getContext(): Promise<Record<string, unknown>>;
    private getWorkspaceSettings;
    private getWorkspaceExtensions;
}
