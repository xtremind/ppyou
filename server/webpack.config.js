const webpack = require("webpack");
const path = require('path');

let config = {
  entry: './src/index.js',
  target: 'node',
  output: {
    filename: './bundle.js',
    path: path.resolve(__dirname, './dist')
  },
  node: {
    fs: "empty",
    net: "empty"
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [
      path.resolve(__dirname, '/src'), 
      'node_modules'
    ]
  },
  module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }]
    }
};

module.exports = config;

