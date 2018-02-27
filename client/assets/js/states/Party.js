Game.Party = function (game) {
	this.debug = false;
};

Game.Party.prototype = {
	create : function () {
		startButton = graphics.drawButtonWithText(game, {x:50, y:170, height:50, width: 200}, styles.startButton, 'start game', styles.startText, 'test', function(){
			console.log("emit Test");
			socket.emit('test', null);
		});
	},

	update : function () {

	},

	render: function () {
		if (this.debug) {

		}
	}
};
