const webpack = require("webpack");
const path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules').filter(function (x) {
  return ['.bin'].indexOf(x) === -1;
}).forEach(function (mod) {
  nodeModules[mod] = 'commonjs ' + mod;
});

nodeModules["Phaser"] = "Phaser";

let config = {
  entry: './src/gameEngine.js',
  output: {
    filename: './[name]-bundle.js',
    path: path.resolve(__dirname, './dist')
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [
      path.resolve(__dirname, '/src'),
      'node_modules'
    ]
  },
  externals: nodeModules
};

module.exports = config;
