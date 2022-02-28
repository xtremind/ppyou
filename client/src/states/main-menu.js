import Phaser from 'phaser';
import { PhaserInput } from 'phaser-input';
import graphics from '../utils/graphics';
import logger from '../utils/logger';
import styles from '../utils/styles';

export class MainMenu extends Phaser.State {

  constructor(socket) {
    super();
    this.socket = socket;
    this.gameList = [];
  }

  create() {
    logger.debug(this.socket, "MainMenu.create");
    const stateScope = this;

    //Add Library
    stateScope.game.add.plugin(PhaserInput.Plugin);

    // add a background image
    stateScope.sprite = stateScope.game.add.tileSprite(0, 0, 1200, 800, 'cardTable');

    // add a title
    var title = graphics.drawText(stateScope.game, { x: stateScope.world.centerX, y: -50, height: 0, width: 0 }, '♥ ♣  PPyou  ♠ ♦', styles.titleText);
    //animate title
    stateScope.game.add.tween(title).to({ y: 80 }, 1000).easing(Phaser.Easing.Bounce.Out).start();

    //add input text for naming player
    if (typeof stateScope.game.playerName === 'undefined') {
      stateScope.game.playerName = "Player_" + stateScope.socket.id.substring(0, 6);
    }

    graphics.drawText(stateScope.game, { x: stateScope.world.centerX - 100, y: 200, height: 0, width: 0 }, 'Player Name :', styles.hostText);
    var playerName = graphics.drawInputText(stateScope.game, { x: stateScope.world.centerX, y: 180 }, stateScope.game.playerName, styles.playerNameInput);

    //add rounded buttons
    graphics.drawButtonWithText(stateScope.game, { x: stateScope.world.centerX - 200, y: 280, height: 50, width: 200 }, styles.hostButton, 'host game', styles.hostText, 'host game', 
      function () {
        stateScope.game.playerName = playerName.value; 
        stateScope.socket.emit('host game', { name: playerName.value }); 
    });


    graphics.drawButtonWithText(stateScope.game, { x: 1130, y: 30, height: 40, width: 40 }, styles.hostButton, '?', styles.hostText, '?', 
      function () {
        stateScope.state.start('Help');
    });

    stateScope.socket.on("list games", function (data) {
      // delete current join List            
      for (var key in stateScope.gameList) {
        graphics.deleteButton(stateScope.gameList[key]);
      }

      stateScope.gameList = [];
      var position = 0;

      // create new join List
      data.forEach(function (party) {
        stateScope.gameList[party.id] = graphics.drawButtonWithText(stateScope.game, { x: stateScope.world.centerX + 50, y: 210 + 70 * ++position, height: 50, width: 200 }, styles.joinButton, 'join game', styles.joinText, 'join game', function () {
          stateScope.game.playerName = playerName.value;
          logger.debug(stateScope.socket, "join game " + party.id);
          stateScope.socket.emit('join game', { id: party.id, name: playerName.value });
        });
      });
    });

    stateScope.socket.on("game joined", function (party) {
      stateScope.gameJoined(party.id);
    });

    stateScope.socket.emit('get gamelist', {});
  }

  gameJoined(id) {
    logger.debug(this.socket, "game joined " + id);
    this.socket.off("list games");
    this.socket.off("game joined");
    this.game.currentGameId = id;
    this.gameList = [];
    this.state.start('WaitingRoom');
  }

}
