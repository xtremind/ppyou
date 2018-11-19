var Game = require("../entities/game"),
    Player = require("../entities/player"),
    Bot = require("../entities/Bot"),
    GameEngine = require("../assets/gameEngine");


// Broadcasting loop works better than sending an update every time a player moves because waiting for player movement messages adds
// another source of jitter.
//var updateInterval = 100; // Broadcast updates every 100 ms.

var MainEngine = function(logger, io) {
    this.gameList = [];
    this.playerList = [];
    this.playersInGame = [];

    this.logger = logger;
    this.io = io;
}

MainEngine.prototype = {

    start: function() {
        this.logger.debug("Starting Server");

        // Begin listening for events.
        this.setEventHandlers();

        // Start game loop
        //setInterval(broadcastingLoop, updateInterval);

        this.logger.debug("Server Initialized");
    },

    setEventHandlers: function() {
        const stateScope = this;
        this.io.on("connection", function (client) {
            stateScope.logger.debug("New player has connected: " + client.id);
            var player = new Player(client.id, client);
            stateScope.playerList.push(player);

            client.on("disconnect", stateScope.onClientDisconnect.bind(stateScope, client));

            client.on("rename", stateScope.onRename.bind(stateScope, client));

            client.on("get gamelist", stateScope.onGameList.bind(stateScope));
            client.on("host game", stateScope.onHostGame.bind(stateScope, client));
            client.on("join game", stateScope.onJoinGame.bind(stateScope, client));

            client.on("get playerlist", stateScope.onPlayerList.bind(stateScope, client));
            client.on("leave game", stateScope.onLeaveGame.bind(stateScope, client));

            client.on("start game", stateScope.onStartGame.bind(stateScope, client));

            //TODO add functions to add/remove bot
            client.on("add bot", stateScope.onAddBot.bind(stateScope, client));
            client.on("remove bot", stateScope.onRemoveBot.bind(stateScope, client));
        });
    },

    onRename: function(client, data) {
        this.logger.debug("onRename");
        var currentPlayer = this.playerById(client.id);
        currentPlayer.setName(data);
    },

    playerById :function (id) {
        for (var i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].id == id)
                return this.playerList[i];
        }
        return false;
    },

    onPlayerList: function(client, data) {
        this.logger.debug("onPlayerList");

        //find the game by his id
        var game = this.gameById(data.id);

        //if no game find
        if (!game) {
            this.logger.debug("Game not found: " + data.id);
            return;
        }

        client.emit("list players", game.getPlayers().map(function (player) { return player.getDTO(); }));
    },

    onLeaveGame: function(client, data) {
        this.logger.debug("onLeaveGame");

        //find the game by his id
        var game = this.gameById(data.id);

        //if no game find
        if (!game) {
            this.logger.debug("Game not found: " + data.id);
            return;
        }

        if (client.id === data.id) {
            // force leave waiting game
            client.to(data.id).broadcast.emit("end game", game.id);

            //remove the hosted game from the list of games
            this.gameList.splice(this.gameList.indexOf(game), 1);
            client.broadcast.emit("list games", this.gameList.filter(this.checkWaitingGame).slice(0, 4).map(function (game) {
                return { "id": game.getId() }
            }));
        } else {
            // force refresh list player
            game.removePlayer(this.id);
            client.to(data.id).broadcast.emit("list players", game.getPlayers().map(function (player) { return player.getDTO(); }));
        }
        client.leave(data.id);
    },

    onClientDisconnect: function(client) {
        this.logger.debug("onClientDisconnect");
        this.logger.debug("Player disconnected: " + client.id);

        //find the game by his id
        var gameId = this.playersInGame[client.id];
        var currentGame = this.gameById(gameId);

        //if no game find
        if (!currentGame) {
            this.logger.debug("Game not found: " + gameId);
            return;
        }

        // remove game associated to player
        this.playersInGame[client.id] = null;

        // TODO : if game is inprogress, force endgame with scoreboard 
        if (gameId === client.id || currentGame.getStatus() === 'INPROGRESS') {

            // force leave current game
            client.to(gameId).broadcast.emit("end game", currentGame.id);

            //remove the hosted game from the list of games
            this.gameList.splice(this.gameList.indexOf(currentGame), 1);

            //force refresh gamelist to others
            client.broadcast.emit("list games", this.gameList.filter(this.checkWaitingGame).slice(0, 4).map(function (game) {
                return { "id": game.getId() }
            }));

        } else {
            if (currentGame.getStatus() === 'WAITING') {
                currentGame.removePlayer(client.id);
                client.to(gameId).broadcast.emit("list players", currentGame.getPlayers().map(function (player) { return player.getDTO(); }));
            }
        }
    },

    gameById :function (id) {
        for (var i = 0; i < this.gameList.length; i++) {
            if (this.gameList[i].id == id)
                return this.gameList[i];
        }
        return false;
    },

    onGameList: function() {
        this.logger.debug("onGameList");
        this.io.emit("list games", this.gameList.filter(this.checkWaitingGame).slice(0, 4).map(function (game) {
            return { "id": game.getId() }
        }));
    },

    checkWaitingGame: function(game) {
        return game.status == "WAITING";
    },

    onHostGame: function(client, data) {
        this.logger.debug("onHostGame");
        if (!this.gameAlreadyHostBy(client.id)) {
            this.logger.debug("host new game : " + client.id);
            var game = new Game(client.id);

            var currentPlayer = this.playerById(client.id);
            currentPlayer.setName(data.name);
            game.addPlayer(currentPlayer);

            this.playersInGame[client.id] = client.id;

            this.gameList.push(game);

            client.emit("game joined", { "id": game.getId() });
            client.join(client.id);
            client.broadcast.emit("list games", this.gameList.map(function (game) {
                return { "id": game.getId() };
            }));
        } else {
            this.logger.debug("game already host : " + client.id);
        }
    },

    onJoinGame: function(client, data) {
        this.logger.debug("onJoinGame : " + data.id);

        //find the game by his id
        var game = this.gameById(data.id);

        //if no game find
        if (!game) {
            this.logger.debug("Game not found: " + data.id);
            return;
        }

        // join a room to only communicate in
        client.join(data.id);

        //add player to game
        var currentPlayer = this.playerById(client.id);
        currentPlayer.setName(data.name);
        game.addPlayer(currentPlayer);

        this.playersInGame[client.id] = client.id;

        client.to(data.id).broadcast.emit("list players", game.getPlayers().map(function (player) { return player.getDTO(); }));
        client.emit("game joined", { "id": game.getId() });
    },

    gameAlreadyHostBy: function(id) {
        for (var i = 0; i < this.gameList.length; i++) {
            if (this.gameList[i].id === id) {
                return true;
            }
        }
        return false;
    },

    onStartGame: function(client) {
        this.logger.debug("onStartGame");
        //find the game by his id
        var gameId = this.playersInGame[client.id];
        var currentGame = this.gameById(gameId);
        currentGame.start();

        var gameEngine = new GameEngine(currentGame.id, currentGame.players, this.logger);
        gameEngine.start();

        client.to(gameId).broadcast.emit("start game");
    },

    onAddBot: function(client, data) {
        this.logger.debug("onAddBot");
        //find the game by his id
        var gameId = this.playersInGame[client.id];
        var currentGame = this.gameById(gameId);

        //if no game find
        if (!currentGame) {
            this.logger.debug("Game not found: " + data.id);
            return;
        }

        //add bot to game
        var bot = new Bot(client.id + "_" + Date.now());
        currentGame.addPlayer(bot);
        
        client.to(gameId).broadcast.emit("list players", currentGame.getPlayers().map(function (player) { return player.getDTO(); }));
        client.emit("list players", currentGame.getPlayers().map(function (player) { return player.getDTO(); }));
    },

    onRemoveBot: function(client, data){
        this.logger.debug("onRemoveBot");
        //find the game by his id
        var gameId = this.playersInGame[client.id];
        var currentGame = this.gameById(gameId);
        //if no game find
         if (!currentGame) {
            this.logger.debug("Game not found: " + data.id);
            return;
        }

        // TODO : if game is inprogress, force endgame with scoreboard 
        /*if (gameId === client.id || currentGame.getStatus() === 'INPROGRESS') {

            // force leave current game
            client.to(gameId).broadcast.emit("end game", currentGame.id);

            //remove the hosted game from the list of games
            this.gameList.splice(this.gameList.indexOf(currentGame), 1);

            //force refresh gamelist to others
            client.broadcast.emit("list games", this.gameList.filter(this.checkWaitingGame).slice(0, 4).map(function (game) {
                return { "id": game.getId() }
            }));

        } else {*/
            if (currentGame.getStatus() === 'WAITING') {
                currentGame.removePlayer(data.id);
                client.to(gameId).broadcast.emit("list players", currentGame.getPlayers().map(function (player) { return player.getDTO(); }));
                client.emit("list players", currentGame.getPlayers().map(function (player) { return player.getDTO(); }));
            }
        /*}*/
    }

}
module.exports = MainEngine;

