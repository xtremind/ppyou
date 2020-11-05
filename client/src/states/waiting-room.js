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
    var addBotButton = null;

    // add a background image
    stateScope.sprite = stateScope.game.add.tileSprite(0, 0, 1200, 800, 'cardTable');
    // add a title
    graphics.drawText(stateScope.game, { x: this.world.centerX, y: 80, height: 0, width: 0 }, '♥ ♣  PPyou  ♠ ♦', styles.titleText);
    // add a subtitle
    var subtitle = graphics.drawText(stateScope.game, { x: this.world.centerX, y: -50, height: 0, width: 0 }, 'Game ' + stateScope.game.currentGameId, styles.subtitleText);
    //animate subtitle
    stateScope.game.add.tween(subtitle).to({ y: 150 }, 1000).easing(Phaser.Easing.Bounce.Out).start();

    stateScope.socket.on("list players", function (data) {
      console.log("refresh list of players in the game");
      // delete current List            
      for (const key in stateScope.playersList) {
        graphics.deleteText(stateScope.playersList[key]);
      }
                
      for (const key in stateScope.botsList) {
        graphics.deleteButton(stateScope.botsList[key]);
      }

      stateScope.playersList = [];
      stateScope.botsList = [];
      var position = 0;

      if (startButton != null) {
        startButton = graphics.deleteButton(startButton);
      }
      if (addBotButton != null) {
        addBotButton = graphics.deleteButton(addBotButton);
      }
      // create new join List
      data.forEach(function (player) {
        stateScope.playersList[player.id] = graphics.drawLeftText(stateScope.game, { x: stateScope.world.centerX + 100, y: 205 + 50 * ++position, height: 0, width: 0 }, player.name, styles.playerNameText);
        if(player.type === "bot"){
          stateScope.botsList[player.id] = graphics.drawButtonWithText(stateScope.game, { x: stateScope.world.centerX + 300, y: 220 + 50 * position, height: 0, width: 0 }, styles.startButton, 'remove', styles.startText, 'remove', function () {
            console.log("remove bot");
            stateScope.socket.emit('remove bot', {id: player.id});
          })
        }
      });

      // if hoster : button start if more at least 3 players
      if (stateScope.game.currentGameId === this.id && data.length > 2) { //TODO get from game configuration
        startButton = graphics.drawButtonWithText(stateScope.game, { x: stateScope.world.centerX - 200, y: 280, height: 50, width: 200 }, styles.startButton, 'start game', styles.startText, 'start game', function () {
          stateScope.resetEvents();
          stateScope.socket.emit('start game', { id: stateScope.game.currentGameId });
          stateScope.state.start('Party');
        });
      }

      //if hoster : button add bot if less than 8 players
      if (stateScope.game.currentGameId === this.id && data.length < 8) { //TODO get from game configuration
        addBotButton = graphics.drawButtonWithText(stateScope.game, { x: stateScope.world.centerX - 200, y: 420, height: 50, width: 200 }, styles.startButton, 'add bot', styles.startText, 'add bot', function () {
          console.log("add bot");
          stateScope.socket.emit('add bot', { id: stateScope.game.currentGameId });
        });
      }
    });

    stateScope.socket.on("end game", function () {
      stateScope.resetEvents();
      stateScope.game.currentGameId = null;
      stateScope.state.start('MainMenu');
    });

    stateScope.socket.on("start game", function () {
      stateScope.resetEvents();
      stateScope.state.start('Party');
    });

    graphics.drawButtonWithText(stateScope.game, { x: this.world.centerX - 200, y: 350, height: 50, width: 200 }, styles.leaveButton, 'leave game', styles.leaveText, 'leave game', function () {
      stateScope.socket.emit('leave game', { id: stateScope.game.currentGameId });
      stateScope.resetEvents();
      stateScope.playersList = [];
      stateScope.botsList = [];
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

}