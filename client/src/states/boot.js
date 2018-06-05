import Phaser from 'phaser';

export class Boot extends Phaser.State {

  init() {
    this.input.maxPointers = 1;
    this.stage.disableVisibilityChange = true;
    this.stage.backgroundColor = '#22B34E';
  }

  preload() {
    this.load.image('progressBar', 'assets/img/progressBar.png');
  }

  create() {
    //scalinf for mobile device
    if (!this.game.device.desktop) {
      // change the mode of scaling to SHOW ALL 
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      // define min/max game size
      this.game.scale.minWidth = 200;
      this.game.scale.maxWidth = 800;
      this.game.scale.minHeight = 300;
      this.game.scale.maxHeight = 600;

      //
      this.game.scale.compatibility.forceMinimumDocumentHeight = true;

      // center the game on the screen
      this.game.scale.pageAlignHorizontally = true;
      this.game.scale.pageAlignVertically = true;

      // apply scale  changes
      this.game.scale.refresh();
    }
    this.state.start('Preloader');
  }
};
