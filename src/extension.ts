import * as vscode from 'vscode';

let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;
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

export function deactivate() {}

async function getAllContext() {
	return {
		workspace: getWorkspaceContext(),
		window: getWindowContext(),
		language: getLanguageContext(),
		debug: getDebugContext(),
		sourceControl: getSourceControlContext(),
		tasks: getTasksContext(),
		extension: getExtensionContext(extensionContext)
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
		sessions: vscode.debug.activeDebugSession ? [{
			type: vscode.debug.activeDebugSession.type,
			name: vscode.debug.activeDebugSession.name
		}] : []
	};
}

function getSourceControlContext() {
	const repo = vscode.workspace.workspaceFolders?.[0]?.uri;
	return {
		repositories: repo ? [{
			rootUri: repo.toString()
		}] : [],
		sourceControlRootUri: repo?.toString()
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
	} catch (error) {
		return {
			tasks: 'Error fetching tasks'
		};
	}
}

function getExtensionContext(context: vscode.ExtensionContext) {
	return {
		globalStateKeys: context.globalState.keys(),
		workspaceStateKeys: context.workspaceState.keys(),
		extensionPath: context.extensionPath
	};
}