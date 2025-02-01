# Implementation Plan: Output Manager

## 1. Base Interface

```typescript
interface OutputManager {
  // @ts-expect-error - Allow any for flexibility
  register(args: any): Promise<void>;
  // @ts-expect-error - Allow any for flexibility
  invoke(args: any): Promise<unknown>;
}
```

## 2. VS Code Language Model Output

```typescript
import * as vscode from 'vscode';
import { TerminalService } from '../services/TerminalService';
import { OutputManager } from './OutputManager';

export class VSCodeLanguageModelOutput implements OutputManager {
  constructor(private readonly terminalService: TerminalService) {}

  // @ts-expect-error - Allow any for flexibility
  public async register(args: any): Promise<void> {
    // Basic registration with VS Code LM API
    // Will be expanded in future to handle multiple tools
    vscode.lm.registerTool('vscode-context.getActiveTerminal', {
      name: 'vscode-context.getActiveTerminal',
      async invoke(): Promise<vscode.LanguageModelToolResult> {
        return this.terminalService.getActiveTerminalContextForTool();
      },
    });
  }

  // @ts-expect-error - Allow any for flexibility
  public async invoke(args: any): Promise<vscode.LanguageModelToolResult> {
    // For now, just invoke terminal context
    return this.terminalService.getActiveTerminalContextForTool();
  }
}
```

## 3. Directory Structure

```
src/
  outputManagers/
    OutputManager.ts           # Interface definition
    VSCodeLanguageModelOutput.ts  # VS Code implementation
  services/
    TerminalService.ts        # Existing service
```

## 4. Implementation Steps

1. Create outputManagers directory
2. Create OutputManager interface
3. Implement VSCodeLanguageModelOutput
4. Add tests for VSCodeLanguageModelOutput

## 5. Testing Approach

```typescript
describe('VSCodeLanguageModelOutput', () => {
  let output: VSCodeLanguageModelOutput;
  let mockTerminalService: jest.Mocked<TerminalService>;

  beforeEach(() => {
    mockTerminalService = {
      getActiveTerminalContextForTool: jest.fn(),
    } as any;

    output = new VSCodeLanguageModelOutput(mockTerminalService);
  });

  describe('register', () => {
    it('should register with VS Code LM API', async () => {
      const mockRegisterTool = jest.fn();
      (vscode.lm as any) = { registerTool: mockRegisterTool };

      await output.register({});

      expect(mockRegisterTool).toHaveBeenCalledWith(
        'vscode-context.getActiveTerminal',
        expect.any(Object),
      );
    });
  });

  describe('invoke', () => {
    it('should call terminal service', async () => {
      const mockResult = new vscode.LanguageModelToolResult([]);
      mockTerminalService.getActiveTerminalContextForTool.mockResolvedValue(mockResult);

      const result = await output.invoke({});

      expect(result).toBe(mockResult);
      expect(mockTerminalService.getActiveTerminalContextForTool).toHaveBeenCalled();
    });
  });
});
```

## 6. Key Points

1. **Simplified Interface**

   - Just register and invoke methods
   - Using any type with ESLint ignore comments
   - No dispose or lifecycle management yet

2. **Service Integration**

   - Services injected via constructor
   - No service discovery or dynamic loading
   - Direct service method calls

3. **VS Code Integration**

   - Basic tool registration
   - Single tool support initially
   - Direct invocation to terminal service

4. **Future Considerations**
   - Tool type handling will be added later
   - Configuration management to be implemented
   - Extension integration to be added
   - Multiple tool support to be added

## 7. Questions Resolved

1. ✅ Service injection via constructor
2. ✅ Basic register/invoke methods
3. ✅ ESLint handling for any types
4. ✅ No tool definitions needed yet
5. ✅ No extension.ts integration required

## 8. Next Steps

1. Implement OutputManager interface
2. Create VSCodeLanguageModelOutput class
3. Add tests
4. Document usage
