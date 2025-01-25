// scripts/checklist-status.js
import { getChecklistProgress } from '../lib/checklist-parser.mjs';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Function to convert full path to tilde path
function toTildePath(fullPath) {
  const home = homedir();
  return fullPath.startsWith(home) ? fullPath.replace(home, '~') : fullPath;
}

function getDocsPathValue(arg) {
  if (!arg || typeof arg !== 'string' || arg.indexOf('=') === -1) {
    return null; // Or throw an error, depending on requirements.
  }

  const parts = arg.split('=');
  if (parts.length < 2) {
    return null;
  }

  let docsPathValue = parts[1];
  if (docsPathValue) {
    docsPathValue = docsPathValue.trim().replace(/^(['"]|["'])$/g, '');
  }

  return docsPathValue;
}

/**
 * Repository Configuration
 *
 * 1. VSCode Context Repository
 *    - Local Path: /~/workspace/repositoryname
 *    - Remote: git@github:organization/projectname.git
 *    - Description: Main implementation repository containing the VSCode extension
 *
 * 2. Documentation Repository
 *    - Local Path: /~/workspace/docs
 *    - Remote: git@github.com:organization/docs.git
 *    - Description: Contains implementation status and architecture documentation
 */

// Repository paths
const VSCODE_CONTEXT_PATH = join(process.cwd());
// Handle docs path argument with validation
let DOCS_PATH = join(process.cwd(), 'docs'); // Default to project's docs directory
// Handle both --docs-path <value> and --docs-path=<value> formats
let docsPathValue;
for (const arg of process.argv) {
  if (arg.startsWith('--docs-path=')) {
    docsPathValue = getDocsPathValue(arg);
    break;
  } else if (arg === '--docs-path') {
    docsPathValue = process.argv[process.argv.indexOf(arg) + 1];
    break;
  }
}

if (docsPathValue) {
  // Handle home directory expansion and resolve absolute path
  const expandedPath = docsPathValue.startsWith('~')
    ? docsPathValue.replace('~', homedir())
    : join(docsPathValue);
  DOCS_PATH = expandedPath;

  if (!existsSync(DOCS_PATH)) {
    throw new Error(`Docs path does not exist: ${DOCS_PATH}`);
  }
}

// Document paths handling
// Matches Implementation_Status.md doc in the root of docs repository not code repostiory
let IMPLEMENTATION_STATUS_DOC = 'Implementation-Status.md';
// Matches Architecture.md doc in the root of docs repository not code repostiory
let ARCHITECTURE_DOC = join(DOCS_PATH, 'Architecture.md');

// Handle document name arguments
const statusDocIndex = process.argv.indexOf('--status-doc');
if (statusDocIndex > -1) {
  IMPLEMENTATION_STATUS_DOC = process.argv[statusDocIndex + 1];
}

const archDocIndex = process.argv.indexOf('--arch-doc');
if (archDocIndex > -1) {
  ARCHITECTURE_DOC = process.argv[archDocIndex + 1];
}

// Full document paths
const IMPLEMENTATION_STATUS_PATH = join(DOCS_PATH, IMPLEMENTATION_STATUS_DOC);
const ARCHITECTURE_DOC_PATH = ARCHITECTURE_DOC;

// Parse command line arguments
const showOnlyIncomplete = process.argv.includes('--incomplete');

/**
 * Validates that repositories and required documents are accessible
 * @throws {Error} If repositories or documents are not accessible
 */
async function validateRepositories() {
  // Check VSCode Context repository
  if (!existsSync(VSCODE_CONTEXT_PATH)) {
    throw new Error(
      `VSCode Context repository not found at: ${toTildePath(VSCODE_CONTEXT_PATH)}`,
    );
  }
  if (!existsSync(join(VSCODE_CONTEXT_PATH, '.git'))) {
    throw new Error(
      `${toTildePath(VSCODE_CONTEXT_PATH)} is not a git repository`,
    );
  }

  // Check Documentation directory
  if (!existsSync(DOCS_PATH)) {
    throw new Error(
      `Documentation directory not found at: ${toTildePath(DOCS_PATH)}`,
    );
  }

  // Check required documentation files
  if (!existsSync(IMPLEMENTATION_STATUS_PATH)) {
    throw new Error(
      `Implementation status document not found at: ${IMPLEMENTATION_STATUS_PATH}`,
    );
  }

  // Print validation success information
  console.log('Repository and Document Validation Successful:');
  console.log('✅ VSCode Context:');
  console.log(`   Path: ${toTildePath(VSCODE_CONTEXT_PATH)}`);
  const { exec } = await import('child_process');
  const vscodeContextRemoteUrl = await new Promise((resolve) => {
    exec(
      `cd ${VSCODE_CONTEXT_PATH} && git remote get-url origin`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          resolve('Could not determine remote URL');
          return;
        }
        resolve(stdout.trim());
      },
    );
  });

  // Single URL display for VSCode Context
  console.log('\n✅ Code Repository:');
  console.log(`   Remote URL: ${vscodeContextRemoteUrl}`);

  console.log('\n✅ Documentation:');
  console.log(`   Docs_path: ${toTildePath(DOCS_PATH)}`);
  console.log('   Documents:');
  console.log(
    `     - Found implementation status: ${IMPLEMENTATION_STATUS_PATH}`,
  );
  // Architecture document is optional
  if (existsSync(ARCHITECTURE_DOC_PATH)) {
    console.log(`     - Found architecture document: ${ARCHITECTURE_DOC}`);
  }
  console.log(''); // Empty line for spacing
}

/**
 * Processes and displays the implementation status
 * @param {Object} progress The checklist progress data
 * @param {boolean} showOnlyIncomplete Whether to show only incomplete items
 */
function displayImplementationStatus(progress, showOnlyIncomplete) {
  const branch = 'current-branch'; // placeholder

  console.log(`
    VSCode Context Client Implementation Status (Branch: ${branch})
    ${showOnlyIncomplete ? '(Showing only incomplete items)' : ''}
    =========================================================
  `);

  progress.sections.forEach((section) => {
    // Filter incomplete items for each subsection
    const incompleteSubsections = section.subsections
      .map((subsection) => ({
        title: subsection.title,
        items: subsection.items.filter((item) =>
          showOnlyIncomplete ? item.status !== 'completed' : true,
        ),
      }))
      .filter((subsection) => subsection.items.length > 0);

    // Skip section if no incomplete items and we're only showing incomplete
    if (showOnlyIncomplete && incompleteSubsections.length === 0) {
      return;
    }

    console.log(`  ${section.title}`);
    console.log(`  ----------------------------`);

    incompleteSubsections.forEach((subsection) => {
      console.log(`    ${subsection.title}:`);
      subsection.items.forEach((item) => {
        let statusIcon = '';
        if (item.status === 'completed') {
          statusIcon = '✅';
        } else if (item.status === 'not implemented') {
          statusIcon = '❌';
        } else if (item.status === 'partially implemented') {
          statusIcon = '⚠️';
        }
        console.log(`      ${statusIcon} ${item.description} (${item.status})`);
      });
    });
    console.log('');
  });
}

async function main() {
  try {
    // Validate repository access before proceeding
    validateRepositories();

    const progress = await getChecklistProgress(IMPLEMENTATION_STATUS_PATH);

    if (progress && progress.error) {
      throw new Error(`Failed to get checklist progress: ${progress.error}`);
    }

    displayImplementationStatus(progress, showOnlyIncomplete);
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error(
    'Unhandled error:',
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
});
