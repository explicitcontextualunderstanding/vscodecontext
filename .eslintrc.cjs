module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Your custom rules
  },
  ignorePatterns: ['node_modules/', 'dist/', 'out/', 'coverage/', '*.min.js', '*.d.ts'],
  overrides: [
    {
      files: ['src/**/*'],
      excludedFiles: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**'],
    },
    {
      files: ['webpack.config.js'],
      parserOptions: {
        sourceType: 'script',
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};