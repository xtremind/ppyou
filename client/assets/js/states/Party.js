Game.Party = function (game) {
	this.debug = false;
	this.actionList = ['NONE', 'GAP', 'SELECT', 'PLAY', 'WAIT']
	this.action = this.actionList[0];
	this.playedCards=[]
	this.playedCardPosition= new Map();
	this.hand=[];
};

Game.Party.prototype = {
	create : function () {
		that = this;
        // add a background image
        sprite = game.add.tileSprite(0, 0, 1200, 800, 'cardTable');
		// get all datas to refresh display
		socket.on("refresh data", function(data){
			console.log("refresh data : " + data.action);
			if (that.playedCardPosition.size === 0) {
				that.computePlayedCardPosition(data.scoringGame);
			}
			that.scoringGame=data.scoringGame;
			that.action = data.action;
			that.gap = data.action === "GAP" ? data.gap : 0;
			that.hand = data.givenCards;
			that.playedCards = data.playedCards;
			that.ppyou = data.ppyou;
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
        // add a background image
        sprite = game.add.tileSprite(0, 0, 1200, 800, 'cardTable');
		//display message
		if(that.action === 'WAIT') {
			graphics.drawText(game, {x:game.world.centerX, y:game.world.centerY, height:0, width: 0}, "En attente des autres joueurs", styles.titleText);
		}
		if(that.action === 'GAP') {
			graphics.drawText(game, {x:game.world.centerX, y:game.world.centerY, height:0, width: 0}, "Merci de choisir " + that.gap + " cartes à donner à votre voisin", styles.titleText);
		}
		// display current score
		that.scoringGame.forEach(function(element, index){
			graphics.drawLeftText(game, {x:30, y:30+index*20, height:0, width: 0}, element.name + " : " + element.score, styles.playerScore);
		})
		// display ppyou
		graphics.drawPpyou(game, that.ppyou);
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
					var nbSelected = that.hand.filter(function(card){return card.selected}).length;
					for (var i = 0; i < that.hand.length; i++) {
						if (that.hand[i].id == card.id && nbSelected < 1 ){
							that.hand[i].selected = true;
							socket.emit("play card", card.id);
							that.action === "NONE"
						}
					}
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
				socket.emit("gap", that.hand.filter(function(card){return card.selected}).map(function(card){return card.id}));
				that.action = 'WAIT';
				that.refreshDisplay();
			});
		}
		// display card played
		this.playedCards.forEach((playedCard, index) => {
			graphics.drawCard(game, that.playedCardPosition.get(playedCard.id), playedCard.card, function(){});
		});

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
		var initial = players.findIndex(function(player){
			return player.id === socket.id;
		});
		players.forEach((player, index) => {
			var cardPosition = {x:playTable.x0+playTable.rayon*Math.sin(radius*(index-initial%players.length)), y:playTable.y0+playTable.rayon*Math.cos(radius*(index-initial%players.length))};
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
