import {
  type ConfigurationChangeEvent,
  type Disposable,
  type ExtensionContext,
  type TextDocument,
  type TextDocumentChangeEvent,
  type TextEditor,
  type TextEditorOptionsChangeEvent,
  type TextEditorSelectionChangeEvent,
  type TextEditorViewColumnChangeEvent,
  type TextEditorVisibleRangesChangeEvent,
  type WorkspaceFoldersChangeEvent,
  window,
  workspace,
} from 'vscode';
import type { IContextProvider } from './interfaces/IContextProvider';
import { EventAggregator } from './providers/eventAggregator';
import { type ContextProviderConfig } from './providers/contextContracts';
import {
  DebugContextProvider,
  type DebugContext,
} from './providers/DebugContextProvider';
import {
  EditorContextProvider,
  type EditorContext,
} from './providers/EditorContextProvider';
import {
  ExtensionHostContextProvider,
  type ExtensionHostContext,
} from './providers/ExtensionHostContextProvider';
import {
  SCMContextProvider,
  type SCMContext,
} from './providers/SCMContextProvider';
import {
  TasksContextProvider,
  type TasksContext,
} from './providers/TasksContextProvider';
import {
  TerminalContextProvider,
  type TerminalContext,
} from './providers/TerminalContextProvider';
import {
  WorkspaceContextProvider,
  type WorkspaceContext,
} from './providers/WorkspaceContextProvider';
import { ProviderManager } from './providers/ProviderManager';
import { ContextCategory } from './providers/contextContracts'; // Import ContextCategory

export type ContextData = {
  editor?: EditorContext;
  workspace?: WorkspaceContext;
  scm?: SCMContext;
  debug?: DebugContext;
  tasks?: TasksContext;
  terminal?: TerminalContext;
  extensionHost?: ExtensionHostContext;
};

export class ContextProvider implements IContextProvider {
  // Implement IContextProvider
  readonly category = ContextCategory.Workspace; // Corrected category to Workspace
  config!: ContextProviderConfig; // Add config property
  private eventAggregator: EventAggregator;
  private providerManager: ProviderManager;

  constructor(
    config: ContextProviderConfig,
    extensionContext: ExtensionContext,
  ) {
    this.config = config;
    this.eventAggregator = new EventAggregator();
    this.providerManager = new ProviderManager([
      new EditorContextProvider(),
      new WorkspaceContextProvider(
        window.createOutputChannel('WorkspaceContext'),
      ), // Pass output channel
      new TerminalContextProvider(this.eventAggregator), // Pass eventAggregator
      new TasksContextProvider(),
      new DebugContextProvider(window.createOutputChannel('DebugContext')), // Pass output channel
      new ExtensionHostContextProvider(),
      new SCMContextProvider(), // Instantiate SCMContextProvider
    ]);

    this.registerEventListeners(extensionContext);
  }

  private registerEventListeners(extensionContext: ExtensionContext): void {
    const disposables: Disposable[] = [];

    // Register workspace events
    disposables.push(
      workspace.onDidChangeConfiguration(this.onConfigurationChange.bind(this)),
    );
    disposables.push(
      workspace.onDidChangeWorkspaceFolders(
        this.onWorkspaceFoldersChange.bind(this),
      ),
    );
    disposables.push(
      workspace.onDidSaveTextDocument(this.onTextDocumentSave.bind(this)),
    );
    disposables.push(
      workspace.onDidOpenTextDocument(this.onTextDocumentOpen.bind(this)),
    );
    disposables.push(
      workspace.onDidCloseTextDocument(this.onTextDocumentClose.bind(this)),
    );
    disposables.push(
      workspace.onDidChangeTextDocument(this.onTextDocumentChange.bind(this)),
    );

    // Register editor events
    disposables.push(
      window.onDidChangeActiveTextEditor(
        this.onActiveTextEditorChange.bind(this),
      ),
    );
    disposables.push(
      window.onDidChangeVisibleTextEditors(
        this.onVisibleTextEditorsChange.bind(this),
      ),
    );
    disposables.push(
      window.onDidChangeTextEditorSelection(
        this.onTextEditorSelectionChange.bind(this),
      ),
    );
    disposables.push(
      window.onDidChangeTextEditorVisibleRanges(
        this.onTextEditorVisibleRangesChange.bind(this),
      ),
    );
    disposables.push(
      window.onDidChangeTextEditorOptions(
        this.onTextEditorOptionsChange.bind(this),
      ),
    );
    disposables.push(
      window.onDidChangeTextEditorViewColumn(
        this.onTextEditorViewColumnChange.bind(this),
      ),
    );

    // Register the disposables
    extensionContext.subscriptions.push(...disposables);
  }

  private onConfigurationChange(event: ConfigurationChangeEvent): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: event,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onWorkspaceFoldersChange(event: WorkspaceFoldersChangeEvent): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: event,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onTextDocumentSave(document: TextDocument): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: document,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onTextDocumentOpen(document: TextDocument): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: document,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onTextDocumentClose(document: TextDocument): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: document,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onTextDocumentChange(event: TextDocumentChangeEvent): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: event,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onActiveTextEditorChange(editor: TextEditor | undefined): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: editor,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onVisibleTextEditorsChange(editors: readonly TextEditor[]): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: editors,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onTextEditorSelectionChange(
    event: TextEditorSelectionChangeEvent,
  ): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: event,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onTextEditorVisibleRangesChange(
    event: TextEditorVisibleRangesChangeEvent,
  ): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: event,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onTextEditorOptionsChange(event: TextEditorOptionsChangeEvent): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: event,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  private onTextEditorViewColumnChange(
    event: TextEditorViewColumnChangeEvent,
  ): void {
    this.eventAggregator.queueEvent({
      type: 'state_change', // Corrected event type
      payload: event,
      metadata: { source: 'vscode-context', timestamp: Date.now() }, // Added metadata
    });
  }

  configure(config: ContextProviderConfig): void {
    // Implement configure method
    this.config = config;
  }
  async initialize(): Promise<void> {
    // Implement initialize method
    return this.providerManager.initialize();
  }
  triggerContextExtraction(): void {
    // Implement triggerContextExtraction method
    // this.providerManager.triggerContextExtraction(); // Removed incorrect call
  }
  async getAllContext(_categories: string[]): Promise<ContextData> {
    // Implement getAllContext method
    return this.providerManager.getContext();
  }

  public async getContext(): Promise<ContextData> {
    return this.providerManager.getContext();
  }

  public dispose(): void {
    this.eventAggregator.dispose();
  }
}
