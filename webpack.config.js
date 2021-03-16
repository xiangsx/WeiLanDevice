const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    lte: './lte/index.js',
    client: './client/index.js',
    db: './utils/db.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [new webpack.ProgressPlugin()],
  externals: [nodeExternals()],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,

      include: [
        path.resolve(__dirname, 'lte'),
        path.resolve(__dirname, 'client'),
        path.resolve(__dirname, 'utils')
      ],

      loader: 'babel-loader'
    }]
  }
}