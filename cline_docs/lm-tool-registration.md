# Language Model Tool Registration Architecture

## Overview

The Language Model Tool registration process involves two key components:

1. Static registration via package.json
2. Runtime registration via the VS Code API

## 1. Static Registration (package.json)

The tool must first be declared in package.json under the `contributes.languageModelTools` section:

```json
{
  "contributes": {
    "languageModelTools": [
      {
        "name": "vscode-context_terminalInfo",
        "tags": ["terminal", "context"],
        "toolReferenceName": "terminalInfo",
        "displayName": "Terminal Information",
        "modelDescription": "Get information about VS Code terminals including active terminal and terminal history",
        "icon": "$(terminal)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "scope": {
              "type": "string",
              "enum": ["active", "all"],
              "description": "Whether to get info for just the active terminal or all terminals",
              "default": "active"
            }
          }
        }
      }
    ]
  }
}
```

This static registration:

- Makes VS Code aware of the tool's existence
- Defines the tool's interface and capabilities
- Allows VS Code to validate tool usage

## 2. Runtime Registration (extension.ts)

The tool must be registered with the Language Model API during extension activation:

```typescript
// In extension.ts activate() function
export async function activate(context: vscode.ExtensionContext) {
  // Create tool instance
  const terminalTool = new TerminalTool(terminalProvider);

  // Register with Language Model API
  const toolRegistration = vscode.lm.registerTool(
    'vscode-context_terminalInfo', // Must match package.json name
    terminalTool,
  );

  // Add to extension subscriptions for proper cleanup
  context.subscriptions.push(toolRegistration);
}
```

This runtime registration:

- Makes the tool implementation available to the Language Model
- Connects the static definition with the actual implementation
- Handles tool lifecycle management

## Registration Flow

```
1. VS Code loads extension
2. Reads package.json -> discovers tool definition
3. Calls extension's activate()
4. Extension registers tool implementation
5. VS Code connects definition with implementation
6. Tool becomes available to Language Model
```

## Validation & Error Handling

The registration process includes several validation steps:

1. Package.json Validation:

   - Tool name must be unique
   - Schema must be valid JSON Schema
   - Required fields must be present

2. Runtime Validation:
   - Tool implementation must match declared interface
   - Tool name must match package.json
   - Tool must implement required methods

## Tool Availability

Once registered:

1. The Language Model can discover the tool via `vscode.lm.tools`
2. The tool appears in VS Code's command palette
3. Users can reference the tool via its toolReferenceName (e.g., #terminalInfo)
4. Other extensions can discover and use the tool

## Best Practices

1. Use unique, namespaced tool names
2. Provide clear model descriptions
3. Include relevant tags for discoverability
4. Document input schema thoroughly
5. Handle registration errors gracefully

## Cleanup & Deactivation

Tool registration is automatically cleaned up when:

1. The extension is deactivated
2. The toolRegistration.dispose() is called
3. The extension is unloaded

This ensures proper resource management and prevents tool conflicts.
