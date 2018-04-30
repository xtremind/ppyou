var Game = {};

Game.Boot = function (game) {

};

Game.Boot.prototype = {
  init: function () {
    this.input.maxPointers = 1;
    this.stage.disableVisibilityChange = true;
    this.stage.backgroundColor = '#22B34E';
  },

  preload: function () {
    this.load.image('progressBar', 'assets/img/progressBar.png');
  },

  create: function () {
    //scalinf for mobile device
    if (!game.device.desktop) {
      // change the mode of scaling to SHOW ALL 
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      // define min/max game size
      game.scale.minWidth = 200;
      game.scale.maxWidth = 800;
      game.scale.minHeight = 300;
      game.scale.maxHeight = 600;

      //
      game.scale.compatibility.forceMinimumDocumentHeight = true;


      // center the game on the screen
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically = true;

      // apply scale  changes
      game.scale.refresh();
    }

    this.state.start('Preloader');
  }
};