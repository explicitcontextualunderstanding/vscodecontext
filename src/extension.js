import * as vscode from 'vscode';
import { getConfig } from './config';
import { name as packageName } from '../package.json';
import { ContextProvider } from './contextProvider';
import { errorMonitor } from './monitoring/errorMonitor';
import { handleError, withErrorHandling } from './utils/errorUtils';
import { WebviewProvider } from './webview/WebviewProvider';
let contextProvider;
let outputChannel;
// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    handleError(err, {
        operation: 'unhandledRejectionHandler',
        source: 'process',
    }, outputChannel);
});
async function initializeContextProvider() {
    await withErrorHandling(async () => {
        contextProvider = new ContextProvider(outputChannel);
        contextProvider.info('Extension activated', {});
    }, { operation: 'initializeContextProvider' }, outputChannel);
}
function subscribeToEvent(eventName, registration) {
    try {
        return registration();
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        handleError(err, { operation: 'subscribeToEvent', event: eventName }, outputChannel);
        throw err;
    }
}
async function handleEditorChange(editor) {
    await withErrorHandling(async () => {
        contextProvider.info(`Active editor changed: ${editor?.document.uri.toString()}`, {
            uri: editor?.document.uri.toString(),
            language: editor?.document.languageId,
        });
    }, { operation: 'handleEditorChange', uri: editor?.document.uri.toString() }, outputChannel);
}
async function handleWindowStateChange(state) {
    await withErrorHandling(async () => {
        contextProvider.info('Window state changed', {
            focused: state.focused,
            activeTerminal: vscode.window.activeTerminal?.name,
        });
    }, { operation: 'handleWindowStateChange' }, outputChannel);
}
async function extractContext() {
    await withErrorHandling(async () => {
        if (!contextProvider) {
            vscode.window.showErrorMessage('Context provider not initialized - extension activation failed');
            return;
        }
        const config = getConfig().categories;
        const includeCategories = [
            config.enableWorkspaceContext ? 'workspace' : null,
            config.enableWindowContext ? 'window' : null,
            config.enableLanguageContext ? 'language' : null,
            config.enableDebugContext ? 'debug' : null,
            config.enableSourceControlContext ? 'sourceControl' : null,
            config.enableTasksContext ? 'tasks' : null,
            config.enableExtensionContext ? 'extension' : null,
            config.enableExtensionHostContext ? 'extensionHost' : null,
            config.enableSettingsContext ? 'settings' : null,
            config.enableKeybindingsContext ? 'keybindings' : null,
            config.enableThemeContext ? 'theme' : null,
            config.enableViewsContext ? 'views' : null,
            config.enableCustomEditorsContext ? 'customEditors' : null,
        ].filter(Boolean);
        const contextData = await contextProvider.getAllContext(includeCategories);
        outputChannel.clear();
        outputChannel.appendLine('VSCode Context Data:');
        outputChannel.appendLine(JSON.stringify(contextData, null, 2));
        outputChannel.show(true);
    }, { operation: 'extractContext' }, outputChannel);
}
async function executeSampleCommand() {
    await withErrorHandling(async () => vscode.commands.executeCommand('workbench.action.quickOpen'), { operation: 'executeSample' }, outputChannel);
}
async function createTerminal() {
    await withErrorHandling(async () => {
        const terminal = vscode.window.createTerminal('Cline Terminal');
        terminal.show();
        terminal.sendText('echo "Hello from Cline Terminal"');
    }, { operation: 'createTerminal' }, outputChannel);
}
async function handleDebugStart(session) {
    await withErrorHandling(async () => contextProvider.info(`Debug session started: ${session.name}`, {
        type: session.type,
        name: session.name,
    }), { operation: 'handleDebugStart', session: session.name }, outputChannel);
}
async function handleDebugTerminate(session) {
    await withErrorHandling(async () => contextProvider.info(`Debug session terminated: ${session.name}`, {
        type: session.type,
        name: session.name,
    }), { operation: 'handleDebugTerminate', session: session.name }, outputChannel);
}
async function registerWebview(context) {
    return (await withErrorHandling(async () => {
        const provider = new WebviewProvider(context.extensionUri);
        const registration = vscode.window.registerWebviewViewProvider(`${packageName}.webview`, provider);
        return { provider, registration };
    }, { operation: 'registerWebview' }, outputChannel));
}
export async function activate(context) {
    try {
        outputChannel = vscode.window.createOutputChannel('VSCode Context');
        await initializeContextProvider();
        const onDidChangeActiveTextEditor = subscribeToEvent('onDidChangeActiveTextEditor', () => vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            await handleEditorChange(editor);
        }));
        const onDidChangeWindowState = subscribeToEvent('onDidChangeWindowState', () => vscode.window.onDidChangeWindowState(async (state) => {
            await handleWindowStateChange(state);
        }));
        const extractContextCommand = vscode.commands.registerCommand(`${packageName}.extractContext`, async () => {
            await extractContext();
        });
        const executeSampleCommandRegistration = vscode.commands.registerCommand(`${packageName}.executeSample`, async () => {
            await executeSampleCommand();
        });
        const createTerminalCommand = vscode.commands.registerCommand(`${packageName}.createTerminal`, async () => {
            await createTerminal();
        });
        const onDidStartDebugSession = subscribeToEvent('onDidStartDebugSession', () => vscode.debug.onDidStartDebugSession(async (session) => {
            await handleDebugStart(session);
        }));
        const onDidTerminateDebugSession = subscribeToEvent('onDidTerminateDebugSession', () => vscode.debug.onDidTerminateDebugSession(async (session) => {
            await handleDebugTerminate(session);
        }));
        await withErrorHandling(async () => contextProvider.startTrackingTerminals(), { operation: 'startTrackingTerminals' }, outputChannel);
        const webviewProvider = await registerWebview(context);
        context.subscriptions.push(outputChannel, extractContextCommand, executeSampleCommandRegistration, createTerminalCommand, onDidChangeActiveTextEditor, onDidChangeWindowState, onDidStartDebugSession, onDidTerminateDebugSession, webviewProvider.registration);
        // Subscribe to ContextProvider.EXTRACT_REQUEST event
        contextProvider.on('extractRequest', async () => {
            await extractContext();
        });
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errorMonitor.trackError(err, { phase: 'activation' });
        handleError(err, {
            operation: 'extensionActivation',
            phase: 'activation',
        }, outputChannel);
        throw err;
    }
}
export async function deactivate() {
    await withErrorHandling(async () => {
        if (contextProvider) {
            contextProvider.info(`Extension "${packageName}" is being deactivated`, {
                timestamp: new Date().toISOString(),
            });
            contextProvider = null;
        }
        if (outputChannel) {
            outputChannel.dispose();
        }
    }, { operation: 'deactivate' }, outputChannel);
}
//# sourceMappingURL=extension.js.map