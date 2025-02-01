import type * as vscode from 'vscode';

export interface MockTerminalState {
  isActive: boolean;
  isInteractedWith: boolean;
}

interface UriComponents {
  scheme: string;
  path: string;
}

// Mock Uri implementation
class MockUri implements vscode.Uri {
  constructor(
    public readonly scheme: string,
    public readonly path: string,
  ) {}

  public readonly authority = '';
  public readonly query = '';
  public readonly fragment = '';
  public get fsPath(): string {
    return this.path;
  }
  public with(): vscode.Uri {
    return this;
  }
  public toString(): string {
    return `${this.scheme}://${this.path}`;
  }
  public toJSON(): UriComponents {
    return { scheme: this.scheme, path: this.path };
  }
}

export class MockTerminal implements Partial<vscode.Terminal> {
  private _processId: Promise<number | undefined>;
  public readonly exitStatus: vscode.TerminalExitStatus | undefined;
  public readonly shellIntegration: vscode.TerminalShellIntegration;

  constructor(
    public readonly name: string,
    processId: number | undefined = 12345,
    public readonly state: MockTerminalState = { isActive: true, isInteractedWith: false },
    public readonly creationOptions: vscode.TerminalOptions = {},
    private readonly _shellPath: string = '/bin/bash',
  ) {
    this._processId = Promise.resolve(processId);

    // Initialize shell integration with mocked Uri
    this.shellIntegration = {
      cwd: new MockUri('file', '/mock/path'),
      executeCommand: (
        commandLineOrExecutable: string,
        args?: string[],
      ): vscode.TerminalShellExecution => {
        const commandLine = args
          ? `${commandLineOrExecutable} ${args.join(' ')}`
          : commandLineOrExecutable;

        return {
          commandLine: { value: commandLine, isTrusted: true, confidence: 1 },
          cwd: new MockUri('file', '/mock/path'),
          read: async function* () {
            yield 'mock output';
          },
        };
      },
    };
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
