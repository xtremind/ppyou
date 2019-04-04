import Phaser from 'phaser';
import Graphics from '../utils/Graphics';
import Styles from '../utils/Styles';

class TitleScene extends Phaser.Scene {

    constructor(socket) {
      super({
        key: 'TitleScene'
      });
      this.socket = socket;
    }
  
    preload() {
      console.log("TitleScene.preload");
    }
  
    create() {
      console.log("TitleScene.create");

      const sceneScope = this;
      
      //add background image
      sceneScope.add.image(0, 0, 'cardTable').setOrigin(0);

      //add title
      sceneScope.add.text(sceneScope.sys.game.config.width/2, 150, '♥ ♣  PPyou  ♠ ♦', Styles.titleText).setOrigin(0.5);

      //TODO add input text for naming player
      if (typeof sceneScope.sys.game.playerName === 'undefined') {
        sceneScope.sys.game.playerName = "Player_" + sceneScope.sys.game.socket.id.substring(0, 6);
      }
      
      //add rounded buttons
      Graphics.drawButton(sceneScope, { x:  ( this.cameras.main.width ) * .5 - 200, y: 280, height: 50, width: 200 }, Styles.hostButton, 'host game', Styles.hostText, 'host game', 
        function () { 
          //sceneScope.sys.game.playerName = sceneScope.sys.game.playerName; 
          sceneScope.sys.game.socket.emit('host game', { name: sceneScope.sys.game.playerName }); 
      });

      sceneScope.sys.game.socket.on("list games", function (data) {
        // delete current join List            
        for (var key in sceneScope.gameList) {
          Graphics.delete(sceneScope.gameList[key]);
        }
  
        sceneScope.gameList = [];
        var position = 0;
  
        // create new join List
        data.forEach(function (party) {
          sceneScope.gameList[party.id] = Graphics.drawButton(sceneScope, { x: sceneScope.cameras.main.centerX+ 50, y: 210 + 70 * ++position, height: 50, width: 200 }, Styles.joinButton, 'join game', Styles.joinText, 'join game', function () {
            //sceneScope.sys.game.playerName = playerName.value;
            console.log("join game " + party.id);
            sceneScope.sys.game.socket.emit('join game', { id: party.id, name: sceneScope.sys.game.playerName });
          });
        });
      });
  
      sceneScope.sys.game.socket.on("game joined", function (party) {
        sceneScope.gameJoined(party.id);
      });

      // emit event to get gamelist
      sceneScope.sys.game.socket.emit('get gamelist', {});
    }

    gameJoined(id) {
      console.log("game joined " + id);
      this.sys.game.socket.off("list games");
      this.sys.game.socket.off("game joined");
      this.sys.game.currentGameId = id;
      this.gameList = [];
      this.scene.start('WaitingScene'); 
    }

    update(){}
}

export default TitleScene; 