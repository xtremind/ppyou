var Card = function (id, rank, suit, value) {
  this.id = id;
  this.rank = rank;
  this.suit = suit;
  this.value = value ? value : 0;
  this.selected = false;
}

Card.prototype = {

}

module.exports = Card;