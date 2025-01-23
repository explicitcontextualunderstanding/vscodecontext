# VSCode Context Extension

[![Version](https://img.shields.io/badge/version-0.0.7-blue.svg)](https://marketplace.visualstudio.com/items?itemName=your-name.vscode-context)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/your-name.vscode-context)](https://marketplace.visualstudio.com/items?itemName=your-name.vscode-context)

Gain deep insights into your VSCode environment with comprehensive context information.
This project currently provides a VSCode extension as the client to extract your context as a
JSON output. In the near future, it will soon be able to write the context to your MCP memory
server as entities, relations, and observations. Next, it will be the client to a standalone
VSCode Context MCP Server.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [How to Generate Context](#how-to-generate-context)
- [Development](#development)
- [Contributing](#contributing)

## Features

The VSCode Context extension provides detailed insights into your development
environment. The following data is captured:

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

## Quick Start

1. Install the VSIX extension the source directory where you installed this project and ran npm run build.
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Run the command: `VSCode Context: Extract Context`
4. View the output in the "VSCode Context" output channel

## Configuration

The extension can be configured through VSCode settings. Use the VS Code settings UI and filter to `"vscode-context"`:

You can configure which context categories are included in the extracted context:

- **Workspace:** Includes information about your workspace folders,
  file system, and recently opened files
- **Window:** Includes information about the active window,
  editors, terminals, selections, and window state
- **Language:** Includes information about the current language,
  diagnostics, available languages, and language features
- **Debug:** Includes information about the active debug session,
  breakpoints, and debug configurations
- **Source Control:** Includes information about your git repositories,
  branches, and commit templates
- **Tasks:** Includes information about your configured tasks,
  execution settings, and problem matchers
- **Extension:** Includes information about the extension itself
  (version, state, settings)
- **Extension Host:** Includes information about the VS Code Extension host
  (platform, process)
- **Settings:** Includes the current VS Code settings
- **Keybindings:** Includes the current VS Code Keybindings
- **Theme:** Includes the current VS Code theme
- **Views:** Includes information about the current VS Code views
- **Custom Editors:** Includes information about any custom editors you have open

## How to Generate Context

To capture a more complete context, actively use VS Code features
before running the context extraction command. Here's how:

**General Setup:**

1. **Open VS Code:**
   Start your Visual Studio Code instance
2. **Open a Workspace/Folder:**
   Open a folder or workspace (`File > Open Folder...`
   or `File > Open Workspace from File...`)
3. **Open Files:**
   Open one or more files (double-click or `File > Open File...`).
   Use different languages to test language-specific context
4. **Interact with Files:**
   - Make a text selection
   - Ensure one file has focus

**Populating Specific Context Areas:**

- **Workspace:** Open a workspace that contains multiple folders to test `workspaceFolders`
- **Window:**
  - Open a file, and make sure it has focus
  - Make a selection
  - Open an integrated terminal (`Ctrl+` `or`Cmd+``)
- **Debug:**
  - Open a file
  - Set a breakpoint
  - Go to the Run and Debug view (`Ctrl+Shift+D` or `Cmd+Shift+D`)
  - Click "Run and Debug" (the session does not need to complete)
- **Source Control:**
  - Open a folder or workspace initialized as a Git repository
  - Optionally make changes to a file (do not commit yet)

**Executing the Context Extraction:**

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run the `VSCode Context: Extract Context` command
3. View the output in the "VSCode Context" output channel

**Important Notes:**

- Execute the extraction command _after_ performing the above steps.
  The context reflects the state at the exact moment the command is run
- Repeat these steps in different scenarios to get a full view of the
  data accessible to the extension

## Development

The extension uses a modern development workflow with:

- **TypeScript** for type-safe development
- **Webpack** for optimized production builds
- **ESLint** for code quality
- **Prettier** for code formatting
- **TypeDoc** for documentation generation
- **MarkdownLint** for documentation quality

### Build Configuration Files

The project uses JSON configuration files to customize the build process:

#### Available Configuration Files

- `webpack.config.js`: Webpack build configuration
- `.eslintrc.cjs`: ESLint configuration
- `.prettierrc.json`: Prettier formatting rules
- `.markdownlint.json`: Markdown linting rules
- `typedoc.json`: TypeDoc documentation settings

#### Customizing Build Configuration

To modify build settings:

1. Edit the appropriate configuration file
2. Add custom settings following the JSON format
3. Common customizations include:
   - Adding new Webpack loaders
   - Extending ESLint rules
   - Customizing Prettier formatting
   - Adding TypeDoc plugins

#### Example: Adding a New Webpack Loader

1. Open `webpack.config.js`
2. Add the loader configuration:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.custom$/,
        use: ['custom-loader'],
      },
    ],
  },
};
```

1. Install the required loader:

```bash
npm install custom-loader --save-dev
```

### Linting and Formatting Setup

The project uses a comprehensive quality assurance setup:

#### ESLint Configuration

- Configuration file: `.eslintrc.cjs` (only ESLint configuration file)
- Linting scope: Focused on `src/` directory, excluding test files
- Ignored patterns: `node_modules/`, `dist/`, `out/`, `coverage/`, `*.min.js`, `*.d.ts`
- Extends: `eslint:recommended`, `@typescript-eslint/recommended`, `prettier/recommended`
- Overrides: Specific rules for source files in `src/` directory

#### Prettier Integration

- Configuration file: `.prettierrc.json`
- Integrated with ESLint through `eslint-config-prettier`
- Automatic formatting on save

#### MarkdownLint

- Configuration file: `.markdownlint.json`
- Lints all documentation files except `node_modules/`, `dist/`, `out/`, `coverage/`
- Enforces consistent markdown formatting

#### Pre-commit Hooks

The project uses [husky](https://typicode.github.io/husky/)
to run quality checks before each commit. The following
command is run before each commit:

```bash
npm run format && npm run lint && npm run lint:markdown
```

#### TypeDoc Documentation

- Configuration file: `typedoc.json`
- Generates API documentation
- Enforces documentation standards

### Documentation Standards

All code should be documented using TypeDoc comments following these guidelines:

- Use `/** */` for documentation blocks
- Include descriptions for all public APIs
- Use `@param` for function parameters
- Use `@returns` for return values
- Use `@example` for code examples

## Building the Extension

### Production Build

1. Install dependencies and build:

```bash
npm install && npm run build
```

1. Package with source maps:

```bash
vsce package --yarn --testFlag=false
```

### Development Build

```bash
npm run package:dev
```

### Build Configuration

The extension uses CommonJS modules for VSCode compatibility. Key configuration details:

- Webpack configuration uses CommonJS `require()` syntax
- Output file is `extension.cjs`
- ESLint is configured to allow CommonJS syntax in `webpack.config.js`
- `package.json`'s `main` field points to `extension.cjs`

#### Requirements

- `package.json` must include:
  - `main` pointing to the entry file
  - `activationEvents` defining when the extension activates
  - `contributes` defining commands, menus, etc.
  - `engines.vscode` specifying the compatible VSCode version
- Entry file must:
  - Be a CommonJS module (`extension.cjs`)
  - Export an `activate` function
  - Export a `deactivate` function (optional)
- Must be packaged using `vsce` (Visual Studio Code Extensions)
- Output files must be included in `.vscodeignore`

### Development Commands

| Command                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `npm run build`         | Run quality checks and build production bundle     |
| `npm run watch`         | Watch and rebuild on changes                       |
| `npm run quality`       | Run all quality checks (linting, formatting, docs) |
| `npm run lint`          | Run ESLint checks                                  |
| `npm run format`        | Format code with Prettier                          |
| `npm run lint:markdown` | Lint markdown files                                |
| `npm run docs`          | Generate API documentation                         |
| `npm run package`       | Build production bundle and package extension      |
| `npm run package:dev`   | Package development version (skips dependencies)   |

### Module System Configuration

The extension uses CommonJS modules for VSCode compatibility. Key configuration details:

- Webpack configuration uses CommonJS `require()` syntax
- Output file is `extension.cjs`
- ESLint is configured to allow CommonJS syntax in `webpack.config.js`
- `package.json`'s `main` field points to `extension.cjs`

### Optimized Build Process

The extension uses Webpack to:

- Bundle all dependencies into a single optimized file
- Tree-shake unused code
- Minify production builds
- Generate source maps for debugging

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

---

> **Note:** For detailed documentation and troubleshooting, visit our [documentation site](https://github.com/explicitcontextualunderstanding/vscodecontext)
