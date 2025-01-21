module.exports = {
  organization: "explicitcontextualunderstanding",
  serverUrl: "https://sonarcloud.io",
  projectKey: "vscode-context",
  exclusions: [
    "**/node_modules/**",
    "coverage/**",
    "**/*.test.ts",
    "**/webview/**"
  ],
  typescript: {
    lcov: {
      reportPaths: "coverage/lcov.info"
    }
  },
  javascript: {
    lcov: {
      reportPaths: "coverage/lcov.info"
    }
  }
};
