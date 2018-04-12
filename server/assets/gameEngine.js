var Card = require("../entities/game/card");
var GameDTO = require("../dto/gameDTO");
var config = require("./gameConfiguration.json");

//see https://en.wikipedia.org/wiki/French_playing_cards#Paris_pattern
var listRank = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
    this.playedCards = [];
    this.givenCards = new Map();
    this.gapCards = new Map();
    this.winningCard = new Map();

    this.startingPlayPlayer ;
    this.currentTurnPlayer ;
    this.firstCard = null;
    this.ppyou;
}

GameEngine.prototype = {

    //should contains the logic of the game
    start : function() {
        this.startingPlayPlayer = 0;
        this.currentTurnPlayer = 0;
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
                    that.refreshData('NONE');
                    setTimeout(function(){
                        that.clearHand();
                        that.refreshData('PLAY');
                    }, 3000);
                    that.playerReady=0;
                }
            });

            // wait the played card for the given player, verify it, and update the game (send DTO)
            player.socket.addListener("play card", function(data){
                console.log("EVENT : play card");
                if(that.isValidPlayedCard(this.id, data)){
                    var playedCard = that.givenCards.get(this.id).filter(card => {return card.id === data})[0];
                    if(that.firstCard === null) {
                        that.firstCard = playedCard;
                    }
                    // update table play
                    that.playedCards[that.playedCards.length-1].set(this.id, playedCard);
                    // remove card from player
                    that.givenCards.set(this.id, that.givenCards.get(this.id).filter(card => {return card.id != playedCard.id;}))
                    // refresh display
                    that.refreshData('NONE');
                    // if all cards are played, end play
                    if(that.playedCards.length === that.gameConfig.given.reduce(function(a,b){return a+b},0) && that.playedCards[that.playedCards.length-1].size === that.players.length) {
                        setTimeout(function(){
                            // define winner
                            var winner = that.defineWinner(that.playedCards[that.playedCards.length-1]);
                            // next played cards
                            that.playedCards[that.playedCards.length-1].forEach((element, key) => {
                                that.winningCard.get(winner).push(element);
                            });
                            // compute score
                            that.players.forEach(player => {
                                that.updateScoringGame(player.id, that.winningCard.get(player.id).map( card => {return card.value}).reduce(function(a,b){return a+b},0));
                            });
                            // display winning cards ?
                            // define next starting player
                            that.startingPlayPlayer = (that.startingPlayPlayer+1) % that.players.length;
                            // empty play table
                            that.playedCards = []
                            that.playedCards.push(new Map());
                            // empty starting card
                            that.firstCard = null;
                            // new distribution
                            that.initiateDeck();
                            that.randomizeDeck();
                            that.distributeGiven(that.players.length);
                            that.refreshData('GAP');
                        }, 3000);
                    // else if all players have played, end turn
                    } else if (that.playedCards[that.playedCards.length-1].size === that.players.length){
                        // wait a little
                        setTimeout(function(){
                            // define winner
                            var winner = that.defineWinner(that.playedCards[that.playedCards.length-1]);
                            // next player will be winner
                            that.currentTurnPlayer = that.players.findIndex(function(player){return player.id === winner});
                            // next played cards
                            that.playedCards[that.playedCards.length-1].forEach((element, key) => {
                                that.winningCard.get(winner).push(element);
                            });
                            // empty play table
                            that.playedCards.push(new Map());
                            // empty starting card
                            that.firstCard = null;
                            // refresh game
                            that.refreshData('PLAY');
                        }, 3000);
                    } else { 
                        // define next player
                        that.currentTurnPlayer = (that.currentTurnPlayer+1) % that.players.length;
                        // refresh game
                        that.refreshData('PLAY');
                    }
                } else {
                    that.refreshData('PLAY');
                }
            });
        })
    },

    defineWinner: function(tablePlay){
        var winner = null;
        var highestCard = that.firstCard;
        //that.firstCard (find first player)
        tablePlay.forEach((element, key) => {
            if (element === that.firstCard) 
                winner = key;
        });
        tablePlay.forEach((element, key) => {
            if (element.suit === highestCard.suit && element.rank > highestCard.rank){
                winner = key;
                highestCard = element;
            }
        });
        return winner;
    },

    isValidPlayedCard: function(playerId, cardId){
        var isValid;
        // the good player sent the card
        isValid = that.players[that.currentTurnPlayer].id === playerId ;
        // the card is in his hand
        var playedCard = that.givenCards.get(playerId).filter(card => {return card.id === cardId});
        isValid = isValid && playedCard.length === 1;
        // is first card played or the card play is of the same suit or the player has no card with the same suit
        isValid = isValid && (that.firstCard === null || that.firstCard.suit === playedCard[0].suit || !that.givenCards.get(playerId).some(card => {return card.suit === that.firstCard.suit}));
        return isValid;
    },


    clearHand: function(){
        that.players.forEach(function(player){
            that.givenCards.set(player.id, that.givenCards.get(player.id).map(function(card){
                card.selected=false;
                return card;
            }));
        });
    },

    dispatchGap: function(){
        that.players.forEach(function(player, index){
            // add gap to next player
            var currentGap=that.givenCards.get(player.id).filter(function(card){
                return that.gapCards.get(player.id).indexOf(card.id) >= 0;
            }).map(function(card){
                card.selected=true;
                return card;
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
        that.players.forEach(function(player, index) {
            player.socket.emit("refresh data", 
                new GameDTO(that.ScoringGame, that.playedCards[that.playedCards.length-1], that.givenCards.get(player.getId()), action === 'PLAY' && index === that.currentTurnPlayer || action !== "PLAY" ? action : "NONE", that.gameConfig.gap, that.ppyou));
        });
    },

    initiateGameScoring : function() {
        that = this;
        this.players.forEach(player => {
            that.ScoringGame.set(player.id, {id: player.id, name: player.name, score: 0});
            that.winningCard.set(player.id, []);
        });
        this.playedCards.push(new Map());
    },

    updateScoringGame: function(playerId, score) {
        var currentScore = this.ScoringGame.get(playerId);
        this.ScoringGame.set(playerId, {id: currentScore.id, name: currentScore.name, score: currentScore.score + score});
    },

    initiateDeck : function() {
        that.ppyou = listSuit[Math.floor(Math.random()*listSuit.length)];
        var that = this;
        var id = 0;
        listSuit.forEach(suit => {
            listRank.forEach(rank => {
                if ( !that.gameConfig.filtering || rank !== "1"){
                    var card = new Card(id++, rank, suit, rank===7&&suit===that.ppyou? 40:0);
                    this.deck.push(card);
                }
            });
        });

        for (var rank = 1; rank < 21; rank++) {
            var card = new Card(id++, rank, 'B', rank);
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
                this.deck = this.deck.slice(nbCard, this.deck.length);
            });
        });

    }
}

module.exports = GameEngine;