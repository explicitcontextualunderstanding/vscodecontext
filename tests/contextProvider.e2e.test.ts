import * as vscode from 'vscode';
import { ContextProvider } from '../src/contextProvider';

describe('ContextProvider End-to-End', () => {
  let provider: ContextProvider;
  let channel: vscode.OutputChannel;

  beforeAll(() => {
    channel = vscode.window.createOutputChannel('Test Channel');
    provider = new ContextProvider(channel);
  });

  it('should gather complete context', async () => {
    const context = await provider.getAllContext([
      'Editor',
      'Terminal',
      'Workspace',
      'Debug',
      'SCM',
      'Tasks',
    ]);
    expect(context).toHaveProperty('Editor');
    expect(context).toHaveProperty('Terminal');
    expect(context).toHaveProperty('Workspace');
    expect(context).toHaveProperty('Debug');
    expect(context).toHaveProperty('SCM');
    expect(context).toHaveProperty('Tasks');
  });

  it('should gather editor context correctly', async () => {
    const context = await provider.gatherContext();
    expect(context.Editor).toHaveProperty('activeTextEditor');
    expect(context.Editor).toHaveProperty('selections');
    expect(context.Editor).toHaveProperty('visibleTextEditors');
  });

  it('should gather terminal context correctly', async () => {
    const context = await provider.gatherContext();
    expect(context.Terminal).toHaveProperty('activeTerminal');
    expect(context.Terminal).toHaveProperty('allTerminals');
  });

  it('should gather workspace context correctly', async () => {
    const context = await provider.gatherContext();
    expect(context.Workspace).toHaveProperty('workspaceFolders');
    expect(context.Workspace).toHaveProperty('workspaceConfiguration');
  });

  it('should gather debug context correctly', async () => {
    const context = await provider.gatherContext();
    expect(context.Debug).toHaveProperty('activeDebugSessions');
    expect(context.Debug).toHaveProperty('breakpoints');
  });

  it('should gather SCM context correctly', async () => {
    const context = await provider.gatherContext();
    expect(context.SCM).toHaveProperty('repositories');
    expect(context.SCM).toHaveProperty('commitDetails');
  });

  it('should gather tasks context correctly', async () => {
    const context = await provider.gatherContext();
    expect(context.Tasks).toHaveProperty('taskConfigurations');
    expect(context.Tasks).toHaveProperty('taskStatuses');
  });
});
