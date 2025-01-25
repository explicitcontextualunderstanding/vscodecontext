import { fileURLToPath } from 'url';
import path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: 60000,
  });

  const files = await glob('**/**.test.js', {
    cwd: __dirname,
    ignore: ['**/node_modules/**'],
  });

  files.found.forEach((f) => mocha.addFile(path.resolve(__dirname, f)));

  try {
    await new Promise<void>((resolve, reject) => {
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

void run();
