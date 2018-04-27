var express = require("express"),
    app = express(),
    http = require("http").Server(app),
	io = require("socket.io").listen(http),
	winston = require('winston');

var config = winston.config;
logger = new (winston.Logger)({
	level: 'debug',
	transports: [
		new (winston.transports.Console)({
		timestamp: function() {
			return Date.now();
		},
		formatter: function(options) {
			return new Intl.DateTimeFormat('fr-FR', {
				year: 'numeric', month: '2-digit', day: '2-digit',
				hour: '2-digit', minute: '2-digit', second: '2-digit',
				hour24: true
			}).format(options.timestamp()) + ' ' +
				config.colorize(options.level, options.level.toUpperCase()) + ' ' +
				(options.message ? options.message : '') +
				(options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
			}
		})
	]
});

io.set('transports', ['polling', 'websocket' ]);

var Game = require("./entities/game"),
	Player = require("./entities/player");


// Broadcasting loop works better than sending an update every time a player moves because waiting for player movement messages adds
// another source of jitter.
var updateInterval = 100; // Broadcast updates every 100 ms.

var gameList = [],
	playerList = [],
	playersInGame = [];

// Serve up index.html.
app.use(express.static("client"));

var server_port = 	process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT 	|| 8080;
var server_ip_address = 	process.env.IP   || process.env.OPENSHIFT_NODEJS_IP 	|| '127.0.0.1';
//http.listen(server_port, null);
http.listen(server_port, null, function(){
	logger.debug("Listening on " + this._connectionKey);
});

//redirect client part
app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});

init();

function init() {
	logger.debug("Starting Server");
	
	// Begin listening for events.
	setEventHandlers();

	// Start game loop
    //setInterval(broadcastingLoop, updateInterval);
    
    logger.debug( "Server Initialized");
}

function setEventHandlers () {
	io.on("connection", function(client) {
		logger.debug( "New player has connected: " + client.id);
		var player = new Player(client.id, client) ;
		playerList.push(player);

		client.on("disconnect", onClientDisconnect);
		
		client.on("rename", onRename);

		client.on("get gamelist", onGameList);
		client.on("host game", onHostGame);
		client.on("join game", onJoinGame);

		client.on("get playerlist", onPlayerList);
		client.on("leave game", onLeaveGame);
		
		client.on("start game", onStartGame);
	});
}

function onRename(data) {
	logger.debug( "onRename");
	var currentPlayer = playerById(this.id);
	currentPlayer.setName(data);
}

var playerById = function (id) {
    for (var i = 0; i < playerList.length; i++) {
        if (playerList[i].id == id)
            return playerList[i];
    }
    return false;
}

function onPlayerList(data) {
	logger.debug( "onPlayerList");

	//find the game by his id
	var game = gameById(data.id);
	
	//if no game find
	if (!game) {
		logger.debug( "Game not found: "+ data.id);
		return;
	}

	this.emit("list players", game.getPlayers().map(function(player){
		return {
					"id": player.getId(),
					"name": player.getName()
				}
	}));
}

function onLeaveGame(data) {
	logger.debug( "onLeaveGame");

	//find the game by his id
	var game = gameById(data.id);
	
	//if no game find
	if (!game) {
		logger.debug( "Game not found: "+this.id);
		return;
	}
	
	if(this.id === data.id) {
		// force leave waiting game
		this.to(data.id).broadcast.emit("end game", game.id);
		
		//remove the hosted game from the list of games
		gameList.splice(gameList.indexOf(game), 1);
		this.broadcast.emit("list games", gameList.filter(checkWaitingGame).slice(0,4).map(function(game){
			return {"id": game.getId()}
		}));
	} else {
		// force refresh list player
		game.removePlayer(this.id);
		this.to(data.id).broadcast.emit("list players", game.getPlayers().map(function(player){
			return {
						"id": player.getId(),
						"name": player.getName()
					}
		}));
	}
	this.leave(data.id);
}

function onClientDisconnect () {
    logger.debug( "onClientDisconnect");
	logger.debug( "Player disconnected: " + this.id);
		
    //find the game by his id
	var gameId = playersInGame[this.id];
	var currentGame = gameById(gameId);
	
	//if no game find
	if (!currentGame) {
		logger.debug( "Game not found: "+ gameId);
		return;
	}

	// remove game associated to player
	playersInGame[this.id] = null;

	// TODO : if game is inprogress, force endgame with scoreboard 
	if (gameId === this.id || currentGame.getStatus() === 'INPROGRESS'){
		
		// force leave current game
		this.to(gameId).broadcast.emit("end game", currentGame.id);

		//remove the hosted game from the list of games
		gameList.splice(gameList.indexOf(currentGame), 1);
	
		//force refresh gamelist to others
		this.broadcast.emit("list games", gameList.filter(checkWaitingGame).slice(0,4).map(function(game){
			return {"id": game.getId()}
		}));

	} else {
		if (currentGame.getStatus() === 'WAITING'){
			currentGame.removePlayer(this.id);
			this.to(gameId).broadcast.emit("list players", currentGame.getPlayers().map(function(player){
				return {
							"id": player.getId(),
							"name": player.getName()
						}
			}));
		}
	}
}

var gameById = function (id) {
    for (var i = 0; i < gameList.length; i++) {
        if (gameList[i].id == id)
            return gameList[i];
    }
    return false;
}

function onGameList() {
	logger.debug( "onGameList");
	this.emit("list games", gameList.filter(checkWaitingGame).slice(0,4).map(function(game){
		return {"id": game.getId()}
	}));
}

function checkWaitingGame(game){
	return game.status == "WAITING";
}

function onHostGame(data) {
	logger.debug( "onHostGame");
	if(!gameAlreadyHostBy(this.id)){
		logger.debug( "host new game : " + this.id);
		var game = new Game(this.id);

		var currentPlayer = playerById(this.id);
		currentPlayer.setName(data.name);
		game.addPlayer(currentPlayer);

		playersInGame[this.id] = this.id;

		gameList.push(game);

		this.join(this.id);
		this.emit("game joined", {"id": game.getId()});
		this.broadcast.emit("list games", gameList.map(function(game){
			return {"id": game.getId()};
		}));
	} else {
		logger.debug( "game already host : " + this.id);
	}
}

function onJoinGame(data) {
	logger.debug( "onJoinGame : " + data.id);

    //find the game by his id
	var game = gameById(data.id);

	//if no game find
	if(!game){
		logger.debug( "Game not found: "+data.id);
		return;
	}

	// join a room to only communicate in
	this.join(data.id);

	//add player to game
	var currentPlayer = playerById(this.id);
	currentPlayer.setName(data.name);
	game.addPlayer(currentPlayer);
	
	playersInGame[this.id] = data.id;
	
	this.to(data.id).broadcast.emit("list players", game.getPlayers().map(function(player){
		return {
					"id": player.getId(),
					"name": player.getName()
				}
	}));
	this.emit("game joined", {"id": game.getId()});
}

function gameAlreadyHostBy(id){
	for (var i = 0; i < gameList.length; i++) {
		if(gameList[i].id === id){
			return true;
		}
	}
	return false;
}

function onStartGame() {
	logger.debug( "onStartGame");
    //find the game by his id
	var gameId = playersInGame[this.id];
	var currentGame = gameById(gameId);

	currentGame.start();
	this.to(gameId).broadcast.emit("start game");
}
