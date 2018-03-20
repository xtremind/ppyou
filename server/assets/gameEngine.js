var Card = require("../entities/game/card");
var GameDTO = require("../dto/gameDTO");

//see https://en.wikipedia.org/wiki/French_playing_cards#Paris_pattern
var listRank = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
var listSuit = ['S', 'H', 'D', 'C'];

var GameEngine = function(socket, id, players) {
    this.socket = socket;
    this.id = id;
    this.players = players;
    this.deck = [];

    //
    this.playerReady = 0;

    // a game is finish after 10 play ? after a cap is over ?
    this.ScoringGame = new Map();
    // a play is finish when all cards are played
    this.play = new Map();
    this.startingPlayPlayer ;
    // a turn is finish when all players have played one card
    this.playTurn = new Map();
    this.currenturnPlayer ;
}

GameEngine.prototype = {
    //should contains the logic of the game
    start : function() {
        this.initiateGameScoring();
        this.initiateDeck(this.players.length);
        this.randomizeDeck();
        this.startGame();
    },  

    startGame : function() {
        var that = this;

        //TODO utiliser le soket présent dans l'objet player, car ici, on ne réceptionne que les messages de l'admin
        this.socket.addListener("test", function() {console.log("test")});
        // when all players ready, start a play by distribute the given 
        this.socket.addListener("ready to play", function() {
            console.log("ready to play");
            that.playerReady++;
            if (that.playerReady == that.players.length ) {
                // action : send the given and wait for the gap
                //
                that.refreshGame();
            }
        });
        // wait the gap of players, verify it, then distribute it (send DTO)
        // when all gap defined, start a turn by designate the first player
        // wait the played card for the given player, verify it, and update the game (send DTO) 
        // if all cards are played, end play
        // else if all players have played, end turn
    },

    refreshGame : function() {
        // send DTO to refresh front
		this.to(this.id).broadcast.emit("refresh game", this.computeDTO());
    },

    computeDTO : function() {
        return new gameDTO();
    },

    initiateGameScoring : function() {
        this.players.forEach(player => {
            this.ScoringGame.set(player.id, 0);
        });
    },

    updateScoringGame: function(playerId, score) {
        this.ScoringGame.set(playerId, this.ScoringGame.get(playerId) + score);
    },

    initiateDeck : function(nbPlayer) {
        var id = 0;
        listSuit.forEach(suit => {
            listRank.forEach(rank => {
                var card = new Card(id++, rank, suit);
                if ((nbPlayer < 8 || rank != "2") && (nbPlayer < 7 || rank != "1")){
                    this.deck.push(card);
                }
            });
        });

        for (rank = 1; rank < 21; rank++) {
            var card = new Card(id++, ''+rank, 'B', rank);
            this.deck.push(card);
        }
    },

    randomizeDeck : function(){
        this.deck.sort(function() { return 0.5 - Math.random() });
    }
}

module.exports = GameEngine;