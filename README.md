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

1. Open Command Palette (Ctrl+Shift+P) and run:

```bash
VSCode Context: Extract Context
```

1. View the output in the "VSCode Context" channel

## Configuration

The extension can be configured through VSCode settings:

| Setting | Description | Default |
|---------|-------------|---------|
| `vscodeContext.showOnStartup` | Show context on VSCode startup | `false` |
| `vscodeContext.refreshInterval` | Context refresh interval in seconds | `60` |

## Development

### Linting and Formatting Setup

The project uses a comprehensive quality assurance setup:

#### ESLint Configuration

- Configuration file: `.eslintrc.cjs` (only ESLint configuration file)
- Linting scope:
  - Focused on `src/` directory
  - Excludes test files (`*.test.ts`, `*.spec.ts`, `__tests__/`)
- Ignored patterns:
  - `node_modules/`
  - `dist/`
  - `out/`
  - `coverage/`
  - `*.min.js`
  - `*.d.ts`
- Extends:
  - eslint:recommended
  - @typescript-eslint/recommended
  - prettier/recommended
- Overrides:
  - Specific rules for source files in `src/` directory

#### Prettier Integration

- Configuration file: `.prettierrc.json`
- Integrated with ESLint through `eslint-config-prettier`
- Automatic formatting on save

#### MarkdownLint

- Configuration file: `.markdownlint.json`
- Lints all documentation files except:
  - `node_modules/`
  - `dist/`
  - `out/`
  - `coverage/`
- Enforces consistent markdown formatting

#### Pre-commit Hooks

The project uses [husky](https://typicode.github.io/husky/) to run quality checks before each commit:

- **Prettier**: Code formatting
- **ESLint**: JavaScript/TypeScript linting
- **MarkdownLint**: Documentation linting

These checks are automatically run when you commit changes using the following command:

```bash
npm run format && npm run lint && npm run lint:markdown
```

#### TypeDoc Documentation

- Configuration file: `typedoc.json`
- Generates API documentation
- Enforces documentation standards

### Development Workflow

The extension uses a modern development workflow with:

- **TypeScript** for type-safe development
- **Webpack** for optimized production builds
- **ESLint** for code quality
- **Prettier** for code formatting
- **TypeDoc** for documentation generation
- **MarkdownLint** for documentation quality
=======

### Documentation Standards

All code should be documented using TypeDoc comments following these guidelines:

- Use `/** */` for documentation blocks
- Include descriptions for all public APIs
- Use `@param` for function parameters
- Use `@returns` for return values
- Use `@example` for code examples

### Building the Extension

#### Requirements

- package.json must include:
  - `main` pointing to the entry file
  - `activationEvents` defining when the extension activates
  - `contributes` defining commands, menus, etc.
  - `engines.vscode` specifying compatible VSCode version
- Entry file must:
  - Be a CommonJS module (extension.cjs.js)
  - Export an `activate` function
  - Export a `deactivate` function (optional)
- Must be packaged using vsce (Visual Studio Code Extensions)
- Output files must be included in .vscodeignore

#### Build Configuration

The extension uses CommonJS modules for VSCode compatibility. When making changes to the build configuration:

- Use CommonJS require() syntax in webpack.config.js
- Ensure output file is extension.cjs
- Maintain ESLint configuration for CommonJS compatibility

1. Clone the repository:

```bash
git clone https://github.com/your-name/vscode-context.git
cd vscode-context
```

1. Install dependencies:

```bash
npm install
```

=======

1. Run the development build:

```bash
npm run build
```

1. Package extension:

```bash
npx vsce package
```

### Development Commands

Development commands:

| Command | Description |
|---------|-------------|
| `npm run build` | Run quality checks and build production bundle |
| `npm run watch` | Watch and rebuild on changes |
| `npm run quality` | Run all quality checks (linting, formatting, docs) |
| `npm run lint` | Run ESLint checks |
| `npm run format` | Format code with Prettier |
| `npm run lint:markdown` | Lint markdown files |
| `npm run docs` | Generate API documentation |

### Module System Configuration

The extension uses CommonJS modules for VSCode compatibility. Key configuration details:

- Webpack configuration uses CommonJS require() syntax
- Output file is extension.cjs
- ESLint configured to allow CommonJS syntax in webpack.config.js
- Package.json main field points to extension.cjs

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

1. Download the latest `.vsix` file
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

1. Uninstall the old version:

```bash
code --uninstall-extension vscode-context-{old-version}.vsix
```

1. Install the new version:

```bash
code --install-extension vscode-context-{new-version}.vsix
```

Replace `{old-version}` and `{new-version}` with the appropriate version numbers.

## Usage

Open the Command Palette (Ctrl+Shift+P) and search for "Extract VSCode Context" to run the extension.
