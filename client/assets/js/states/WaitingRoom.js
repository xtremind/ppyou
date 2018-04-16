Game.WaitingRoom = function (game) {
    this.playersList = [];
};

Game.WaitingRoom.prototype = {
	create : function () {
		console.log("WaitingRoom.create");

        position = 0;
        that = this;
        startButton = null;

        // add a background image
        sprite = game.add.tileSprite(0, 0, 1200, 800, 'cardTable');
        // add a title
        var title = graphics.drawText(game, {x:this.world.centerX, y:80, height:0, width: 0}, '♥ ♣  PPyou  ♠ ♦', styles.titleText);
        // add a subtitle
        var subtitle = graphics.drawText(game, {x:this.world.centerX, y:-50, height:0, width: 0}, 'Game ' + game.currentGameId, styles.subtitleText);
        //animate title
        game.add.tween(subtitle).to({y: 150}, 1000).easing(Phaser.Easing.Bounce.Out).start();
       
		socket.on("list players", function(data){
			console.log("refresh list of players in the game");
            // delete current List            
            for(var key in that.playersList){
                graphics.deleteText(that.playersList[key]);
            }
        
            that.playersList = [];
            position = 0;

            if(startButton != null){
                startButton = graphics.deleteButton(startButton);
            }
            // create new join List
            data.forEach(function(player){
                that.playersList[player.id] = graphics.drawLeftText(game, {x:that.world.centerX+100, y:305+70*position++, height:0, width: 0}, player.name, styles.playerNameText);
            });
            
            // if hoster : button start if more at least 3 players
            if(game.currentGameId === this.id && data.length > 2){ //TODO get from game configuration
                startButton = graphics.drawButtonWithText(game, {x:that.world.centerX-200, y:280, height:50, width:200}, styles.startButton, 'start game', styles.startText, 'start game', function(){
                    that.resetEvents();
                    socket.emit('start game', {id: game.currentGameId});
                    that.state.start('Party');
                });
            }
		});

		socket.on("end game", function(data){
            that.resetEvents();
            game.currentGameId = null;
            that.state.start('MainMenu');
        });

		socket.on("start game", function(data){
            that.resetEvents();
            that.state.start('Party');
        });

        graphics.drawButtonWithText(game, {x:this.world.centerX-200, y:350, height:50, width: 200}, styles.leaveButton, 'leave game', styles.leaveText, 'leave game', function(){
            socket.emit('leave game', {id: game.currentGameId});
            that.resetEvents();
            game.currentGameId = null;
            that.state.start('MainMenu');
        });
        
        socket.emit('get playerlist', {id: game.currentGameId});
	},
    
    resetEvents : function (){
        socket.off("list players");
        socket.off("end game");
        socket.off("start game");
    },

    start : function () {}
};
