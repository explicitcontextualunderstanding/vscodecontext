# Testing Mocks for Terminal Services

## 1. Mock Terminal Data

### 1.1 Mock Terminal Interface

File: `tests/__mocks__/mockTerminal.ts`

```typescript
import * as vscode from 'vscode';

export interface MockTerminalState {
  isActive: boolean;
}

export class MockTerminal implements vscode.Terminal {
  constructor(
    public readonly name: string,
    public readonly processId: number | undefined = 12345,
    public readonly state: MockTerminalState = { isActive: true },
    public readonly creationOptions: vscode.TerminalOptions = {},
    private readonly shellPath: string = '/bin/bash',
  ) {}

  // Implement required Terminal interface methods
  public get shellPath(): string {
    return this.shellPath;
  }

  // Mock implementation of other required methods
  public sendText(text: string, addNewLine?: boolean): void {
    // Mock implementation
  }

  public show(preserveFocus?: boolean): void {
    // Mock implementation
  }

  public hide(): void {
    // Mock implementation
  }

  public dispose(): void {
    // Mock implementation
  }
}
```

### 1.2 Mock Terminal Factory

File: `tests/__mocks__/mockTerminalFactory.ts`

```typescript
import { MockTerminal } from './mockTerminal';

export class MockTerminalFactory {
  static createActive(): MockTerminal {
    return new MockTerminal('Active Terminal', 12345, { isActive: true });
  }

  static createInactive(): MockTerminal {
    return new MockTerminal('Inactive Terminal', 12346, { isActive: false });
  }

  static createWithCustomState(
    name: string,
    processId: number,
    isActive: boolean,
    shellPath?: string,
  ): MockTerminal {
    return new MockTerminal(name, processId, { isActive }, {}, shellPath);
  }
}
```

## 2. Mock Terminal Service

### 2.1 Mock Service Implementation

File: `tests/__mocks__/mockTerminalService.ts`

```typescript
import * as vscode from 'vscode';
import { MockTerminal } from './mockTerminal';
import { TerminalService } from '../../src/services/TerminalService';

export class MockTerminalService extends TerminalService {
  private mockActiveTerminal: MockTerminal | undefined;

  constructor(initialTerminal?: MockTerminal) {
    super();
    this.mockActiveTerminal = initialTerminal;
  }

  public setActiveTerminal(terminal: MockTerminal | undefined): void {
    this.mockActiveTerminal = terminal;
  }

  public override getActiveTerminalContext(): {
    name: string;
    creationOptions: vscode.TerminalOptions | vscode.ExtensionTerminalOptions;
    state: vscode.TerminalState;
    processId: string | null;
    shellPath: string | null;
  } | null {
    if (!this.mockActiveTerminal) {
      return null;
    }

    return {
      name: this.mockActiveTerminal.name,
      creationOptions: this.mockActiveTerminal.creationOptions,
      state: this.mockActiveTerminal.state,
      processId: this.mockActiveTerminal.processId?.toString() ?? null,
      shellPath: this.mockActiveTerminal.shellPath ?? null,
    };
  }
}
```

## 3. Test Helper Utilities

### 3.1 Terminal Test Helpers

File: `tests/helpers/terminalTestHelpers.ts`

```typescript
import { MockTerminal } from '../__mocks__/mockTerminal';
import { MockTerminalService } from '../__mocks__/mockTerminalService';

export class TerminalTestHelper {
  static createMockServiceWithActiveTerminal(): MockTerminalService {
    const activeTerminal = new MockTerminal(
      'Test Terminal',
      12345,
      { isActive: true },
      {},
      '/bin/bash',
    );
    return new MockTerminalService(activeTerminal);
  }

  static createMockServiceWithNoTerminal(): MockTerminalService {
    return new MockTerminalService(undefined);
  }

  static verifyTerminalMetadata(
    metadata: any,
    expected: {
      name: string;
      processId: string | null;
      isActive: boolean;
      shellPath: string | null;
    },
  ): void {
    expect(metadata).toBeDefined();
    expect(metadata.name).toBe(expected.name);
    expect(metadata.processId).toBe(expected.processId);
    expect(metadata.state.isActive).toBe(expected.isActive);
    expect(metadata.shellPath).toBe(expected.shellPath);
  }
}
```

## 4. Example Test Cases

### 4.1 Terminal Service Tests

File: `tests/services/TerminalService.test.ts`

