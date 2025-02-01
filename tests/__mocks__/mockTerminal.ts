import * as vscode from 'vscode';

export interface MockTerminalState {
  isActive: boolean;
  isInteractedWith: boolean;
}

export class MockTerminal implements Partial<vscode.Terminal> {
  private _processId: Promise<number | undefined>;
  public readonly exitStatus: vscode.TerminalExitStatus | undefined;
  public readonly shellIntegration: vscode.TerminalShellIntegration = {
    cwd: vscode.Uri.file('/mock/path'),
    executeCommand: (
      commandLineOrExecutable: string,
      args?: string[],
    ): vscode.TerminalShellExecution => {
      const commandLine = args
        ? `${commandLineOrExecutable} ${args.join(' ')}`
        : commandLineOrExecutable;

      return {
        commandLine: {
          value: commandLine,
          isTrusted: true,
          confidence: 1, // High confidence
        },
        cwd: vscode.Uri.file('/mock/path'),
        read: async function* () {
          yield 'mock output';
        },
      };
    },
  };

  constructor(
    public readonly name: string,
    processId: number | undefined = 12345,
    public readonly state: MockTerminalState = { isActive: true, isInteractedWith: false },
    public readonly creationOptions: vscode.TerminalOptions = {},
    private readonly _shellPath: string = '/bin/bash',
  ) {
    this._processId = Promise.resolve(processId);
  }

  public get processId(): Promise<number | undefined> {
    return this._processId;
  }

  public get shellPath(): string {
    return this._shellPath;
  }

  public sendText(/* text: string, addNewLine?: boolean */): void {
    // Mock implementation
  }

  public show(/* preserveFocus?: boolean */): void {
    // Mock implementation
  }

  public hide(): void {
    // Mock implementation
  }

  public dispose(): void {
    // Mock implementation
  }
}
