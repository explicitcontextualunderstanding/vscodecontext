# Contributing Guidelines

We welcome contributions to this project! Please follow these guidelines when contributing:

## Development Environment Requirements

- Node.js v18+ (using `.nvmrc`)
- npm v9+
- VS Code 1.85+
- TypeScript 5.0+
- Webpack 5.75+
- Git 2.35+

Recommended System:

- Unix-like shell (Bash/Zsh)
- 8GB+ RAM for build process
- VS Code Extension Development Kit

## Build System Architecture

The extension uses a modern toolchain:

1. **Webpack** - Production/development builds
   - Configs: `webpack.config.prod.js` / `webpack.config.dev.js`
2. **TypeScript** - Type checking & transpilation
3. **ESLint** - Code quality enforcement
4. **Prettier** - Automated code formatting

Key npm Scripts:

```bash
npm run build       # Full production build
npm run watch       # Development mode with HMR
npm run package     # Create VSIX package (--no-dependencies)
npm run quality     # Run all linting/formatting checks
```

## Context Configuration

Control context collection through:

1. **VS Code Settings UI**:
   - Search for "VSCode Context" settings
   - Toggle individual context collectors

2. **settings.json**:

```json
"vscode-context.collectors": {
  "workspace": true,
  "debug": false,
  "language": true,
  "sourceControl": true
}
```

1. **Environment Variables** (CI/CD):

```bash
CONTEXT_COLLECT_WORKSPACE=1 CONTEXT_COLLECT_DEBUG=0 npm run build
```

## Contribution Workflow

### Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feat/your-feature`

### Making Changes

- Follow existing code patterns in `src/` directory
- Write atomic commits with conventional messages
- Include unit tests for new features
- Update relevant documentation
- Verify against supported VS Code versions

### Submitting Changes

1. Push to your fork: `git push origin your-branch`
2. Create PR against `main` with:
   - Description of changes
   - Testing methodology
   - Screenshots if applicable
3. Address code review feedback

Thank you for contributing to VSCode Context!
