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
import './states/Boot.js';
import './states/Preloader.js';
import './states/MainMenu.js';
import './states/WaitingRoom.js';
import './states/Party.js';

// declare Utils
import './utils/graphics.js';
import './utils/styles.js';

window.onload = function () {

  //connect to server
  const socket = io.connect(window.location.href);

  //Initialise game variable
  const game = new Phaser.Game(1200, 800, Phaser.CANVAS);

  //Declare states
  var Game = {};

  game.state.add('Boot', Game.Boot);
  game.state.add('Preloader', Game.Preloader);
  game.state.add('MainMenu', Game.MainMenu);
  game.state.add('WaitingRoom', Game.WaitingRoom);
  game.state.add('Party', Game.Party);

  //Launch Boot state
  game.state.start('Boot');

};
