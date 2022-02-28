/* eslint-disable sort-imports */
//Import modules
import 'pixi';
import 'p2';
import Phaser from 'phaser';
import io from 'socket.io-client';

//Import state
import { Boot } from './states/boot';
import { Preloader } from './states/preloader';
import { MainMenu } from './states/main-menu';
import { Help } from './states/help';
import { WaitingRoom } from './states/waiting-room';
import { EndRoom } from './states/end-room';
import { Party } from './states/party';

//connect to server
const socket = io.connect(window.location.href, {reconnectionAttempts: 10});

//Initialise game variable
const game = new Phaser.Game(1200, 800, Phaser.CANVAS);

//Declare states
game.state.add('Boot', new Boot());
game.state.add('Preloader', new Preloader());
game.state.add('MainMenu', new MainMenu(socket));
game.state.add('Help', new Help());
game.state.add('WaitingRoom', new WaitingRoom(socket));
game.state.add('EndRoom', new EndRoom(socket));
game.state.add('Party', new Party(socket));

//Launch Boot state
game.state.start('Boot');
