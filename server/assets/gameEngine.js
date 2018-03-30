var Card = require("../entities/game/card");
var GameDTO = require("../dto/gameDTO");
var config = require("./gameConfiguration.json");

//see https://en.wikipedia.org/wiki/French_playing_cards#Paris_pattern
var listRank = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
var listSuit = ['S', 'H', 'C', 'D'];

var GameEngine = function(id, players) {
    this.id = id;
    this.players = players;
    this.deck = [];
    this.gameConfig;

    //
    this.playerReady = 0;

    // a game is finish after 10 play ? after a cap is over ?
    this.ScoringGame = new Map();
    // a play is finish when all cards are played
    this.playedCards = new Map();
    this.givenCards = new Map();

    this.startingPlayPlayer ;
    this.currenturnPlayer ;
}

GameEngine.prototype = {

    //should contains the logic of the game
    start : function() {
        this.initiateGameScoring();
        this.loadGameConfiguratiton(this.players.length)
        this.initiateDeck();
        this.randomizeDeck();
        this.distributeGiven(this.players.length);
        this.startGame();
    },  

    loadGameConfiguratiton : function(nbplayer) {
        this.gameConfig = config.gameConfiguration.find(function(element){return element.nbplayer === nbplayer});
    },

    startGame : function() {
        that = this;
        this.players.forEach(function(player) {
            //TODO utiliser le soket présent dans l'objet player, car ici, on ne réceptionne que les messages de l'admin
            player.socket.addListener("test", function() {
                console.log("test")
            });
            // when all players ready, start a play by distribute the given 
            player.socket.addListener("ready to play", function() {
                console.log("ready to play");
                that.playerReady++;
                if (that.playerReady == that.players.length ) {
                    // action : send the given and wait for the gap
                    that.refreshData();
                }
            });
        })
        // wait the gap of players, verify it, then distribute it (send DTO)
        // when all gap defined, start a turn by designate the first player
        // wait the played card for the given player, verify it, and update the game (send DTO) 
        // if all cards are played, end play
        // else if all players have played, end turn
    },

    refreshData : function() {
        that = this;
        console.log("refreshData");
        // send DTO to refresh front
        that.players.forEach(function(player) {
            player.socket.emit("refresh data", 
                new GameDTO(that.ScoringGame.get(player.getId()), that.playedCards, that.givenCards.get(player.getId()),'NONE'));
        });
    },

    initiateGameScoring : function() {
        that = this;
        this.players.forEach(player => {
            that.ScoringGame.set(player.id, 0);
        });
    },

    updateScoringGame: function(playerId, score) {
        this.ScoringGame.set(playerId, this.ScoringGame.get(playerId) + score);
    },

    initiateDeck : function() {
        var that = this;
        var id = 0;
        listSuit.forEach(suit => {
            listRank.forEach(rank => {
                if ( !that.gameConfig.filtering || rank !== "1"){
                    var card = new Card(id++, rank, suit);
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
    },

    distributeGiven : function(){
        this.gameConfig.given.forEach(nbCard => {
            this.players.forEach(player => {
                var hand = this.givenCards.get(player.id)
                if (typeof hand === "undefined") {
                    hand = [];
                }
                hand = hand.concat(this.deck.slice(0, nbCard));
                hand.sort(function(a, b){
                    return a.id - b.id;
                });
                this.givenCards.set(player.id, hand);
                this.deck = this.deck.slice(nbCard, this.deck.lengh);
            });
        });

    }
}

module.exports = GameEngine;