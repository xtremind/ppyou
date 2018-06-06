const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// see https://github.com/photonstorm/phaser/tree/v2.6.2#webpack
const phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');

module.exports = {
  entry: './src/gameEngine.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      },
      {
        test: /pixi\.js/,
        use: ['expose-loader?PIXI']
      },
      {
        test: /phaser-split\.js$/,
        use: ['expose-loader?Phaser']
      },
      {
        test: /p2\.js/,
        use: ['expose-loader?p2']
      },
      {
        test: /phaser\-input\.js$/,
        use: 'exports-loader?PhaserInput=PhaserInput'
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'Ppyou'
    })
  ],
  resolve: {
    alias: {
      'phaser': path.join(phaserModule, 'build/custom/phaser-split.js'),
      'pixi': path.join(phaserModule, 'build/custom/pixi.js'),
      'p2': path.join(phaserModule, 'build/custom/p2.js'),
      'phaser-input': path.join(__dirname, 'node_modules/@orange-games/phaser-input/build/phaser-input.js')
    }
  },
  devtool: 'inline-source-map'
};