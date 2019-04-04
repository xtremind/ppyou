import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
    constructor(test) {
      super({
        key: 'BootScene'
      });
    }
  
    preload() {
      console.log("BootScene");
      this.scene.start('PreloadScene');
    }
  
  }
  
  export default BootScene;