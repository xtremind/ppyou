import Phaser from 'phaser';
import graphics from '../utils/graphics';
import styles from '../utils/styles';

export class WaitingRoom extends Phaser.State {

  constructor(socket) {
    super();
    this.socket = socket;
    this.playersList = [];
  }

  create() {
    console.log("WaitingRoom.create");

    var stateScope = this;
    var startButton = null;

    // add a background image
    stateScope.sprite = stateScope.game.add.tileSprite(0, 0, 1200, 800, 'cardTable');
    // add a title
    var title = graphics.drawText(stateScope.game, { x: this.world.centerX, y: 80, height: 0, width: 0 }, '♥ ♣  PPyou  ♠ ♦', styles.titleText);
    // add a subtitle
    var subtitle = graphics.drawText(stateScope.game, { x: this.world.centerX, y: -50, height: 0, width: 0 }, 'Game ' + stateScope.game.currentGameId, styles.subtitleText);
    //animate title
    stateScope.game.add.tween(subtitle).to({ y: 150 }, 1000).easing(Phaser.Easing.Bounce.Out).start();

    stateScope.socket.on("list players", function (data) {
      console.log("refresh list of players in the game");
      // delete current List            
      for (var key in stateScope.playersList) {
        graphics.deleteText(stateScope.playersList[key]);
      }

      stateScope.playersList = [];
      var position = 0;

      if (startButton != null) {
        startButton = graphics.deleteButton(startButton);
      }
      // create new join List
      data.forEach(function (player) {
        stateScope.playersList[player.id] = graphics.drawLeftText(stateScope.game, { x: stateScope.world.centerX + 100, y: 305 + 70 * position++, height: 0, width: 0 }, player.name, styles.playerNameText);
      });

      // if hoster : button start if more at least 3 players
      if (stateScope.game.currentGameId === this.id && data.length > 2) { //TODO get from game configuration
        startButton = graphics.drawButtonWithText(stateScope.game, { x: stateScope.world.centerX - 200, y: 280, height: 50, width: 200 }, styles.startButton, 'start game', styles.startText, 'start game', function () {
          stateScope.resetEvents();
          stateScope.socket.emit('start game', { id: stateScope.game.currentGameId });
          stateScope.state.start('Party');
        });
      }
    });

    stateScope.socket.on("end game", function (data) {
      stateScope.resetEvents();
      stateScope.game.currentGameId = null;
      stateScope.state.start('MainMenu');
    });

    stateScope.socket.on("start game", function (data) {
      stateScope.resetEvents();
      stateScope.state.start('Party');
    });

    graphics.drawButtonWithText(stateScope.game, { x: this.world.centerX - 200, y: 350, height: 50, width: 200 }, styles.leaveButton, 'leave game', styles.leaveText, 'leave game', function () {
      stateScope.socket.emit('leave game', { id: stateScope.game.currentGameId });
      stateScope.resetEvents();
      stateScope.game.currentGameId = null;
      stateScope.state.start('MainMenu');
    });

    stateScope.socket.emit('get playerlist', { id: stateScope.game.currentGameId });
  }

  resetEvents() {
    this.socket.off("list players");
    this.socket.off("end game");
    this.socket.off("start game");
  }

  start() { }
};