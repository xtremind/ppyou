Game.Party = function (game) {
	this.debug = false;
	this.actionList = ['NONE', 'GAP', 'SELECT', 'PLAY']
	this.action = this.actionList[0];
	this.hand=[];
};

Game.Party.prototype = {
	create : function () {
		that = this;
		
		// get all datas to refresh display
		socket.on("refresh data", function(data){
			console.log("refresh data");
			// define next action to do
			that.action = data.action;
			that.hand = data.givenCards;
        	that.refreshDisplay();
		});

		//send signal ready
		console.log("ready to play");
		socket.emit("ready to play", null);
	},

	refreshDisplay : function (){
		console.log("refreshDisplay");
		// display current score
		//graphics.drawText(game, {x:game.world.centerX, y:600, height:0, width: 0}, data.scoringGame, styles.titleText);
		// display card in hand
		var index = 0;
		this.hand.forEach(card => {
			var cardPosition = {x:-100+50*index++, y:game.world.height-250}
			graphics.drawCard(game, cardPosition, card, function(){});
		});
		// display card played
		//graphics.drawText(game, {x:10, y:10, height:0, width: 0}, 'Template Game', styles.titleText);
		// display last hand played
		//lastHand = graphics.drawButtonWithText(game, {x:50, y:170, height:50, width: 200}, styles.startButton, 'Last hand', styles.startText, 'test', function(){
			//socket.emit("ready to play", null);
			//if( that.action != that.actionList[0])
			//	socket.emit(that.action, that.cardID).value;
		//});
	},

	update : function () {

	},

	render: function () {
		if (this.debug) {

		}
	}
};
