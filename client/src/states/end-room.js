import Phaser from 'phaser';
import graphics from '../utils/graphics';
import styles from '../utils/styles';

export class EndRoom extends Phaser.State {
 
  constructor(socket) {
    super();
    this.socket = socket;
  }

  create() {
    console.log("EndRoom.create");
    const stateScope = this;

    // add a background image
    stateScope.sprite = stateScope.game.add.tileSprite(0, 0, 1200, 800, 'cardTable');
    
    // add a title
    var title = graphics.drawText(stateScope.game, { x: stateScope.world.centerX, y: -50, height: 0, width: 0 }, 'End Game', styles.titleText);
    //animate title
    stateScope.game.add.tween(title).to({ y: 80 }, 1000).easing(Phaser.Easing.Bounce.Out).start();

    //when receiving datas
        // show hall of fame
    stateScope.socket.on("ranking", function (data) {
      console.log("ranking");
      console.log(data);
      // display final score
      let currentRank = -1;
      data.forEach(function (player, index) {
        graphics.drawLeftText(stateScope.game, { x: 100, y: 200 + index * 30, height: 0, width: 0 }, player.rank + " -> " +player.name, styles.playerScore);
        graphics.drawText(stateScope.game, { x: 400, y: 200 + index * 30, height: 0, width: 0 }, player.score, styles.playerScore);
      })
    });

    // show achievement (best player, badest player, ...)
    stateScope.socket.on("achievement", function (data) {
      console.log("achievement "  + data);
    });

    //asks for data

    //add button to go into the main menu
    graphics.drawButtonWithText(stateScope.game, { x: this.world.centerX - 100 , y: 700, height: 50, width: 200 }, styles.leaveButton, 'leave game', styles.leaveText, 'leave game', function () {
        stateScope.socket.emit('leave game', { id: stateScope.game.currentGameId });
        stateScope.resetEvents();
        stateScope.game.currentGameId = null;
        stateScope.state.start('MainMenu');
    });

      
    console.log("get ranking");
    stateScope.socket.emit("get ranking", null);
    stateScope.socket.emit("get achievement", null);
  }
  

  resetEvents() {
    //this.socket.off("list players");
  }
}