import path from 'path';
import { runTests } from '@vscode/test-electron';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index.mjs');
    const testWorkspace = path.resolve(__dirname, '../../test-fixtures');

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      version: 'stable',
      launchArgs: [testWorkspace, '--disable-extensions']
    });
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

main();
