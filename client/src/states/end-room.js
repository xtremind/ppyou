import Phaser from 'phaser';
import graphics from '../utils/graphics';
import logger from '../utils/logger';
import styles from '../utils/styles';

export class EndRoom extends Phaser.State {
 
  constructor(socket) {
    super();
    this.socket = socket;
  }

  create() {
    logger.debug(this.socket, "EndRoom.create");
    const stateScope = this;

    // add a background image
    stateScope.sprite = stateScope.game.add.tileSprite(0, 0, 1200, 800, 'cardTable');
    
    // add a title
    var title = graphics.drawText(stateScope.game, { x: stateScope.world.centerX, y: -50, height: 0, width: 0 }, 'End Game', styles.titleText);
    //animate title
    stateScope.game.add.tween(title).to({ y: 80 }, 1000).easing(Phaser.Easing.Bounce.Out).start();

    // show hall of fame
    stateScope.socket.on("ranking", function (data) {
      logger.debug(stateScope.socket, "ranking");
      //console.log(data);
      // let currentRank = -1; // changer la taille de police en fonction du rank
      data.forEach(function (player, index) { // 🏆🥇🥈🥉 
        let medal = player.rank === 1 ? "🏆" : player.rank === 2 ? "🥈" : player.rank === 3 ? "🥉" : player.rank;
        graphics.drawLeftText(stateScope.game, { x: 100, y: 200 + index * 30, height: 0, width: 0 }, medal + " " +player.name, styles.playerScore);
        graphics.drawLeftText(stateScope.game, { x: 400, y: 200 + index * 30, height: 0, width: 0 }, player.score, styles.playerScore);
      });
    });

    // show achievement
    stateScope.socket.on("achievement", function (data) {
      logger.debug(stateScope.socket, "achievement");
      //console.log(data);
      data.forEach(function(achievement, index) {
        graphics.drawText(stateScope.game, { x: 800, y: 200 + index * 100, height: 0, width: 0 }, achievement.name , styles.playerScore);
        graphics.drawText(stateScope.game, { x: 800, y: 230 + index * 100, height: 0, width: 0 }, achievement.player + " (" + achievement.score+ ")", styles.playerScore);
      });
    });

    //add button to go into the main menu
    graphics.drawButtonWithText(stateScope.game, { x: this.world.centerX - 100 , y: 700, height: 50, width: 200 }, styles.leaveButton, 'leave game', styles.leaveText, 'leave game', function () {
        stateScope.socket.emit('leave game', { id: stateScope.game.currentGameId });
        stateScope.resetEvents();
        stateScope.game.currentGameId = null;
        stateScope.state.start('MainMenu');
    });

    logger.debug(stateScope.socket, "get ranking");
    stateScope.socket.emit("get ranking", null);
    stateScope.socket.emit("get achievement", null);
  }
  
  resetEvents() {
      this.socket.off("ranking");
      this.socket.off("achievement");
  }
}