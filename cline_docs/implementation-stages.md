# Implementation Stages

## Stage 1: Core Service Implementation

### 1.1 Create Terminal Service

File: `src/services/TerminalService.ts`

```typescript
import * as vscode from 'vscode';

interface TerminalMetadata {
  name: string;
  creationOptions: vscode.TerminalOptions | vscode.ExtensionTerminalOptions;
  state: vscode.TerminalState;
  processId: string | null;
  shellPath: string | null;
}

export class TerminalService {
  constructor() {}

  public getActiveTerminalContext(): TerminalMetadata | null {
    const activeTerminal = vscode.window.activeTerminal;
    return activeTerminal ? this.getTerminalMetadata(activeTerminal) : null;
  }

  private getTerminalMetadata(terminal: vscode.Terminal): TerminalMetadata {
    return {
      name: terminal.name,
      creationOptions: terminal.creationOptions,
      state: terminal.state,
      processId: terminal.processId !== undefined ? String(terminal.processId) : null,
      shellPath: this.getShellPath(terminal),
    };
  }

  private getShellPath(terminal: vscode.Terminal): string | null {
    try {
      const options = terminal.creationOptions;
      if (options && 'shellPath' in options) {
        return (options as vscode.TerminalOptions).shellPath ?? null;
      }

      interface VSCodeTerminalInternal {
        _shellPath?: { value: string };
        _ptyProcess?: { shellPath: string };
      }

      const internalTerm = terminal as unknown as VSCodeTerminalInternal;
      const shellPath = internalTerm._shellPath?.value ?? internalTerm._ptyProcess?.shellPath;

      return typeof shellPath === 'string' ? shellPath : null;
    } catch (error) {
      console.error('Error getting shell path:', error);
      return null;
    }
  }

  public async getActiveTerminalContextForTool(): Promise<vscode.LanguageModelToolResult> {
    const terminalData = this.getActiveTerminalContext();

    if (!terminalData) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart('No active terminal found.'),
      ]);
    }

    const formattedDetails = [
      `Active Terminal Details:`,
      `Name: ${terminalData.name}`,
      `Process ID: ${terminalData.processId || 'N/A'}`,
      `Shell Path: ${terminalData.shellPath || 'N/A'}`,
      `State: ${terminalData.state.isActive ? 'Active' : 'Inactive'}`,
    ].join('\n');

    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(formattedDetails)]);
  }
}
```

## Stage 2: Language Model Tool Implementation

### 2.1 Create Active Terminal Tool

File: `src/tools/ActiveTerminalTool.ts`

```typescript
import * as vscode from 'vscode';
import { TerminalService } from '../services/TerminalService';

export class ActiveTerminalTool implements vscode.LanguageModelTool<Record<string, never>> {
  public readonly name = 'vscode-context.getActiveTerminal';

  constructor(private readonly terminalService: TerminalService) {}

  async prepareInvocation(
    _options: vscode.LanguageModelToolInvocationPrepareOptions<Record<string, never>>,
    _token: vscode.CancellationToken,
  ): Promise<vscode.LanguageModelToolInvocation> {
    return {
      confirmationMessages: {
        title: 'Get Active Terminal Info',
        message: new vscode.MarkdownString(
          'Do you want to get information about the active terminal?',
        ),
      },
      invocationMessage: 'Retrieving active terminal information...',
    };
  }

  async invoke(
    _options: vscode.LanguageModelToolInvocationOptions<Record<string, never>>,
    _token: vscode.CancellationToken,
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      return await this.terminalService.getActiveTerminalContextForTool();
    } catch (error) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `Error retrieving terminal information: ${error instanceof Error ? error.message : String(error)}`,
        ),
      ]);
    }
  }
}
```

## Stage 3: Package Configuration

### 3.1 Update package.json

File: `package.json` (add to existing file)

```json
{
  "contributes": {
    "languageModelTools": [
      {
        "name": "vscode-context.getActiveTerminal",
        "tags": ["terminal", "context"],
        "toolReferenceName": "getActiveTerminal",
        "displayName": "Get Active Terminal Information",
        "modelDescription": "Retrieves information about the currently active VS Code terminal including name, process ID, shell path, and state",
        "icon": "$(terminal)"
      }
    ]
  },
  "activationEvents": ["onStartupFinished"]
}
```

## Stage 4: Extension Integration

