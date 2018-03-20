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
		socket.on("updateGame", function(data){
			// display current score
			// display card in hand
			// display card played
			// define next action to do
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
