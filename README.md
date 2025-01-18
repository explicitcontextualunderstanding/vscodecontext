# VSCode Context Extension

[![Version](https://img.shields.io/badge/version-0.0.6-blue.svg)](https://marketplace.visualstudio.com/items?itemName=your-name.vscode-context)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/your-name.vscode-context)](https://marketplace.visualstudio.com/items?itemName=your-name.vscode-context)

> Gain deep insights into your VSCode environment with comprehensive context information

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Development](#development)
- [Contributing](#contributing)

## Features

The VSCode Context extension provides detailed insights into your development environment:

### Workspace Context
- [x] Workspace folders and file structure
- [x] Editor configuration (font size, tab size, etc.)
- [x] File and search settings

### Window Context
- [x] Active text editor information
- [x] Visible text editors and their documents
- [x] Terminal information and state
- [x] Window focus and state changes

### Language Context
- [x] Active editor language ID
- [x] Available languages
- [x] Language diagnostics and capabilities

## Quick Start

1. Install from Marketplace:
```bash
code --install-extension your-name.vscode-context
```

2. Open Command Palette (Ctrl+Shift+P) and run:
```bash
VSCode Context: Extract Context
```

3. View the output in the "VSCode Context" channel

## Configuration

The extension can be configured through VSCode settings:

| Setting | Description | Default |
|---------|-------------|---------|
| `vscodeContext.showOnStartup` | Show context on VSCode startup | `false` |
| `vscodeContext.refreshInterval` | Context refresh interval in seconds | `60` |

## Development

### Virtual Environment Setup

The development environment requires a Python virtual environment (.venv) located in your workspace directory. The system will prompt you for the location of your .venv directory when needed.

To activate the virtual environment:
```bash
source /path/to/workspace/.venv/bin/activate
```

### Development Workflow

The extension uses a modern development workflow with:

- **TypeScript** for type-safe development
- **Webpack** for optimized production builds
- **ESLint** for code quality
- **Prettier** for code formatting
- **Python Virtual Environment** for dependency isolation

### Building the Extension

1. Clone the repository:
```bash
git clone https://github.com/your-name/vscode-context.git
cd vscode-context
```

2. Install dependencies:
```bash
npm install
```

3. Activate virtual environment:
```bash
source /path/to/workspace/.venv/bin/activate
```

4. Run the development build:
```bash
npm run build
```

5. Package extension:
```bash
npx vsce package
```

### Development Commands

All development commands should be run within the activated virtual environment:

| Command | Description |
|---------|-------------|
| `npm run build` | Build production bundle using webpack |
| `npm run watch` | Watch and rebuild on changes |
| `npm run lint` | Run ESLint checks |
| `npm run format` | Format code with Prettier |
| `npm run lint:markdown` | Lint markdown files |

### Optimized Build Process

The extension uses webpack to:
- Bundle all dependencies into a single optimized file
- Tree-shake unused code
- Minify production builds
- Generate source maps for debugging

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

---

> **Note:** For detailed documentation and troubleshooting, visit our [documentation site](https://your-name.github.io/vscode-context)
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