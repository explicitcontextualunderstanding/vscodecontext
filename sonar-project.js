const scanner = require('sonarqube-scanner');

const token = process.env.SONAR_TOKEN || process.env.SONAR_PROJECT_KEY;
if (!token) {
  console.error('Error: SONAR_TOKEN or SONAR_PROJECT_KEY environment variable is required');
  process.exit(1);
}

console.log('Using Sonar token:', token ? `${token.slice(0, 4)}...${token.slice(-4)}` : 'none');
console.log('Token length:', token.length);
console.log('Organization:', 'explicitcontextualunderstanding');
console.log('Project Key:', 'vscode-context');
console.log('Project Name:', 'vscode-context');

// Verify token format
if (!/^[a-f0-9]{40}$/i.test(token)) {
  console.error('Error: Invalid token format. Token should be 40-character hexadecimal string');
  process.exit(1);
}

scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: process.env.SONAR_TOKEN || process.env.SONAR_PROJECT_KEY,
    options: {
      'sonar.organization': 'explicitcontextualunderstanding',
      'sonar.projectKey': 'vscode-context',
      'sonar.projectName': 'vscode-context',
      'sonar.projectVersion': '0.0.7',
      'sonar.sources': './src',
      'sonar.tests': './src',
      'sonar.sourceEncoding': 'UTF-8',
      'sonar.exclusions': '**/*.test.js, **/*.d.ts',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.eslint.reportPaths': 'eslint-report.json',
      'sonar.typescript.tsconfigPath': './tsconfig.json',
      'sonar.qualitygate.wait': true,
      'sonar.verbose': 'true'
    },
  },
  (error) => {
    if (error) {
      console.error('SonarQube analysis failed:', error);
      process.exit(1);
    }
    console.log('SonarQube analysis completed successfully');
    process.exit(0);
  }
);
