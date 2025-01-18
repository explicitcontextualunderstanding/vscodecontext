import path from 'path';
import nodeExternals from 'webpack-node-externals';

export default {
  target: 'node',
  mode: 'production',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
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
    extensions: ['.ts', '.js'],
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
              compilerOptions: {
                sourceMap: true,
              },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: true,
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};