// scripts/exportProblems.js
const vscode = require('vscode');

async function exportProblems() {
  const problems = vscode.languages.getDiagnostics();
  const formattedProblems = problems.map(([uri, diagnostics]) =>
    diagnostics.map((diagnostic) => ({
      file: uri.fsPath,
      line: diagnostic.range.start.line + 1,
      column: diagnostic.range.start.character + 1,
      severity: diagnostic.severity,
      message: diagnostic.message,
      source: diagnostic.source,
      code: diagnostic.code,
    })),
  );

  console.log(JSON.stringify(formattedProblems, null, 2));
}

exportProblems();
