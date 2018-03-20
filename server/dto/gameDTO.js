var GameDTO = function(){
  this.scoringGame; //last computed score
  this.playedCards; //all played cards in play
  this.currentTurn; //cards to display on board
  this.action;      //action for the player to do
}

GameDTO.prototype = {

}

module.exports = GameDTO;