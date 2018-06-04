var Game = {};

Game.MainMenu = function (game) {
  this.gameList = [];
};

Game.MainMenu.prototype = {
  create: function () {
    console.log("MainMenu.create");
    position = 0,
      that = this;

    //Add Library
    game.add.plugin(PhaserInput.Plugin);

    // add a background image
    sprite = game.add.tileSprite(0, 0, 1200, 800, 'cardTable');

    // add a title
    var title = graphics.drawText(game, { x: this.world.centerX, y: -50, height: 0, width: 0 }, '♥ ♣  PPyou  ♠ ♦', styles.titleText);
    //animate title
    game.add.tween(title).to({ y: 80 }, 1000).easing(Phaser.Easing.Bounce.Out).start();

    //add input text for naming player
    if (typeof game.playerName === 'undefined') {
      game.playerName = "Player_" + socket.id.substring(0, 6);
    }

    graphics.drawText(game, { x: this.world.centerX - 100, y: 200, height: 0, width: 0 }, 'Player Name :', styles.hostText);
    var playerName = graphics.drawInputText(game, { x: this.world.centerX, y: 180 }, game.playerName, styles.playerNameInput);

    //add rounded buttons
    graphics.drawButtonWithText(game, { x: this.world.centerX - 200, y: 280, height: 50, width: 200 }, styles.hostButton, 'host game', styles.hostText, 'host game', function () { game.playerName = playerName.value; socket.emit('host game', { name: playerName.value }); });

    socket.on("list games", function (data) {
      // delete current join List            
      for (var key in that.gameList) {
        graphics.deleteButton(that.gameList[key]);
      }

      that.gameList = [];
      var position = 0;

      // create new join List
      data.forEach(function (party) {
        that.gameList[party.id] = graphics.drawButtonWithText(game, { x: that.world.centerX + 50, y: 210 + 70 * ++position, height: 50, width: 200 }, styles.joinButton, 'join game', styles.joinText, 'join game', function () {
          game.playerName = playerName.value;
          console.log("join game " + party.id);
          socket.emit('join game', { id: party.id, name: playerName.value });
        });
      });
    });

    socket.on("game joined", function (party) {
      that.gameJoined(party.id);
    });

    socket.emit('get gamelist', {});
  },

  gameJoined: function (id) {
    console.log("game joined " + id);
    socket.off("list games");
    socket.off("game joined");
    game.currentGameId = id;
    that.gameList = [];
    that.state.start('WaitingRoom');
  },

  start: function () { }
};
