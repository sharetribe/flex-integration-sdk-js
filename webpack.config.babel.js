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
  output,
  target: 'node',
  module,
  externals: [
    'axios',
  ],
};
