const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: '${env:SONAR_PROJECT_KEY}', // Replace with your SonarCloud token
    options: {
      'sonar.organization': 'explicitcontextualunderstanding', // Replace with your organization key
      'sonar.projectKey': 'sonar.projectKey',   // Replace with your project key
      'sonar.sources': './src',                // Adjust to your source code directory
      'sonar.exclusions': '**/*.test.js',      // Optional: Exclude test files or other patterns
    },
  },
  () => process.exit(),
);
