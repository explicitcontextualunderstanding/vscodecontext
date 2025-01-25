# TypeScript Code Generation Rules for Roo

## Class Implementation
```typescript
export class ContextProvider implements IContextProvider {
  private readonly _logger = createLogger('ContextProvider');

  constructor(private readonly _config: Config) {}

  public async getContext(): Promise<ContextData> {
    try {
      // Implementation
    } catch (error) {
      this._logger.error('Failed to get context:', error);
      throw new ContextError(error);
    }
  }
}
```

## Error Handling
```typescript
try {
  await asyncOperation();
} catch (error) {
  this._logger.error('Operation failed:', error);
  throw new CustomError(
    `Failed to perform operation: ${isError(error) ? error.message : 'Unknown error'}`
  );
}
```

## Import Organization
```typescript
// Node built-ins first
import { readFile } from 'fs/promises';
// Framework imports
import * as vscode from 'vscode';
// Third-party modules
import { debounce } from 'lodash-es';

// Internal absolute imports
import { IContextProvider } from '@/interfaces';
// Internal relative imports
import { createLogger } from '#/utils/logger';
// Local imports last
import { LOCAL_CONFIG } from './constants';
```

## Test Structure
```typescript
describe('ContextProvider', () => {
  let sut: ContextProvider;
  let dependencies: Dependencies;

  beforeEach(() => {
    dependencies = createDependencies();
    sut = new ContextProvider(dependencies);
  });

  describe('getContext()', () => {
    it('should handle successful case', async () => {
      // Arrange
      const input = createInput();

      // Act
      const result = await sut.getContext(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should handle error case', async () => {
      // Arrange
      const error = new Error('Test error');
      jest.spyOn(dependencies, 'method').mockRejectedValue(error);

      // Act & Assert
      await expect(sut.methodName()).rejects.toThrow('Expected error');
    });
  });
});
```

## Type Definitions
```typescript
// Interface with I prefix
interface IExample {
  // Public methods use Promise for async
  methodName(): Promise<ResultType>;
  
  // Read-only where possible
  readonly property: string;
}

// Union types for results
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

// Type guards
function isError(value: unknown): value is Error {
  return value instanceof Error;
}
```

## File Naming
- Source: kebab-case.ts (context-provider.ts)
- Tests: {name}.test.ts (context-provider.test.ts)
- Types: {name}.d.ts (context-provider.d.ts)
- E2E: {name}.e2e.ts (context-provider.e2e.ts)

## Documentation
```typescript
/**
 * Provides context data from VS Code environment.
 * @interface
 * @template T - Type of context data provided
 */
export interface IContextProvider<T> {
  /**
   * Retrieves current context data.
   * @returns Promise resolving to context data
   * @throws {ContextError} If context cannot be retrieved
   */
  getContext(): Promise<T>;
}
```

## Patterns to Follow

### Event Handling
```typescript
class TypedEventEmitter<T> {
  private readonly handlers = new Set<EventHandler<T>>();

  public on(handler: EventHandler<T>): Disposable {
    this.handlers.add(handler);
    return {
      dispose: () => {
        this.handlers.delete(handler);
      }
    };
  }
}
```

### Dependency Injection
```typescript
class Service {
  constructor(
    private readonly dependency1: Dependency1,
    private readonly dependency2: Dependency2
  ) {}
}
```

### Error Types
```typescript
class CustomError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'CUSTOM_ERROR'
  ) {
    super(message);
  }
}
```

### Null Handling
```typescript
// Use nullish coalescing
const config = userConfig ?? defaultConfig;

// Use optional chaining
const value = response?.data?.value;

// Use type guards
if (isValidResponse(response)) {
  return response.data;
}