const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.cjs',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  devtool: 'source-map',
  externals: [
    nodeExternals(),
    {
      vscode: 'commonjs vscode',
    },
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              // references: [{ path: './tsconfig.json' }], // Removed this line
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: false, // Disable minification for better debugging
    usedExports: true,
    sideEffects: true,
  },
  performance: {
    hints: false, // Disable performance hints for extensions
  },
  stats: {
    warnings: false,
  },
};
