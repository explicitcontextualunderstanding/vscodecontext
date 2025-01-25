import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import type * as vscode from 'vscode';
import { ContextProvider } from '../src/contextProvider';

describe('ContextProvider End-to-End', () => {
  let provider: ContextProvider;
  let channel: vscode.OutputChannel;

  beforeAll(() => {
    channel = {
      appendLine: vi.fn(),
      clear: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    } as unknown as vscode.OutputChannel;

    provider = new ContextProvider(channel);
  });

  afterAll(() => {
    channel.dispose();
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

    expect(context).toBeDefined();
    expect(context).toHaveProperty('Editor');
    expect(context).toHaveProperty('Terminal');
    expect(context).toHaveProperty('Workspace');
    expect(context).toHaveProperty('Debug');
    expect(context).toHaveProperty('SCM');
    expect(context).toHaveProperty('Tasks');
  });

  it('should gather editor context correctly', async () => {
    const context = await provider.getAllContext(['Editor']);
    expect(context.Editor).toBeDefined();
    expect(context.Editor).toHaveProperty('activeTextEditor');
    expect(context.Editor).toHaveProperty('selections');
    expect(context.Editor).toHaveProperty('visibleTextEditors');
  });

  it('should gather terminal context correctly', async () => {
    const context = await provider.getAllContext(['Terminal']);
    expect(context.Terminal).toBeDefined();
    expect(context.Terminal).toHaveProperty('activeTerminal');
    expect(context.Terminal).toHaveProperty('allTerminals');
  });

  it('should gather workspace context correctly', async () => {
    const context = await provider.getAllContext(['Workspace']);
    expect(context.Workspace).toBeDefined();
    expect(context.Workspace).toHaveProperty('workspaceFolders');
    expect(context.Workspace).toHaveProperty('workspaceConfiguration');
  });

  it('should gather debug context correctly', async () => {
    const context = await provider.getAllContext(['Debug']);
    expect(context.Debug).toBeDefined();
    expect(context.Debug).toHaveProperty('activeDebugSessions');
    expect(context.Debug).toHaveProperty('breakpoints');
  });

  it('should gather SCM context correctly', async () => {
    const context = await provider.getAllContext(['SCM']);
    expect(context.SCM).toBeDefined();
    expect(context.SCM).toHaveProperty('repositories');
    expect(context.SCM).toHaveProperty('commitDetails');
  });

  it('should gather tasks context correctly', async () => {
    const context = await provider.getAllContext(['Tasks']);
    expect(context.Tasks).toBeDefined();
    expect(context.Tasks).toHaveProperty('taskConfigurations');
    expect(context.Tasks).toHaveProperty('taskStatuses');
  });
});
