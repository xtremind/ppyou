// declare modules
import 'p2';
import 'pixi';
import 'phaser';
import 'phaserInput';
import 'socketIoClient';

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
  socket = io.connect(window.location.href);

  //Initialise game variable
  game = new Phaser.Game(1200, 800, Phaser.CANVAS);

  //Declare states
  game.state.add('Boot', Game.Boot);
  game.state.add('Preloader', Game.Preloader);
  game.state.add('MainMenu', Game.MainMenu);
  game.state.add('WaitingRoom', Game.WaitingRoom);
  game.state.add('Party', Game.Party);

  //Launch Boot state
  game.state.start('Boot');

};
