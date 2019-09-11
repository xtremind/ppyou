import Phaser from 'phaser';
import Graphics from '../utils/Graphics';
import Styles from '../utils/Styles';

class ScoreScene extends Phaser.Scene {

    constructor(socket) {
      super({
        key: 'ScoreScene'
      });
    }
  
    preload() {
        console.log("ScoreScene");
    }
  
    create() {
      console.log("ScoreScene.create");
      const sceneScope = this;

      //add background image
      sceneScope.add.image(0, 0, 'cardTable').setOrigin(0);

      sceneScope.sys.game.socket.on("score", function (data) {
        console.log("EVENT : score " + data);
        if(data.length() == 0){
          // TODO No Score - display a funny message
        } else {
          // TODO display scoring game for all players, sort by score 
          // TODO display some badges ?
        }
        // TODO display a button to return to waitingScene
        // TODO display a button to return to titleScene
        Graphics.drawButton(sceneScope, { x: sceneScope.cameras.main.centerX + 300, y: 225, height: 50, width: 200 }, Styles.startButton, 'Go to Title', Styles.startText, 'Go to Title', function () {
          console.log("go to title");
          //sceneScope.sys.game.socket.emit('remove bot', { id: player.id });
        });
      });

      sceneScope.sys.game.socket.emit("get score", null);
    }

    update(){

    }
}

export default ScoreScene;