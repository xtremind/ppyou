const webpack = require("webpack");
const path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

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

/**
const webpack = require("webpack");
const path = require('path');

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/')
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
var pixi = path.join(phaserModule, 'build/custom/pixi.js')
var p2 = path.join(phaserModule, 'build/custom/p2.js')

// Phaser-Input webpack config
var phaserInputModule = path.join(__dirname, '/node_modules/@orange-games/phaser-input/')
var phaserInput = path.join(phaserInputModule, 'build/phaser-input.js')

// socket-io webpack config
var socketIoClientModule = path.join(__dirname, '/node_modules/socket.io-client/')
var socketIoClient = path.join(socketIoClientModule, 'dist/socket.io.js')

let config = {
  entry: {
    app: [
        path.resolve(__dirname, './src/gameEngine.js')
    ]
    ,vendor: ['phaser', 'phaserInput', 'socketIoClient', 'p2', 'pixi']
  },
  target: 'web',
  output: {
    filename: './[name]-bundle.js',
    path: path.resolve(__dirname, './dist')
  },
  node: {
    fs: "empty",
    net: "empty"
  },
  optimization: {
    splitChunks: {
        cacheGroups: {
            commons: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendor',
                chunks: 'all'
            }
        }
    }
},
  resolve: {
    extensions: ['.js', '.json'],
    modules: [
      path.resolve(__dirname, '/src'), 
      'node_modules'
    ],
    alias: {
      'phaser': phaser,
      'p2': p2,
      'pixi': pixi,
      'phaserInput': phaserInput,
      'socketIoClient': socketIoClient
    }
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
*/