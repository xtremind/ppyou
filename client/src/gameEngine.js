// declare modules
//import '../node_modules/phaser-ce/build/custom/pixi.js';
//import '../node_modules/phaser-ce/build/custom/p2.js';
//import '../node_modules/phaser-ce/build/custom/phaser-split.js';

import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';

import '../node_modules/@orange-games/phaser-input/build/phaser-input.js';

import io from '../node_modules/socket.io-client/dist/socket.io.js';

// declare states
import Boot from './states/Boot.js';
import Preloader from './states/Preloader.js';
import MainMenu from './states/MainMenu.js';
import WaitingRoom from './states/WaitingRoom.js';
import Party from './states/Party.js';

// declare Utils
import './utils/graphics.js';
import './utils/styles.js';

window.onload = function () {

  //connect to server
  const socket = io.connect(window.location.href);

  //Initialise game variable
  var game = new Phaser.Game(1200, 800, Phaser.CANVAS);

  //Declare states
  game.state.add('Boot', Boot);
  game.state.add('Preloader', Preloader);
  game.state.add('MainMenu', MainMenu);
  game.state.add('WaitingRoom', WaitingRoom);
  game.state.add('Party', Party);

  //Launch Boot state
  game.state.start('Boot');

};
