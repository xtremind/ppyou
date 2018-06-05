//Import modules
import 'pixi';
import 'p2';
import Phaser from 'phaser';
import io from 'socket.io-client';

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

//Declare states
game.state.add('Boot', new Boot());
game.state.add('Preloader', new Preloader());
game.state.add('MainMenu', new MainMenu(socket));
game.state.add('WaitingRoom', new WaitingRoom(socket));
game.state.add('Party', new Party(socket));

//Launch Boot state
game.state.start('Boot');
