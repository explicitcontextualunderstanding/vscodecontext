"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Congratulations, your extension "vscode-context" is now active!');
    let disposable = vscode.commands.registerCommand('vscode-context.extractContext', async () => {
        const contextData = await getAllContext();
        const outputChannel = vscode.window.createOutputChannel('VSCode Context');
        outputChannel.clear();
        outputChannel.appendLine('VSCode Context Data:');
        outputChannel.appendLine(JSON.stringify(contextData, null, 2));
        outputChannel.show(true);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
async function getAllContext() {
    return {
        workspace: getWorkspaceContext(),
        window: getWindowContext(),
        language: getLanguageContext(),
        debug: getDebugContext(),
        sourceControl: getSourceControlContext(),
        tasks: getTasksContext(),
        extension: getExtensionContext()
    };
}
function getWorkspaceContext() {
    return {
        workspaceFolders: vscode.workspace.workspaceFolders?.map(folder => ({
            uri: folder.uri.toString()
        })),
        workspaceFs: 'vscode.workspace.fs (Available)', // Indicate availability
        configuration: getConfig()
    };
}
function getConfig() {
    return {
        // Example of fetching a specific configuration. You can expand this based on your needs.
        editorFontSize: vscode.workspace.getConfiguration('editor').get('fontSize')
    };
}
function getWindowContext() {
    return {
        activeTextEditor: vscode.window.activeTextEditor ? {
            uri: vscode.window.activeTextEditor.document.uri.toString(),
            languageId: vscode.window.activeTextEditor.document.languageId,
            selection: {
                start: { line: vscode.window.activeTextEditor.selection.start.line, character: vscode.window.activeTextEditor.selection.start.character },
                end: { line: vscode.window.activeTextEditor.selection.end.line, character: vscode.window.activeTextEditor.selection.end.character }
            }
        } : undefined,
        textEditorDocument: vscode.window.activeTextEditor?.document ? {
            uri: vscode.window.activeTextEditor.document.uri.toString(),
            fileName: vscode.window.activeTextEditor.document.fileName,
            isDirty: vscode.window.activeTextEditor.document.isDirty,
            isUntitled: vscode.window.activeTextEditor.document.isUntitled,
            languageId: vscode.window.activeTextEditor.document.languageId
        } : undefined,
        textEditorSelection: vscode.window.activeTextEditor ? {
            start: { line: vscode.window.activeTextEditor.selection.start.line, character: vscode.window.activeTextEditor.selection.start.character },
            end: { line: vscode.window.activeTextEditor.selection.end.line, character: vscode.window.activeTextEditor.selection.end.character }
        } : undefined,
        visibleTextEditors: vscode.window.visibleTextEditors.map(editor => ({
            uri: editor.document.uri.toString(),
            languageId: editor.document.languageId
        })),
        activeTerminal: vscode.window.activeTerminal ? {
            name: vscode.window.activeTerminal.name
        } : undefined,
        terminals: vscode.window.terminals.map(terminal => ({
            name: terminal.name
        })),
        activeEditorSelections: vscode.window.activeTextEditor?.selections.map(selection => ({
            start: { line: selection.start.line, character: selection.start.character },
            end: { line: selection.end.line, character: selection.end.character }
        })),
        // Note: These are event subscriptions, so we indicate their availability
        onDidChangeActiveTextEditor: 'vscode.window.onDidChangeActiveTextEditor (Subscription)',
        onDidChangeWindowState: 'vscode.window.onDidChangeWindowState (Subscription)',
        activeEditorLanguageId: vscode.window.activeTextEditor?.document.languageId
    };
}
function getLanguageContext() {
    return {
        activeEditorLanguageId: vscode.window.activeTextEditor?.document.languageId
    };
}
function getDebugContext() {
    return {
        activeDebugSession: vscode.debug.activeDebugSession ? {
            type: vscode.debug.activeDebugSession.type,
            name: vscode.debug.activeDebugSession.name
        } : undefined,
        sessions: vscode.debug.sessions.map(session => ({
            type: session.type,
            name: session.name
        }))
    };
}
function getSourceControlContext() {
    return {
        repositories: vscode.scm.repositories.map(repo => ({
            rootUri: repo.rootUri.toString()
        })),
        // Note: Accessing rootUri directly on SourceControl object in the array
        sourceControlRootUri: vscode.scm.repositories.length > 0 ? vscode.scm.repositories[0].rootUri.toString() : undefined
    };
}
async function getTasksContext() {
    try {
        const tasks = await vscode.tasks.fetchTasks();
        return {
            tasks: tasks.map(task => ({
                name: task.name,
                source: task.source,
                execution: task.execution instanceof vscode.ShellExecution ? 'ShellExecution' :
                    task.execution instanceof vscode.ProcessExecution ? 'ProcessExecution' : 'Other'
            }))
        };
    }
    catch (error) {
        return {
            tasks: 'Error fetching tasks'
        };
    }
}
function getExtensionContext() {
    return {
        globalStateKeys: context.globalState.keys(),
        workspaceStateKeys: context.workspaceState.keys(),
        extensionPath: context.extensionPath
    };
}
