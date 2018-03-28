var GameDTO = function(scoringGame, playedCards, givenCards, action){
  this.scoringGame = scoringGame; //last computed score
  this.playedCards = [];
  this.givenCards = givenCards;
  this.action = action;      //action for the player to do

  playedCards.forEach((element, key) => {
    this.playedCards.push({key: element}) //all played cards in play
  });
}

GameDTO.prototype = {

}

module.exports = GameDTO;