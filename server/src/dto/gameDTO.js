var GameDTO = function (scoringGame, playedCards, givenCards, action, gap, ppyou, currentPlayer) {
  this.scoringGame = []; //last computed score
  this.playedCards = [];
  this.givenCards = givenCards;
  this.action = action;      //action for the player to do
  this.gap = gap;
  this.ppyou = ppyou;
  this.currentPlayer = currentPlayer;


  scoringGame.forEach(function (element) {
    this.scoringGame.push(element) //current score
  });

  playedCards.forEach(function (element, key) {
    this.playedCards.push({ id: key, card: element }) //all played cards in play
  }, this);
}

GameDTO.prototype = {

}

module.exports = GameDTO;