```typescript
import { MockTerminal } from '../__mocks__/mockTerminal';
import { MockTerminalService } from '../__mocks__/mockTerminalService';
import { TerminalTestHelper } from '../helpers/terminalTestHelpers';
import { MockTerminalFactory } from '../__mocks__/mockTerminalFactory';

describe('TerminalService', () => {
  let mockService: MockTerminalService;

  beforeEach(() => {
    mockService = new MockTerminalService();
  });

  describe('getActiveTerminalContext', () => {
    it('should return null when no active terminal', () => {
      mockService.setActiveTerminal(undefined);
      const result = mockService.getActiveTerminalContext();
      expect(result).toBeNull();
    });

    it('should return terminal metadata for active terminal', () => {
      const mockTerminal = MockTerminalFactory.createActive();
      mockService.setActiveTerminal(mockTerminal);

      const result = mockService.getActiveTerminalContext();

      TerminalTestHelper.verifyTerminalMetadata(result, {
        name: 'Active Terminal',
        processId: '12345',
        isActive: true,
        shellPath: '/bin/bash',
      });
    });

    it('should handle custom terminal state', () => {
      const customTerminal = MockTerminalFactory.createWithCustomState(
        'Custom Terminal',
        54321,
        true,
        '/usr/bin/zsh',
      );
      mockService.setActiveTerminal(customTerminal);

      const result = mockService.getActiveTerminalContext();

      TerminalTestHelper.verifyTerminalMetadata(result, {
        name: 'Custom Terminal',
        processId: '54321',
        isActive: true,
        shellPath: '/usr/bin/zsh',
      });
    });
  });
});
```

### 4.2 Active Terminal Tool Tests

File: `tests/tools/ActiveTerminalTool.test.ts`

```typescript
import * as vscode from 'vscode';
import { ActiveTerminalTool } from '../../src/tools/ActiveTerminalTool';
import { MockTerminalService } from '../__mocks__/mockTerminalService';
import { MockTerminalFactory } from '../__mocks__/mockTerminalFactory';

describe('ActiveTerminalTool', () => {
  let tool: ActiveTerminalTool;
  let mockService: MockTerminalService;

  beforeEach(() => {
    mockService = new MockTerminalService();
    tool = new ActiveTerminalTool(mockService);
  });

  describe('invoke', () => {
    it('should return formatted terminal info when terminal is active', async () => {
      const activeTerminal = MockTerminalFactory.createActive();
      mockService.setActiveTerminal(activeTerminal);

      const result = await tool.invoke(
        {} as vscode.LanguageModelToolInvocationOptions<Record<string, never>>,
        {} as vscode.CancellationToken,
      );

      expect(result.parts[0].text).toContain('Active Terminal');
      expect(result.parts[0].text).toContain('12345');
      expect(result.parts[0].text).toContain('/bin/bash');
      expect(result.parts[0].text).toContain('Active');
    });

    it('should return no terminal message when no active terminal', async () => {
      mockService.setActiveTerminal(undefined);

      const result = await tool.invoke(
        {} as vscode.LanguageModelToolInvocationOptions<Record<string, never>>,
        {} as vscode.CancellationToken,
      );

      expect(result.parts[0].text).toContain('No active terminal found');
    });
  });
});
```

## Usage Guide

1. **Setting Up Mocks**:

```typescript
// Create a mock service with an active terminal
const mockService = TerminalTestHelper.createMockServiceWithActiveTerminal();

// Create a mock service with no terminal
const emptyService = TerminalTestHelper.createMockServiceWithNoTerminal();

// Create a custom terminal
const customTerminal = MockTerminalFactory.createWithCustomState(
  'My Terminal',
  12345,
  true,
  '/custom/shell',
);
```

2. **Using in Tests**:

```typescript
describe('My Terminal Feature', () => {
  let mockService: MockTerminalService;

  beforeEach(() => {
    mockService = new MockTerminalService();
  });

  it('should handle terminal state changes', () => {
    // Arrange
    const terminal = MockTerminalFactory.createActive();
    mockService.setActiveTerminal(terminal);

    // Act
    const result = mockService.getActiveTerminalContext();

    // Assert
    TerminalTestHelper.verifyTerminalMetadata(result, {
      name: 'Active Terminal',
      processId: '12345',
      isActive: true,
      shellPath: '/bin/bash',
    });
  });
});
```

## Benefits of This Mock Implementation

1. **Controlled Testing Environment**

   - Predictable terminal states
   - No dependency on actual VS Code terminal
   - Consistent test results

2. **Flexible Configuration**

   - Easy to create different terminal states
   - Customizable terminal properties
   - Reusable mock objects

3. **Comprehensive Testing**

   - Test edge cases easily
   - Verify error handling
   - Test different terminal states

4. **Maintainable Tests**
   - Clear test structure
   - Reusable helper methods
   - Easy to update mock behavior