### 4.1 Update Extension Entry Point

File: `src/extension.ts` (modify existing file)

```typescript
import * as vscode from 'vscode';
import { TerminalService } from './services/TerminalService';
import { ActiveTerminalTool } from './tools/ActiveTerminalTool';

let terminalService: TerminalService;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    // Initialize services
    terminalService = new TerminalService();

    // Register Language Model Tool
    const terminalTool = new ActiveTerminalTool(terminalService);
    const toolRegistration = vscode.lm.registerTool(
      'vscode-context.getActiveTerminal',
      terminalTool,
    );

    context.subscriptions.push(toolRegistration);
  } catch (error) {
    console.error('Error activating extension:', error);
    throw error;
  }
}

export function deactivate(): void {
  // Cleanup if needed
}
```

## Stage 5: Testing Implementation

### 5.1 Create Service Tests

File: `tests/services/TerminalService.test.ts`

```typescript
import * as vscode from 'vscode';
import { TerminalService } from '../../src/services/TerminalService';

describe('TerminalService', () => {
  let terminalService: TerminalService;

  beforeEach(() => {
    terminalService = new TerminalService();
  });

  describe('getActiveTerminalContext', () => {
    it('should return null when no active terminal', () => {
      // Mock vscode.window.activeTerminal
      jest.spyOn(vscode.window, 'activeTerminal', 'get').mockReturnValue(undefined);

      const result = terminalService.getActiveTerminalContext();
      expect(result).toBeNull();
    });

    it('should return terminal metadata when active terminal exists', () => {
      // Mock active terminal
      const mockTerminal = {
        name: 'Test Terminal',
        creationOptions: {},
        state: { isActive: true },
        processId: 123,
      };

      jest.spyOn(vscode.window, 'activeTerminal', 'get').mockReturnValue(mockTerminal as any);

      const result = terminalService.getActiveTerminalContext();
      expect(result).toMatchObject({
        name: 'Test Terminal',
        processId: '123',
      });
    });
  });
});
```

### 5.2 Create Tool Tests

File: `tests/tools/ActiveTerminalTool.test.ts`

```typescript
import * as vscode from 'vscode';
import { ActiveTerminalTool } from '../../src/tools/ActiveTerminalTool';
import { TerminalService } from '../../src/services/TerminalService';

describe('ActiveTerminalTool', () => {
  let tool: ActiveTerminalTool;
  let mockTerminalService: jest.Mocked<TerminalService>;

  beforeEach(() => {
    mockTerminalService = {
      getActiveTerminalContextForTool: jest.fn(),
    } as any;

    tool = new ActiveTerminalTool(mockTerminalService);
  });

  describe('invoke', () => {
    it('should return terminal information when available', async () => {
      const mockResult = new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart('Test Terminal Info'),
      ]);

      mockTerminalService.getActiveTerminalContextForTool.mockResolvedValue(mockResult);

      const result = await tool.invoke({} as any, {} as any);
      expect(result).toBe(mockResult);
    });

    it('should handle errors gracefully', async () => {
      mockTerminalService.getActiveTerminalContextForTool.mockRejectedValue(
        new Error('Test error'),
      );

      const result = await tool.invoke({} as any, {} as any);
      expect(result.parts[0].text).toContain('Error retrieving terminal information');
    });
  });
});
```

## Implementation Order

1. **Stage 1**: Implement TerminalService

   - Create service directory
   - Implement core functionality
   - Test basic terminal operations

2. **Stage 2**: Create ActiveTerminalTool

   - Set up tools directory
   - Implement tool interface
   - Add error handling

3. **Stage 3**: Configure Package

   - Update package.json
   - Add tool definitions
   - Configure activation events

4. **Stage 4**: Extension Integration

   - Update extension.ts
   - Add service initialization
   - Register tool with VS Code

5. **Stage 5**: Testing
   - Implement service tests
   - Add tool tests
   - Manual testing in VS Code

## Verification Steps

After each stage:

1. Run TypeScript compiler (`tsc`)
2. Run tests (`npm test`)
3. Build extension (`npm run build`)
4. Test in VS Code Extension Development Host
5. Verify tool registration and functionality

## Rollback Plan

For each stage:

1. Keep backup of modified files
2. Document changes in git commits
3. Test changes in isolation
4. Have clear reversion steps if needed
