//Import modules
import 'pixi';
import 'p2';
import Phaser from 'phaser';
import io from 'socket.io-client';
import logger from 'js-logger';

//Import state
import { Boot } from './states/boot';
import { Preloader } from './states/preloader';
import { MainMenu } from './states/main-menu';
import { WaitingRoom } from './states/waiting-room';
import { Party } from './states/party';

//connect to server
let socket = io.connect(window.location.href);

//Initialise game variable
let game = new Phaser.Game(1200, 800, Phaser.CANVAS);

logger.useDefaults();
logger.setLevel(logger.DEBUG);

//Declare states
game.state.add('Boot', new Boot());
game.state.add('Preloader', new Preloader());
game.state.add('MainMenu', new MainMenu(socket, logger));
game.state.add('WaitingRoom', new WaitingRoom(socket, logger));
game.state.add('Party', new Party(socket, logger));

//Launch Boot state
game.state.start('Boot');
