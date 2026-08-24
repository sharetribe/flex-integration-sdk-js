/* eslint-env node */
const path = require('path');

// Shared configs
const entry = './src/index.js';

const babelLoader = {
  test: /.js$/,
  exclude: [/node_modules/],
  use: 'babel-loader',
};

const module = {
  rules: [babelLoader],
};

const output =  {
  path: path.resolve(__dirname, 'build'),
  filename: `sharetribe-flex-integration-sdk-node.js`,
  library: 'sharetribeSdk',
  libraryTarget: 'umd',
};

export default {
  entry,
  mode: 'production',
  output,
  target: 'node',
  module,
  optimization: {
    minimize: false
  },
  externals: [
    'axios',
  ],
};
