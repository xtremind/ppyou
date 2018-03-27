Game.Party = function (game) {
	this.debug = false;
	this.actionList = ['NONE', 'SELECT', 'PLAY']
	this.action = this.actionList[0];
	this.cardID = null;
};

Game.Party.prototype = {
	create : function () {
		that = this;
		startButton = graphics.drawButtonWithText(game, {x:50, y:170, height:50, width: 200}, styles.startButton, 'Do', styles.startText, 'test', function(){
			socket.emit("test", null);
			//if( that.action != that.actionList[0])
			//	socket.emit(that.action, that.cardID).value;
		});
		
		this.cardID = graphics.drawInputText(game, {x: 10, y:90}, "cardID to play", styles.playerNameInput);
		
		// get all datas to refresh display
		socket.on("refresh game", function(data){
			console.log("refresh game");
			// display current score
        	graphics.drawText(game, {x:10, y:10, height:0, width: 0}, data.scoringGame, styles.titleText);
			// display card in hand
        	graphics.drawText(game, {x:10, y:10, height:0, width: 0}, 'Template Game', styles.titleText);
			// display card played
        	graphics.drawText(game, {x:10, y:10, height:0, width: 0}, 'Template Game', styles.titleText);
			// define next action to do
			that.actionList = data.action;
		});


        //graphics.drawCard(game, 0, {"id": 1, "rank": "H", "suit": "3", "value": 0}, function(){});
        //graphics.drawCard(game, 1, {"id": 1, "rank": "S", "suit": "10", "value": 0}, function(){});
        //graphics.drawCard(game, 2, {"id": 1, "rank": "B", "suit": "20", "value": 20}, function(){});


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
