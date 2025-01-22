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

# Useful Dependency Debugging Tools

| Why?                                                                       | Tool Name                      | Usage with Parameter(s)                                                                                                   |
| :------------------------------------------------------------------------- | :----------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| Install or update packages; also lists direct dependencies                | `npm install`                  | `npm install`, `npm install <package>@<version>`, `npm install -D <package>@<version>` , `npm install --no-legacy-peer-deps`                               |
| Uninstall specific packages                                              | `npm uninstall`                |  `npm uninstall <package>`                                               |
| List installed packages or specific dependencies                               | `npm list`                     |  `npm list`, `npm list <package>`                                                                           |
| Identify why a specific dependency version is being used                  | `npm why`                      | `npm why <package>`                                                                                             |
| Check for outdated packages                                                  | `npm outdated`                 | `npm outdated`                                                                                                    |
| Retrieve info about a package (versions, peer deps)                         | `npm view`                     |  `npm view <package> versions`, `npm view <package> peerDependencies`, `npm view <package> version`                                                               |
| Explain why a specific version was selected                             | `npm explain`                  |  `npm explain <package>`                                                                                                      |
| Clears the npm cache, in case cached responses are causing issues                             | `npm cache clean`                | `npm cache clean --force`                                                                                                       |
| Check for known security vulnerabilities                                     | `npm audit`                    |   `npm audit`                                                                                                 |
| Automatically fix known security vulnerabilities where possible              | `npm audit fix`                | `npm audit fix`                                                                                                    |
| Validates the `package.json`                                               | `validate-package-json`        | `validate-package-json`                                                                                                     |
| Provides a visual representation of dependencies                       | `npmgraph.com`                 | (Website, input `package.json` contents)                                                                             |
| Alternative package manager (can resolve conflicts automatically)                | `pnpm`                         | (`pnpm add`, `pnpm install`)                                                                          |
| Automate dependency updates and create pull requests                                     | `Renovate/Dependabot`             | (Configuration within CI/CD pipelines or GitHub app)                                                                                                     |
| Check for updates and update your `package.json` with the latest versions            | `npm-check-updates`             | `npm install -g npm-check-updates`, `ncu -u`, `npm install`                                                                                            |
| Used to parse JSON in the command line                 | `jq`                          | `jq '.devDependencies | to_entries | map(.key + "@" + .value) | .[]' package.json`                                                                                                      |
| Used to filter outputs in the command line                 | `grep`                          | `grep <string>`, `grep -E <regex>`                                                                                                      |
| Show the full commit history, including diffs to specific files     | `git log` | `git log -p <file>`, `git log --oneline --graph <file>`                                                                                           |
| Show who made the last changes to specific lines of a file | `git blame` | `git blame <file>`                                                                                           |
| Shows the contents of a file at a specific commit                         | `git show`                     | `git show <commit>:<file>`                                                                                            |
| List all the commit hashes which have changed a specific file                         | `git rev-list`                     | `git rev-list --all <file>`                                                                                     |
| Prints the resolved eslint configuration                                 | `npx eslint --print-config`    | `npx eslint --print-config eslint.config.mjs`                                                                              |
| Executes ESLint and attempts to fix linting errors                         | `npx eslint --fix`             |  `npx eslint . --fix`                                                                                    |
| Executes ESLint and shows the linting output without fixing the code                             | `npx eslint`                  | `npx eslint .`                                                                                                      |
| Remove the `package-lock.json` file                                     | `rm`                     | `rm package-lock.json`                                                                                                        |
| Remove the `node_modules` folder                                      | `rm`                         | `rm -rf node_modules`                                                                                                     |
| List all the files in a directory            | `ls` | `ls -al *.mjs`                                                                                   |
| Display the contents of a specific file                       | `cat`                 |  `cat <file>`                                                                                      |
| Use to make a shell script executable              | `chmod`                         | `chmod +x <script>.sh`                                                                                     |

This table should provide a handy reference for understanding what each tool does and how to use it in future debugging sessions.

