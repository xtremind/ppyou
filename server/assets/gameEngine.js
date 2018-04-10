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
    this.gapCards = new Map();

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
                console.log("EVENT : ready to play");
                that.playerReady++;
                if (that.playerReady == that.players.length ) {
                    // action : send the given and wait for the gap
                    that.refreshData('GAP');
                    that.playerReady=0;
                }
            });

            // wait the gap of players, verify it, then distribute it (send DTO)
            player.socket.addListener("gap", function(data){
                console.log("EVENT : gap");
                //verify the gap
                if(that.isValidGap(this.id, data)){
                    that.playerReady++;
                    that.gapCards.set(this.id, data);
                }
                // when all gap defined, start a turn by designate the first player
                if (that.playerReady == that.players.length ) {
                    //dispatch the gap
                    that.dispatchGap();
                    //sent new hand to players
                    that.refreshData('PLAY');
                    that.playerReady=0;
                }
            })
        })
        // wait the played card for the given player, verify it, and update the game (send DTO) 
        // if all cards are played, end play
        // else if all players have played, end turn
    },

    dispatchGap: function(){
        that.players.forEach(function(player, index){
            // add gap to next player
            var currentGap=that.givenCards.get(player.id).filter(function(card){
                return that.gapCards.get(player.id).indexOf(card.id) >= 0;
            });
            var nextPlayer = that.players[(index+1)%that.players.length]
            var nextPlayerHand=that.givenCards.get(nextPlayer.id).concat(currentGap);
            nextPlayerHand.sort(function(a, b){
                return a.id - b.id;
            })
            that.givenCards.set(nextPlayer.id, nextPlayerHand);
            // refresh current player hand
            var currentPlayerHand=that.givenCards.get(player.id).filter(function(card){
                return that.gapCards.get(player.id).indexOf(card.id) < 0;
            });
            that.givenCards.set(player.id, currentPlayerHand);
        });
    },

    isValidGap: function(playerId, cards){
        console.log("isValidGap");
        return cards.every(r=> that.givenCards.get(playerId).map(function(card){return card.id;}).indexOf(r) >= 0)
    },

    refreshData : function(action) {
        that = this;
        console.log("refreshData");
        // send DTO to refresh front
        that.players.forEach(function(player) {
            player.socket.emit("refresh data", 
                new GameDTO(that.ScoringGame, that.playedCards, that.givenCards.get(player.getId()),action, that.gameConfig.gap));
        });
    },

    initiateGameScoring : function() {
        that = this;
        this.players.forEach(player => {
            that.ScoringGame.set(player.id, {id: player.id, name: player.name, score: 0});
        });
    },

    updateScoringGame: function(playerId, score) {
        this.ScoringGame.set(playerId, this.ScoringGame.get(playerId).score + score);
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