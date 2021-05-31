const path = require('path');
const webpack = require('webpack');
// const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    lte: ['babel-polyfill', './bin/lte.js'],
    // client: ['babel-polyfill','./client/index.js'],
    // db: ['babel-polyfill','./utils/db.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [new webpack.ProgressPlugin()],
  // externals: [nodeExternals()],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,

      include: [
        path.resolve(__dirname, 'lte'),
        path.resolve(__dirname, 'bin'),
        path.resolve(__dirname, 'client'),
        path.resolve(__dirname, 'utils')
      ],

      loader: 'babel-loader'
    }]
  }
}
