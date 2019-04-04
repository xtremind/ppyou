import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
    constructor(test) {
      super({
        key: 'PreloadScene'
      });
    }
  
    init() { }
  
    preload() {
      console.log("PreloadScene");
  
        // FIXME add a 'Loading ...' label on the screen
        const loadingLabel = this.add.text(this.sys.game.config.height/2, 150, 'Loading ...', { font: '30px Arial', fill: '#ffffff' });
        //loadingLabel.anchor.setTo(0.5, 0.5);

      const progress = this.add.graphics();
  
      // Register a load progress event to show a load bar
      this.load.on('progress', (value) => {
        console.log("PreloadScene - progress");
        progress.clear();
        progress.fillStyle(0xffffff, 1);
        progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 60);
      });
   
      // Register a load complete event to launch the title screen when all files are loaded
      this.load.on('complete', () => {
        console.log("PreloadScene - complete");
        loadingLabel.destroy();
        progress.destroy();
        this.scene.start('TitleScene');
      });
  
      //Load all assets
      this.load.image('cardTable', 'public/img/cardTable.png');
      this.load.audio('playCard', 'public/audio/playcard.wav');
  
    }
  }
  
  export default PreloadScene;