const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser/')
var phaser = path.join(phaserModule, 'src/phaser.js')

let config = {
  entry: path.resolve(__dirname, 'src/main.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'PPYOU'
    }),
    new CopyPlugin([
      { from: 'assets', to: 'public' },
    ])
  ],
  module: {
    rules: [
      { test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] }
    ]
  },
  resolve: {
    alias: {
      'phaser': phaser
    }
  }
};

module.exports = config;