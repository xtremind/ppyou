var Card = require("../entities/game/card");
var GameDTO = require("../dto/gameDTO");
var config = require("./gameConfiguration.json");

//see https://en.wikipedia.org/wiki/French_playing_cards#Paris_pattern
var listRank = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var listSuit = ['S', 'H', 'C', 'D'];

var TIMEOUT_WAITING_TIME_END_TURN = 3000;
var TIMEOUT_WAITING_TIME_BOT_END_PLAY = 500;

var GameEngine = function (id, players, logger) {
  this.id = id;
  this.players = players;
  this.logger = logger;

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

  this.startingPlayPlayer;
  this.currentTurnPlayer;
  this.firstCard = null;
  this.ppyou;
}

GameEngine.prototype = {

  //should contains the logic of the game
  start: function () {
    this.startingPlayPlayer = 0;
    this.currentTurnPlayer = 0;
    this.initiateGameScoring();
    this.loadGameConfiguratiton(this.players.length)
    this.initiateDeck();
    this.randomizeDeck();
    this.distributeGiven(this.players.length);
    this.startGame();
  },

  loadGameConfiguratiton: function (nbplayer) {
    this.logger.debug("loadGameConfiguratiton");
    this.gameConfig = config.gameConfiguration.find(function (element) { return element.nbplayer === nbplayer });
  },

  startGame: function () {
    this.logger.debug("startGame");
    const stateScope = this;
    this.players.forEach(function (player) {

      if(player.type === "bot") {
        stateScope.playerReady++;
        return;
      }

      // when all players ready, start a play by distribute the given 
      player.socket.addListener("ready to play", function () {
        stateScope.logger.debug("EVENT : ready to play");
        stateScope.playerReady++;
        if (stateScope.playerReady == stateScope.players.length) {
          // action : send the given and wait for the gap
          stateScope.playerReady = 0;
          stateScope.refreshData.call(stateScope, 'GAP');
        }
      });

      // wait the gap of players, verify it, then distribute it (send DTO)
      player.socket.addListener("gap", function (data) {
        stateScope.logger.debug("EVENT : gap");
        //verify the gap
        if (stateScope.isValidGap.call(stateScope, this.id, data)) {
          stateScope.takeIntoAccountGap(stateScope, this.id, data);
        } else {
          stateScope.logger.error("Gap Error");
          //TODO tell the player to redo his choices
        }
      });

      // wait the played card for the given player, verify it, and update the game (send DTO)
      player.socket.addListener("play card", function (data) {
        stateScope.logger.debug("EVENT : play card");
        if (stateScope.isValidPlayedCard.call(stateScope, this.id, data)) {
          stateScope.takeIntoAccountPlayCard(stateScope, this.id, data);
        } else {
          stateScope.refreshData.call(stateScope, 'PLAY');
        }
      });
    })
  },

  takeIntoAccountGap: function(stateScope, playerId, data){
    stateScope.logger.debug("takeIntoAccountGap");
    stateScope.playerReady++;
    stateScope.logger.debug("takeIntoAccountGap - playerReady : " + stateScope.playerReady + "/" + stateScope.players.length);
    stateScope.gapCards.set(playerId, data);
    // when all gap defined, start a turn by designate the first player
    if (stateScope.playerReady == stateScope.players.length) {
      stateScope.logger.debug("takeIntoAccountGap - ready");
      //dispatch the gap
      stateScope.dispatchGap.call(stateScope);
      //sent new hand to players
      stateScope.refreshData.call(stateScope, 'NONE');
      setTimeout(function () {
        stateScope.clearHand.call(stateScope);
        stateScope.playerReady = 0;
        stateScope.refreshData.call(stateScope, 'PLAY');
      }, 3000);
    }
  },

  takeIntoAccountPlayCard: function(stateScope, playerId, data){
    stateScope.logger.debug("takeIntoAccountPlayCard");
    var playedCard = stateScope.givenCards.get(playerId).filter(function (card) { return card.id === data })[0];
    if (stateScope.firstCard === null) {
      stateScope.firstCard = playedCard;
    }
    // update table play
    stateScope.playedCards[stateScope.playedCards.length - 1].set(playerId, playedCard);
    // remove card from player
    stateScope.givenCards.set(playerId, stateScope.givenCards.get(playerId).filter(function (card) { return card.id != playedCard.id; }));
    // if all cards are played, end play
    if (stateScope.playedCards.length === stateScope.gameConfig.given.reduce(function (a, b) { return a + b }, 0) && stateScope.playedCards[stateScope.playedCards.length - 1].size === stateScope.players.length) {
      stateScope.logger.debug("takeIntoAccountPlayCard - end play");
      // refresh display
      stateScope.logger.debug("takeIntoAccountPlayCard - refresh display");
      stateScope.refreshData.call(stateScope, 'NONE');
      // define winner
      var winner = stateScope.defineWinner.call(stateScope, stateScope.playedCards[stateScope.playedCards.length - 1]);
      // next played cards
      stateScope.playedCards[stateScope.playedCards.length - 1].forEach(function (element) {
        stateScope.winningCard.get(winner).push(element);
      });
      // compute score
      stateScope.players.forEach(function (player) {
        stateScope.updateScoringGame.call(stateScope, player.id, stateScope.winningCard.get(player.id).map(function (card) { return card.value }).reduce(function (a, b) { return a + b }, 0));
      });
      // define next starting player
      stateScope.startingPlayPlayer = (stateScope.startingPlayPlayer + 1) % stateScope.players.length;
      // empty play table
      stateScope.playedCards = []
      stateScope.playedCards.push(new Map());
      // empty starting card
      stateScope.firstCard = null;
      // new distribution
      stateScope.players.forEach(function (player) {
        stateScope.winningCard.set(player.id, []);
      });
      stateScope.initiateDeck.call(stateScope);
      stateScope.randomizeDeck.call(stateScope);
      stateScope.distributeGiven.call(stateScope, stateScope.players.length);
      setTimeout(function () {
        stateScope.refreshData.call(stateScope, 'GAP');
      }, TIMEOUT_WAITING_TIME_END_TURN);
      // else if all players have played, end turn
    } else if (stateScope.playedCards[stateScope.playedCards.length - 1].size === stateScope.players.length) {
      stateScope.logger.debug("takeIntoAccountPlayCard - end turn");
      // refresh display
      stateScope.logger.debug("takeIntoAccountPlayCard - refresh display");
      stateScope.refreshData.call(stateScope, 'NONE');
      // define winner
      var winner = stateScope.defineWinner.call(stateScope, stateScope.playedCards[stateScope.playedCards.length - 1]);
      // next player will be winner
      stateScope.currentTurnPlayer = stateScope.players.findIndex(function (player) { return player.id === winner });
      // next played cards
      stateScope.playedCards[stateScope.playedCards.length - 1].forEach(function (element) {
        stateScope.winningCard.get(winner).push(element);
      });
      // empty play table
      stateScope.playedCards.push(new Map());
      // empty starting card
      stateScope.firstCard = null;
      // wait a little
      setTimeout(function () {
        // refresh game
        stateScope.refreshData.call(stateScope, 'PLAY');
      }, TIMEOUT_WAITING_TIME_END_TURN);
    } else {
      stateScope.logger.debug("takeIntoAccountPlayCard - end player");
      // define next player
      stateScope.currentTurnPlayer = (stateScope.currentTurnPlayer + 1) % stateScope.players.length;
      // refresh game
      stateScope.refreshData.call(stateScope, 'PLAY');
    }
  },

  defineWinner: function (tablePlay) {
    this.logger.debug("defineWinner");
    const stateScope = this;
    var winner = null;
    //stateScope.logger.debug("defineWinner " + stateScope.firstCard);
    var highestCard = stateScope.firstCard;
    //stateScope.logger.debug("defineWinner " + highestCard);
    tablePlay.forEach(function (element, key) {
      //stateScope.logger.debug("defineWinner " + element + "/" + key);
      if (element === stateScope.firstCard){
        winner = key;
        //stateScope.logger.debug("defineWinner " + winner);
      }
    });
    tablePlay.forEach(function (element, key) {
      if (element.suit === highestCard.suit && element.rank > highestCard.rank) {
        winner = key;
        highestCard = element;
      }
    });
    stateScope.logger.debug("defineWinner " + winner);
    return winner;
  },

  isValidPlayedCard: function (playerId, cardId) {
    this.logger.debug("isValidPlayedCard");
    const stateScope = this;
    var isValid;
    // the good player sent the card
    isValid = stateScope.players[stateScope.currentTurnPlayer].id === playerId;
    // the card is in his hand
    var playedCard = stateScope.givenCards.get(playerId).filter(function (card) { return card.id === cardId });
    isValid = isValid && playedCard.length === 1;
    // is first card played or the card play is of the same suit or the player has no card with the same suit
    isValid = isValid && (stateScope.firstCard === null || stateScope.firstCard.suit === playedCard[0].suit || !stateScope.givenCards.get(playerId).some(function (card) { return card.suit === stateScope.firstCard.suit }));
    return isValid;
  },

  clearHand: function () {
    this.logger.debug("clearHand");
    const stateScope = this;
    stateScope.players.forEach(function (player) {
      stateScope.givenCards.set(player.id, stateScope.givenCards.get(player.id).map(function (card) {
        card.selected = false;
        return card;
      }));
    });
  },

  dispatchGap: function () {
    this.logger.debug("dispatchGap");
    const stateScope = this;
    stateScope.players.forEach(function (player, index) {
      // add gap to next player
      var currentGap = stateScope.givenCards.get(player.id).filter(function (card) {
        return stateScope.gapCards.get(player.id).indexOf(card.id) >= 0;
      }).map(function (card) {
        card.selected = true;
        return card;
      });
      var nextPlayer = stateScope.players[(index + 1) % stateScope.players.length]
      var nextPlayerHand = stateScope.givenCards.get(nextPlayer.id).concat(currentGap);
      nextPlayerHand.sort(function (a, b) {
        return a.id - b.id;
      })
      stateScope.givenCards.set(nextPlayer.id, nextPlayerHand);
      // refresh current player hand
      var currentPlayerHand = stateScope.givenCards.get(player.id).filter(function (card) {
        return stateScope.gapCards.get(player.id).indexOf(card.id) < 0;
      });
      stateScope.givenCards.set(player.id, currentPlayerHand);
      if(player.type === "bot")
        player.setGiven(currentPlayerHand);
    });
  },

  isValidGap: function (playerId, cards) {
    this.logger.debug("isValidGap");
    const stateScope = this;
    return cards.every(function (r) {
      return stateScope.givenCards.get(playerId).map(function (card) { return card.id; }).indexOf(r) >= 0
    });
  },

  refreshData: function (action) {
    this.logger.debug("refreshData - " + this.currentTurnPlayer);
    const stateScope = this;
    stateScope.players.forEach(function (player, index) {
      if(player.type === "bot") {
        //ask not to play
        stateScope.logger.debug("refreshData : bot");
        if(action === "GAP"){
          stateScope.logger.debug("refreshData : bot - choose the gap");
          stateScope.takeIntoAccountGap(stateScope, player.getId(), player.getGap(stateScope.gameConfig.gap))
        } else if(action === "PLAY" && index === stateScope.currentTurnPlayer){
          setTimeout(function () {
            stateScope.logger.debug("refreshData : bot - play a card");
            stateScope.takeIntoAccountPlayCard(stateScope, player.getId(), player.getCardToPlay(stateScope.firstCard, stateScope.playedCards[stateScope.playedCards.length - 1]));
            player.setGiven(stateScope.givenCards.get(player.getId()));
          }, TIMEOUT_WAITING_TIME_BOT_END_PLAY);
        } else {
          stateScope.logger.debug("refreshData : bot - nothing to do");
        }
        return;
      } else {
        // send DTO to refresh front
        player.socket.emit("refresh data",
          new GameDTO(stateScope.ScoringGame, stateScope.playedCards[stateScope.playedCards.length - 1], stateScope.givenCards.get(player.getId()), action === 'PLAY' && index === stateScope.currentTurnPlayer || action !== "PLAY" ? action : "NONE", stateScope.gameConfig.gap, stateScope.ppyou, stateScope.currentTurnPlayer));
      }
    });
  },

  initiateGameScoring: function () {
    this.logger.debug("initiateGameScoring");

    for (let player of this.players) {
      this.ScoringGame.set(player.id, { id: player.id, name: player.name, score: 0 });
      this.winningCard.set(player.id, []);
    }
    this.playedCards.push(new Map());
  },

  updateScoringGame: function (playerId, score) {
    this.logger.debug("updateScoringGame");
    var currentScore = this.ScoringGame.get(playerId);
    this.ScoringGame.set(playerId, { id: currentScore.id, name: currentScore.name, score: currentScore.score + score });
  },

  initiateDeck: function () {
    this.logger.debug("initiateDeck");
    this.ppyou = listSuit[Math.floor(Math.random() * listSuit.length)];
    var id = 0;
    for (let suit of listSuit) {
      for (let rank of listRank) {
        if (!this.gameConfig.filtering || rank !== "1") {
          var card = new Card(id++, rank, suit, rank === 7 && suit === this.ppyou ? 40 : 0);
          this.deck.push(card);
        }
      }
    }

    for (var rank = 1; rank < 21; rank++) {
      var card = new Card(id++, rank, 'B', rank);
      this.deck.push(card);
    }
  },

  randomizeDeck: function () {
    this.logger.debug("randomizeDeck");
    this.deck.sort(function () { return 0.5 - Math.random() });
  },

  distributeGiven: function () {
    this.logger.debug("distributeGiven");
    for (let nbCard of this.gameConfig.given) {
      for (let player of this.players) {
        var hand = this.givenCards.get(player.id)
        if (typeof hand === "undefined") {
          hand = [];
        }
        hand = hand.concat(this.deck.slice(0, nbCard));
        hand.sort(function (a, b) {
          return a.id - b.id;
        });
        this.givenCards.set(player.id, hand);
        this.deck = this.deck.slice(nbCard, this.deck.length);
        if(player.type === "bot") {
          player.setGiven(this.givenCards.get(player.getId()));
        }
      }
    }
  }
}

module.exports = GameEngine;