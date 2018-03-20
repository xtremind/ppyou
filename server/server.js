var express = require("express"),
    app = express(),
    http = require("http").Server(app),
    io = require("socket.io").listen(http);


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
http.listen(process.env.PORT || 8000);

//redirect client part
app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});

init();

function init() {
	console.log("Starting Server");
	
	// Begin listening for events.
	setEventHandlers();

	// Start game loop
    setInterval(broadcastingLoop, updateInterval);
    
    console.log("Server Initialized");
}

function setEventHandlers () {
	io.on("connection", function(client) {
		console.log("New player has connected: " + client.id);
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
	console.log("onRename");
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
	console.log("onPlayerList");

	//find the game by his id
	var game = gameById(data.id);
	
	//if no game find
	if (!game) {
		console.log("Game not found: "+ data.id);
		return;
	}

	this.emit("list players", game.getPlayers());
}

function onLeaveGame(data) {
	console.log("onLeaveGame");

	//find the game by his id
	var game = gameById(data.id);
	
	//if no game find
	if (!game) {
		console.log("Game not found: "+this.id);
		return;
	}
	
	if(this.id === data.id) {
		// force leave waiting game
		this.to(data.id).broadcast.emit("end game", game.id);
		
		//remove the hosted game from the list of games
		gameList.splice(gameList.indexOf(game), 1);
		this.broadcast.emit("list games", gameList.filter(checkWaitingGame).slice(0,4));
	} else {
		// force refresh list player
		game.removePlayer(this.id);
		this.to(data.id).broadcast.emit("list players", game.getPlayers());
	}
	this.leave(data.id);
}

function onClientDisconnect () {
    console.log("onClientDisconnect");
	console.log("\tPlayer disconnected: " + this.id);
		
    //find the game by his id
	var gameId = playersInGame[this.id];
	var currentGame = gameById(gameId);
	
	//if no game find
	if (!currentGame) {
		console.log("Game not found: "+ gameId);
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
		this.broadcast.emit("list games", gameList.filter(checkWaitingGame).slice(0,4));

	} else {
		if (currentGame.getStatus() === 'WAITING'){
			currentGame.removePlayer(this.id);
			this.to(gameId).broadcast.emit("list players", currentGame.getPlayers());
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
	console.log("onGameList");
	this.emit("list games", gameList.filter(checkWaitingGame).slice(0,4));
}

function checkWaitingGame(game){
	return game.status == "WAITING";
}

function onHostGame(data) {
	console.log("onHostGame");
	if(!gameAlreadyHostBy(this.id)){
		console.log("host new game : " + this.id);
		var game = new Game(this.id);

		var currentPlayer = playerById(this.id);
		currentPlayer.setName(data.name);
		game.addPlayer(currentPlayer);

		playersInGame[this.id] = this.id;

		gameList.push(game);

		this.join(this.id);
		this.emit("game joined", game);
		this.broadcast.emit("list games", gameList);
	} else {
		console.log("game already host : " + this.id);
	}
}

function onJoinGame(data) {
	console.log("onJoinGame : " + data.id);

    //find the game by his id
	var game = gameById(data.id);

	//if no game find
	if(!game){
		console.log("Game not found: "+data.id);
		return;
	}

	// join a room to only communicate in
	this.join(data.id);

	//add player to game
	var currentPlayer = playerById(this.id);
	currentPlayer.setName(data.name);
	game.addPlayer(currentPlayer);
	
	playersInGame[this.id] = data.id;
	
	this.to(data.id).broadcast.emit("list players", game.getPlayers());
	this.emit("game joined", game);
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
	console.log("onStartGame");
    //find the game by his id
	var gameId = playersInGame[this.id];
	var currentGame = gameById(gameId);

	currentGame.start(this);
	this.to(gameId).broadcast.emit("start game");
}

function broadcastingLoop() {
    //console.log("broadcastingLoop");
}