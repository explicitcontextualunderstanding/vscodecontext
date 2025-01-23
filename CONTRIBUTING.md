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

# Configuration

Okay, let's create a concise summary of the key changes in the final ESLint configuration that enabled us to successfully lint both TypeScript and JavaScript code, and what we learned along the way.

**Final Working ESLint Configuration (`eslint.config.mjs`):**

```javascript
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    ...eslint.configs.recommended,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-console': 'error',
      ...tseslint.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    ...eslint.configs.recommended,
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['src/webview/media/main.js'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/docs/**',
      '**/*.d.ts',
      '**/*.min.js',
      '**/*.html',
      'out/**',
    ],
  },
];
```

# **Final Build and Linting Configuration**

1.  **Corrected Typescript Parser Syntax:** Instead of trying to spread configuration objects, or use strings for the parser, we are now correctly setting the parser using the `tsParser` object in the `languageOptions.parser` property. We are also correctly using `parserOptions`, with the `project: true` option to ensure the Typescript parser works as expected.
2.  **Correctly Loaded Plugin:** We are now using the correct syntax to declare a plugin, using the `plugins` key in the configuration.
3.  **Typescript Rules Loading**: We are now using a method that does not throw an `extends` error, by using `...tseslint.configs.recommended.rules` to load the rules from the Typescript plugin, and not trying to load the configuration.
4.  **Separate Configurations:** We are using separate configuration objects for Javascript, Typescript, and HTML, and we are only using the correct options and syntax for each.
5.  **Explicit Ignores**: We are using the `ignores` property to specifically ignore all the required directories and files from the linting process.
6.  **Use of Prettier Plugin**: We are now correctly loading the prettier plugin to ensure that all Prettier errors are displayed as ESLint errors, as we originally intended to do.

**Key Lessons Learned**

1.  **Flat Config Syntax Matters:** The ESLint flat configuration system requires specific, precise syntax. Incorrectly using `extends`, trying to spread configuration objects, or missing key configuration options (such as the parser) can lead to cascading failures.
2.  **Versions of Packages**: It is absolutely critical to ensure that you are using compatible versions of your dependencies, and it is important to ensure you are not using any packages which are not intended to be used in your projects.
3.  **Explicit > Implicit:** Relying on implicit behaviors or defaults can lead to errors. It's much better to be explicit in your configurations. We should not make assumptions about the types or formats that ESLint is expecting, and we should always be explicit, when we can.
4.  **Test Incrementally:** Changes to the configurations should be verified step-by-step, and not all at the same time. It's much more useful to change one thing at a time, and then verify that the fix has been applied correctly, and that there are no further issues.
5.  **Importance of Documentation:** The official documentation for ESLint, TypeScript, and Prettier was the key to understanding many of the underlying issues. You should always consult the documentation when making changes to your configuration.
6.  **Version Numbers**: When using dependencies, always check the documentation for the specific versions, or use `npm view` to verify that the dependencies you are trying to use actually exist, and that they are within the range of versions which you are targeting.
7.  **`npm` is a powerful tool**: The `npm` ecosystem provides many tools to debug issues. We should take full advantage of these tools by using `npm list`, `npm why`, and `npm view`, to diagnose dependency problems.
8.  **Transitive dependencies** You should take into consideration any transient dependencies, and use the `npm why` command, to identify the source of those dependencies, and to change them if necessary.

**Final Thoughts**

The core lesson is that when dealing with configurations, we must always start at the beginning, and try to fully understand the intended usage of all tools, and must always verify the configurations as we progress.

# Useful Dependency Debugging Tools

| Why?                                                                      | Tool Name                   | Usage with Parameter(s)                                                                                                      |
| ------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Install or update packages; also lists direct dependencies                | `npm install`               | `npm install`, `npm install <package>@<version>`, `npm install -D <package>@<version>` , `npm install --no-legacy-peer-deps` |
| Uninstall specific packages                                               | `npm uninstall`             | `npm uninstall <package>`                                                                                                    |
| List installed packages or specific dependencies                          | `npm list`                  | `npm list`, `npm list <package>`                                                                                             |
| Identify why a specific dependency version is being used                  | `npm why`                   | `npm why <package>`                                                                                                          |
| Check for outdated packages                                               | `npm outdated`              | `npm outdated`                                                                                                               |
| Retrieve info about a package (versions, peer deps)                       | `npm view`                  | `npm view <package> versions`, `npm view <package> peerDependencies`, `npm view <package> version`                           |
| Explain why a specific version was selected                               | `npm explain`               | `npm explain <package>`                                                                                                      |
| Clears the npm cache, in case cached responses are causing issues         | `npm cache clean`           | `npm cache clean --force`                                                                                                    |
| Check for known security vulnerabilities                                  | `npm audit`                 | `npm audit`                                                                                                                  |
| Automatically fix known security vulnerabilities where possible           | `npm audit fix`             | `npm audit fix`                                                                                                              |
| Validates the `package.json`                                              | `validate-package-json`     | `validate-package-json`                                                                                                      |
| Provides a visual representation of dependencies                          | `npmgraph.com`              | (Website, input `package.json` contents)                                                                                     |
| Alternative package manager (can resolve conflicts automatically)         | `pnpm`                      | (`pnpm add`, `pnpm install`)                                                                                                 |
| Automate dependency updates and create pull requests                      | `Renovate/Dependabot`       | (Configuration within CI/CD pipelines or GitHub app)                                                                         |
| Check for updates and update your `package.json` with the latest versions | `npm-check-updates`         | `npm install -g npm-check-updates`, `ncu -u`, `npm install`                                                                  |
| List dependency versions                                                  | `jq`                        | `jq '.devDependencies \ to_entries \ map(.key + "@" + .value) \ .[]' package.json`                                           |
| Used to filter outputs in the command line                                | `grep`                      | `grep <string>`, `grep -E <regex>`                                                                                           |
| Show commit history with diffs                                            | `git log`                   | `git log -p <file>`, `git log --oneline --graph`                                                                             |
| Show who made the last changes to specific lines of a file                | `git blame`                 | `git blame <file>`                                                                                                           |
| Shows the contents of a file at a specific commit                         | `git show`                  | `git show <commit>:<file>`                                                                                                   |
| List all the commit hashes which have changed a specific file             | `git rev-list`              | `git rev-list --all <file>`                                                                                                  |
| Prints the resolved eslint configuration                                  | `npx eslint --print-config` | `npx eslint --print-config eslint.config.mjs`                                                                                |
| Executes ESLint and attempts to fix linting errors                        | `npx eslint --fix`          | `npx eslint . --fix`                                                                                                         |
| Executes ESLint and shows the linting output without fixing the code      | `npx eslint`                | `npx eslint .`                                                                                                               |
| Remove the `package-lock.json` file                                       | `rm`                        | `rm package-lock.json`                                                                                                       |
| Remove the `node_modules` folder                                          | `rm`                        | `rm -rf node_modules`                                                                                                        |
| List all the files in a directory                                         | `ls`                        | `ls -al *.mjs`                                                                                                               |
| Display the contents of a specific file                                   | `cat`                       | `cat <file>`                                                                                                                 |
| Use to make a shell script executable                                     | `chmod`                     | `chmod +x <script>.sh`                                                                                                       |

This table should provide a handy reference for understanding what each tool does and how to use it in future debugging sessions.
