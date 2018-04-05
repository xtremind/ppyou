Game.Party = function (game) {
	this.debug = false;
	this.actionList = ['NONE', 'GAP', 'SELECT', 'PLAY', 'WAIT']
	this.action = this.actionList[0];
	this.playedCardPosition= new Map();
	this.hand=[];
};

Game.Party.prototype = {
	create : function () {
		that = this;
		
		// get all datas to refresh display
		socket.on("refresh data", function(data){
			console.log("refresh data");
			if (that.playedCardPosition.size === 0) {
				that.computePlayedCardPosition(data.scoringGame);
			}
			that.action = data.action;
			that.gap = data.action === "GAP" ? data.gap : 0;
			that.hand = data.givenCards;
        	that.refreshDisplay();
		});

		//send signal ready
		console.log("ready to play");
		socket.emit("ready to play", null);
	},

	refreshDisplay : function (){
		console.log("refreshDisplay");
		//clear display
		game.world.removeAll()
		//display message
		if(that.action === 'WAIT') {
			graphics.drawText(game, {x:game.world.centerX, y:game.world.centerY, height:0, width: 0}, "En attente des autres joueurs", styles.titleText);
		}
		// display current score
		//graphics.drawText(game, {x:game.world.centerX, y:600, height:0, width: 0}, data.scoringGame, styles.titleText);
		// display card in hand
		var posX = (1200 - (100 + (this.hand.length-1) * 50))/2
		this.hand.forEach((card, index) => {
			var cardPosition = {x:posX+50*index++, y:game.world.height-(card.selected ?200:150)}
			graphics.drawCard(game, cardPosition, card, function(){

				if (that.action === "GAP"){
					console.log("Card action : GAP");
					var nbSelected = that.hand.filter(function(card){return card.selected}).length;
					for (var i = 0; i < that.hand.length; i++) {
						if (that.hand[i].id == card.id)
							that.hand[i].selected = !that.hand[i].selected && nbSelected < that.gap ;
					}
				} else if (that.action === "PLAY") {
					console.log("Card action : PLAY");
					//send card selected

				} else {
					console.log("Card action : NONE");

				}

				that.refreshDisplay();
			});
		});
		// draw valid gap
		if (that.action === "GAP" && that.hand.filter(function(card){return card.selected}).length === that.gap){
			graphics.drawButtonWithText(game, {x:game.world.centerX-100, y:game.world.height-300, height:50, width: 200}, styles.startButton, 'Valider ecart', styles.startText, 'test', function(){
				console.log("Send Gap");
				that.hand.filter(function(card){return card.selected});
				//socket.emit("ready to play", null);
				that.action = 'WAIT';
				that.refreshDisplay();
			});
		}
		// display card played
		/*var playTable = {x0: 550,y0: 200, rayon: 200};
		var radius = (Math.PI*2) / this.hand.length;
		this.hand.forEach((card, index) => {
			var cardPosition = {x:playTable.x0+playTable.rayon*Math.sin(radius*index), y:playTable.y0+playTable.rayon*Math.cos(radius*index)};
			graphics.drawCard(game, cardPosition, card, function(){});
		});*/

		//graphics.drawText(game, {x:10, y:10, height:0, width: 0}, 'Template Game', styles.titleText);
		// display last hand played
		//lastHand = graphics.drawButtonWithText(game, {x:50, y:170, height:50, width: 200}, styles.startButton, 'Last hand', styles.startText, 'test', function(){
			//socket.emit("ready to play", null);
			//if( that.action != that.actionList[0])
			//	socket.emit(that.action, that.cardID).value;
		//});
	},

	computePlayedCardPosition : function(players){
		var playTable = {x0: 550,y0: 200, rayon: 200};
		var radius = (Math.PI*2) / players.length;
		players.forEach((player, index) => {
			var cardPosition = {x:playTable.x0+playTable.rayon*Math.sin(radius*index), y:playTable.y0+playTable.rayon*Math.cos(radius*index)};
			that.playedCardPosition.set(player.id, cardPosition);
		});
	},

	update : function () {

	},

	render: function () {
		if (this.debug) {

		}
	}
};
