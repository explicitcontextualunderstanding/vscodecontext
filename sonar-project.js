const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: process.env.SONAR_TOKEN,
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
      'sonar.qualitygate.wait': true
    },
  },
  () => process.exit(),
);
