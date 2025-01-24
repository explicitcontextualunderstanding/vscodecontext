const path = require('path');
const { runTests } = require('@vscode/test-electron');

/**
 * Integration test runner for VSCode extension
 */
async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test script
    const extensionTestsPath = path.resolve(__dirname, '../suite/index');

    // Path to test workspace
    const testWorkspace = path.resolve(__dirname, '../test-workspace');

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [testWorkspace],
      version: 'stable',
    });
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
