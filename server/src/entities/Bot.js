const GapStrategy = require('./strategies/GapStrategy')();
const PlayCardStrategy = require( './strategies/PlayCardStrategy')();

class Bot {
    // TODO : depending of the level, choose a method to compute gap
    constructor(id){
        this.id = id;
        this.name = 'bot_' + id.substring(id.length-6, id.length);
        this.type = "bot";
        this.given = [];
    }

    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }    
    setGiven(given){
        this.given = given;
    }
    getGap(nbCardsForGap){
        //console.log("!BOT_"+this.id+"!getGap " + nbCardsForGap)+"/"+GapStrategy.get(this.given, nbCardsForGap);
        return GapStrategy.get(this.given, nbCardsForGap);
    }
    getCardToPlay(firstCard, currentPlay){
        //console.log("takeIntoAccountPlayCard - played Cards " + this.given.map((card) => card.id).join(', '));
        //console.log("!BOT_"+this.id+"!getCardToPlay/"+PlayCardStrategy.get(this.given, firstCard, currentPlay));
        return PlayCardStrategy.get(this.given, firstCard, currentPlay);
    }
    getDTO() {
        return {
            "id": this.getId(),
            "name": this.getName(),
            "type": this.type
        }
    }
}

module.exports = Bot;