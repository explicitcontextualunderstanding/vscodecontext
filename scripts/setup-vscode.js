// @ts-check
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VSCODE_EXTENSIONS = [
  'dbaeumer.vscode-eslint',
  'esbenp.prettier-vscode',
  'ms-vscode.vscode-typescript-next',
  'usernamehw.errorlens',
  'sonarsource.sonarlint-vscode',
];

const VSCODE_SETTINGS = {
  'editor.formatOnSave': true,
  'editor.codeActionsOnSave': {
    'source.fixAll.eslint': true,
  },
  'editor.defaultFormatter': 'esbenp.prettier-vscode',
  '[typescript]': {
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
  },
  'typescript.tsdk': 'node_modules/typescript/lib',
  'typescript.enablePromptUseWorkspaceTsdk': true,
  'typescript.preferences.importModuleSpecifier': 'non-relative',
  'typescript.preferences.quoteStyle': 'single',
  'typescript.updateImportsOnFileMove.enabled': 'always',
};

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function installExtensions() {
  console.log('Installing VS Code extensions...');
  VSCODE_EXTENSIONS.forEach((extension) => {
    try {
      execSync(`code --install-extension ${extension} --force`);
      console.log(`✓ Installed ${extension}`);
    } catch (error) {
      console.error(`✗ Failed to install ${extension}:`, error.message);
    }
  });
}

function setupVSCodeSettings() {
  console.log('Setting up VS Code workspace settings...');
  const vscodePath = path.join(process.cwd(), '.vscode');
  const settingsPath = path.join(vscodePath, 'settings.json');

  ensureDirectoryExists(vscodePath);

  try {
    fs.writeFileSync(
      settingsPath,
      JSON.stringify(VSCODE_SETTINGS, null, 2),
      'utf8',
    );
    console.log('✓ Created .vscode/settings.json');
  } catch (error) {
    console.error('✗ Failed to create settings:', error.message);
  }
}

function setupTasks() {
  console.log('Setting up VS Code tasks...');
  const tasksPath = path.join(process.cwd(), '.vscode', 'tasks.json');

  const tasks = {
    version: '2.0.0',
    tasks: [
      {
        type: 'npm',
        script: 'validate',
        group: {
          kind: 'build',
          isDefault: true,
        },
        problemMatcher: ['$tsc', '$eslint-stylish'],
      },
      {
        type: 'npm',
        script: 'watch',
        group: 'build',
        isBackground: true,
        problemMatcher: ['$tsc-watch'],
      },
    ],
  };

  try {
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2), 'utf8');
    console.log('✓ Created .vscode/tasks.json');
  } catch (error) {
    console.error('✗ Failed to create tasks:', error.message);
  }
}

// Main setup
console.log('Starting VS Code setup...\n');

installExtensions();
setupVSCodeSettings();
setupTasks();

console.log('\nVS Code setup complete! 🎉');
console.log('\nPlease restart VS Code for all changes to take effect.');
