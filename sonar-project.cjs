module.exports = {
  organization: 'explicitcontextualunderstanding',
  serverUrl: 'https://sonarcloud.io',
  projectKey: 'vscode-context',
  exclusions: ['**/node_modules/**', 'coverage/**', '**/*.test.ts', '**/webview/**'],
  projectDate: '2024-01-01', // New code baseline
  typescript: {
    lcov: {
      reportPaths: 'coverage/lcov.info',
    },
  },
  javascript: {
    lcov: {
      reportPaths: 'coverage/lcov.info',
    },
  },
};
