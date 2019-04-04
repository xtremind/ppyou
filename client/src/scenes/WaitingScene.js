import Phaser from 'phaser';
import Graphics from '../utils/Graphics';
import Styles from '../utils/Styles';

class WaitingScene extends Phaser.Scene {

    constructor(socket) {
      super({
        key: 'WaitingScene'
      });
      this.socket = socket;
    }
  
    preload() {
        console.log("WaitingScene");
    }
  
    create() {
      console.log("WaitingScene.create");

      const sceneScope = this;
      
      //add background image
      sceneScope.add.image(0, 0, 'cardTable').setOrigin(0);

      //add title
      sceneScope.add.text(sceneScope.sys.game.config.width/2, 150, '♥ ♣  PPyou  ♠ ♦', Styles.titleText).setOrigin(0.5);

      var startButton = null;

      // add a subtitle
      var subtitle = Graphics.drawText(sceneScope, { x: sceneScope.cameras.main.centerX, y: 200, height: 0, width: 0 }, 'Game ' + sceneScope.sys.game.currentGameId, Styles.subtitleText, true);
      //animate title
      //sceneScope.sys.game.add.tween(subtitle).to({ y: 150 }, 1000).easing(Phaser.Easing.Bounce.Out).start();
  
      sceneScope.sys.game.socket.on("list players", function (data) {
        console.log("refresh list of players in the game");
        // delete current List            
        for (var key in sceneScope.playersList) {
          Graphics.delete(sceneScope.playersList[key]);
        }
  
        sceneScope.playersList = [];
        var position = 0;
  
        if (startButton != null) {
          startButton = Graphics.delete(startButton);
        }
        // create new join List
        data.forEach(function (player) {
          sceneScope.playersList[player.id] = Graphics.drawText(sceneScope, { x: sceneScope.cameras.main.centerX + 100, y: 305 + 70 * position++, height: 0, width: 0 }, player.name, Styles.playerNameText, false);
        });
  
        // if hoster : button start if more at least 3 players
        if (sceneScope.sys.game.currentGameId === this.id && data.length > 2) { //TODO get from game configuration
          startButton = Graphics.drawButton(sceneScope, { x: sceneScope.cameras.main.centerX - 200, y: 280, height: 50, width: 200 }, Styles.startButton, 'start game', Styles.startText, 'start game', function () {
            sceneScope.resetEvents();
            sceneScope.sys.game.socket.emit('start game', { id: sceneScope.sys.game.currentGameId });
            sceneScope.scene.start('GameScene');
          });
        }
      });
  
      sceneScope.sys.game.socket.on("end game", function () {
        sceneScope.resetEvents();
        sceneScope.sys.game.currentGameId = null;
        sceneScope.scene.start('TitleScene');
      });
  
      sceneScope.sys.game.socket.on("start game", function () {
        sceneScope.resetEvents();
        sceneScope.scene.start('GameScene');
      });
  
      Graphics.drawButton(sceneScope, { x: sceneScope.cameras.main.centerX - 200, y: 350, height: 50, width: 200 }, Styles.leaveButton, 'leave game', Styles.leaveText, 'leave game', function () {
        sceneScope.sys.game.socket.emit('leave game', { id: sceneScope.sys.game.currentGameId });
        sceneScope.resetEvents();
        sceneScope.sys.game.currentGameId = null;
        sceneScope.scene.start('TitleScene');
      });
  
      sceneScope.sys.game.socket.emit('get playerlist', { id: sceneScope.sys.game.currentGameId });

    }

    resetEvents() {
      this.sys.game.socket.off("list players");
      this.sys.game.socket.off("end game");
      this.sys.game.socket.off("start game"); 
    }

    update(){}
}

export default WaitingScene;