Game.Preloader = function (game) {
  //this.preloadBar = null;
};

Game.Preloader.prototype = {
  preload: function () {

    // add a 'Loading ...' label on the screen
    var loadingLabel = this.add.text(this.world.centerX, 150, 'Loading ...', { font: '30px Arial', fill: '#ffffff' });
    loadingLabel.anchor.setTo(0.5, 0.5);

    // add a progress bar
    var progressBar = this.add.sprite(this.world.centerX, this.world.centerY, 'progressBar');
    progressBar.anchor.setTo(0.5, 0.5);
    this.time.advancedTiming = true;
    this.load.setPreloadSprite(progressBar);

    //Load all assets
    this.load.image('cardTable', 'assets/img/cardTable.png');
  },

  create: function () {
    //this.state.start('LevelSingle');
    this.state.start('MainMenu');
  }
};