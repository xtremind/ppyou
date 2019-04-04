// Modules
import 'phaser';
import io from 'socket.io-client';

// Plugins

// Scenes
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import PreloadScene from './scenes/PreloadScene';
import ScoreScene from './scenes/ScoreScene';
import TitleScene from './scenes/TitleScene';
import WaitingScene from './scenes/WaitingScene';


console.log("main")

//connect to server
//let socket = io.connect(window.location.href);
let socket = io.connect("http://localhost:8080"); //only work in local

// Declare configuration
const config = {
  //type: Phaser.AUTO,
  type: Phaser.CANVAS,
  width: 1200,
  height: 800,
  pixelArt: true,
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    WaitingScene,
    GameScene,
    ScoreScene
  ]
};

var game = new Phaser.Game(config);
game.socket = socket;

