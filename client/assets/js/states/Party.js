Game.Party = function (game) {
	this.debug = false;
	this.actionList = ['NONE', 'SELECT', 'PLAY']
	this.action = this.actionList[0];
	this.cardID = null;
};

Game.Party.prototype = {
	create : function () {
		that = this;
		
		// get all datas to refresh display
		socket.on("refresh game", function(data){
			console.log("refresh game");
			// display current score
			graphics.drawText(game, {x:game.world.centerX, y:600, height:0, width: 0}, data.scoringGame, styles.titleText);
			// define next action to do
			that.actionList = data.action;
			// display card in hand
        	var index = 0;
			data.givenCards.forEach(card => {
				var cardPosition = {x:-100+50*index++, y:game.world.height-250}
				graphics.drawCard(game, cardPosition, card, function(){});
			});
			// display card played
			//graphics.drawText(game, {x:10, y:10, height:0, width: 0}, 'Template Game', styles.titleText);
			// display last hand played
			startButton = graphics.drawButtonWithText(game, {x:50, y:170, height:50, width: 200}, styles.startButton, 'Last hand', styles.startText, 'test', function(){
				//socket.emit("ready to play", null);
				//if( that.action != that.actionList[0])
				//	socket.emit(that.action, that.cardID).value;
			});
		});

		//send signal ready
		console.log("ready to play");
		socket.emit("ready to play", null);
	},

	update : function () {

	},

	render: function () {
		if (this.debug) {

		}
	}
};
