var GameDTO = function(scoringGame, playedCards, givenCards, action, gap){
  this.scoringGame = []; //last computed score
  this.playedCards = [];
  this.givenCards = givenCards;
  this.action = action;      //action for the player to do
  this.gap = gap


  scoringGame.forEach((element, key) => {
    this.scoringGame.push(element) //all played cards in play
  });

  playedCards.forEach((element, key) => {
    this.playedCards.push({id: key, card: element}) //all played cards in play
  });
}

GameDTO.prototype = {

}

module.exports = GameDTO;