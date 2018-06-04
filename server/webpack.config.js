const webpack = require("webpack");
const path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

let config = {
  entry: './src/index.js',
  target: 'node',
  output: {
    filename: './bundle.js',
    path: path.resolve(__dirname, './dist')
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
  },
  externals: nodeModules
};

module.exports = config;

