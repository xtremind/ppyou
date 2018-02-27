var Card = function(rank, suit, value){
    this.rank = rank;
    this.suit = suit;
    this.value = value ? value : 0;
}

Card.prototype = {


}

module.exports = Card;