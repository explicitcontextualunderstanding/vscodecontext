# VSCode Context Extension

This extension provides context information about your VSCode environment.

## Features

The extension provides detailed context information about your VSCode environment including:

### Workspace Context
- Workspace folders and file structure
- Editor configuration (font size, tab size, etc.)
- File and search settings

### Window Context
- Active text editor information
- Visible text editors and their documents
- Terminal information and state
- Window focus and state changes

### Language Context
- Active editor language ID
- Available languages
- Language diagnostics and capabilities
- Syntax highlighting and language features

### Debug Context
- Active debug session information
- Breakpoints and their types
- Debug configurations

### Source Control Context
- Repository information
- Source control state (changes, conflicts, branch)

### Tasks Context
- Available tasks and their configurations
- Task execution information
- Problem matchers and presentation options

### Extension Context
- Extension version and state
- Global and workspace extension state
- Activation events and commands

The extension provides these features through:
- Command palette integration
- Dedicated output channel for context data
- Event subscriptions for real-time updates

## Installation
1. Download the latest .vsix file
2. Run:
   ```bash
   code --install-extension vscode-context-{version}.vsix
   ```

## Updating the Extension
After making changes and rebuilding the extension, follow these steps to update:

1. Build the new version:
   ```bash
   vsce package
   ```

2. Uninstall the old version:
   ```bash
   code --uninstall-extension vscode-context-{old-version}.vsix
   ```

3. Install the new version:
   ```bash
   code --install-extension vscode-context-{new-version}.vsix
   ```

Replace {old-version} and {new-version} with the appropriate version numbers.

## Usage
Open the Command Palette (Ctrl+Shift+P) and search for "Extract VSCode Context" to run the extension.