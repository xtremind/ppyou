import Phaser from 'phaser';

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
      // TODO display scoring game for all players, sort by score 
      // TODO display some badges ?
      // TODO display a button to return to waitingScene
      // TODO display a button to return to titleScene
    }

    update(){

    }
}

export default ScoreScene;