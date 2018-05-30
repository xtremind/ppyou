const webpack = require("webpack");
const path = require('path');

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/')
var phaser = path.join(phaserModule, 'src/Phaser.js')

// Phaser-Input webpack config
var phaserInputModule = path.join(__dirname, '/node_modules/@orange-games/phaser-input/')
var phaserInput = path.join(phaserInputModule, 'build/phaser-input.js')

// socket-io webpack config
var socketIoClientModule = path.join(__dirname, '/node_modules/socket.io-client/')
var socketIoClient = path.join(socketIoClientModule, 'dist/socket.io.js')


let config = {
  entry: './src/gameEngine.js',
  target: 'web',
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
    ],
    alias: {
      'phaser': phaser,
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

