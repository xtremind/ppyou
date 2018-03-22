var GameDTO = function(scoringGame, playedCards, givenCards, action){
  this.scoringGame = scoringGame; //last computed score
  this.playedCards = [];
  this.givenCards = [];
  this.action = action;      //action for the player to do

  playedCards.forEach((element, key) => {
    this.playedCards.push({key: element}) //all played cards in play
  });
  
  currentTurn.forEach((element, key) => {
    this.currentTurn.push({key: element}) //cards to display on board
  });

}

GameDTO.prototype = {

}

module.exports = GameDTO;