var Card = require("../entities/game/card");

//see https://en.wikipedia.org/wiki/French_playing_cards#Paris_pattern
var listRank = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
var listSuit = ['S', 'H', 'D', 'C'];

var GameEngine = function(socket, players) {
    this.socket = socket;
    this.players = players;
    this.deck = [];

    // a game is finish after 10 play ? after a cap is over ?
    this.ScoringGame = new Map();
    // a play is finish when all cards are played
    this.play = {};
    this.startingPlayPlayer ;
    // a turn is finish when all players have played one card
    this.playTurn = {};
    this.startingTurnPlayer ;
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
        // this.socket.addListener("test", function() {console.log("test")});
        // start a play by distribute the given 
        // get the gap (verify the gap, then distribute)
        // start a turn by designate the first player
        // get the played card (verify card, send played card, manage end turn and end play)
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
        listSuit.forEach(suit => {
            listRank.forEach(rank => {
                var card = new Card(rank, suit);
                if ((nbPlayer < 8 || rank != "2") && (nbPlayer < 7 || rank != "1")){
                    this.deck.push(card);
                }
            });
        });

        for (rank = 1; rank < 21; rank++) {
            var card = new Card(''+rank, 'B', rank);
            this.deck.push(card);
        }
    },

    randomizeDeck : function(){
        this.deck.sort(function() { return 0.5 - Math.random() });
    }
}

module.exports = GameEngine;