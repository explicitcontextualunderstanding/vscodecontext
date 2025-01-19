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

## Generate Context with Extension

To capture a more complete context, you need to actively use VS Code features before
running the context extraction command. Here's a set of instructions to help generate
a more comprehensive context:

**General Setup:**

1. **Open VS Code:** Start your Visual Studio Code instance.

2. **Open a Workspace/Folder:**
   - To capture workspace-related context, ensure you have a folder or workspace opened.
   - **File > Open Folder...** or **File > Open Workspace from File...**

3. **Open Files:**
   To populate editor-related context:
   - Open one or more files in the editor
   - Use files with different languages to test
     language-specific context
   - Double-click files in the Explorer panel, or use **File > Open File...**

4. **Interact with Files:**
   - **Make a Selection:**
     Select some text in one of the open editors.
   - **Ensure an Active Editor:**
     Make sure one of the opened files has focus (is the currently active tab).

**Populating Specific Context Areas:**

- **To Capture Workspace Context:**
  - Have Multiple Folders (Optional):
    If you want to test the `workspaceFolders` array with more than one entry,
    open a workspace that contains multiple folders.

- **To Capture Window Context:**
  - Active Text Editor: Ensure you have an active editor (a file is open and focused).
  - Text Editor's Document & Selection:
    With an active editor, having a selection will populate
    the `TextEditor.document` and `TextEditor.selection` information.
  - Active Terminal: Open an integrated terminal.
    - Terminal > New Terminal (or use the shortcut `Ctrl+` or `Cmd+`)
  - Selections in Active Editor: Select some text in the active editor.
  - Active Editor's Language ID: Open a file of a specific language (e.g., a `.js` file for JavaScript).

- **To Capture Debug Context:**
  - Start a Debug Session: Initiate a debugging session.
    - Open a file you want to debug.
    - Set a breakpoint (click in the gutter next to a line number).
    - Go to the Run and Debug view (Ctrl+Shift+D or Cmd+Shift+D).
    - Click "Run and Debug" and choose a debugger.
      Let the session start (you don't need to let it run to completion).

- **To Capture Source Control Context:**
  - Open a Git Repository (or other SCM):
    Open a folder or workspace that is initialized as a Git repository
    (or another supported source control system).
  - Have Changes (Optional):
    Make some changes to a file in the repository (don't commit them yet).
    This will help populate information about uncommitted changes.

**Executing the Context Extraction:**

1. **Open the Command Palette:** Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS).

2. **Execute the Command:** Type or search for `VSCode Context: Extract Context` and press Enter.

3. **View the Output:** The extracted context will be displayed in the "VSCode Context" output channel.

**Important Considerations:**

- **Timing:** Execute the `vscode-context.extractContext` command *after* performing the steps above.
  The context captured reflects the state of VS Code at the exact moment the command is run.

- **Specific Scenarios:** If you're trying to capture context related to a very specific VS Code feature
  (e.g., a specific type of debug session, a particular source control action), make sure you are
  actively engaging with that feature before running the command.

- **Repeat for Different States:** To get a comprehensive view of the context your extension *can* access,
  repeat these steps under different VS Code usage scenarios (e.g., with multiple files open,
  with a debug session running, with a terminal active).
By following these instructions, you should be able to generate a `vscodecontext.json` file
that contains information for the previously "missing" context elements, provided those
elements are active in your VS Code instance at the time of capture.

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

### Linting Prompt for Code Generation

- ESLint:
  - Enforce TypeScript best practices
  - Follow code style rules
  - Prevent common errors
  - Maintain consistent code patterns

- Prettier:
  - Apply consistent formatting
  - Maintain proper indentation
  - Enforce code style rules
  - Ensure consistent spacing and line breaks

- TypeScript:
  - Enforce type safety
  - Validate interfaces and types
  - Ensure proper type usage
  - Catch type-related errors at compile time

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

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run build`   | Run quality checks and build production bundle   |
| `npm run watch`   | Watch and rebuild on changes                     |
| `npm run quality` | Run all quality checks (linting, formatting, docs) |
| `npm run lint`    | Run ESLint checks                                |
| `npm run format`  | Format code with Prettier                        |
| `npm run lint:markdown` | Lint markdown files                          |
| `npm run docs`    | Generate API documentation                       |

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
