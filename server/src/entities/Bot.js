var GapStrategy = require('./strategies/GapStrategy');
var PlayCardStrategy  = require( './strategies/PlayCardStrategy');

class Bot {
    // TODO : depending of the level, choose a method to compute gap
    // FIXME : rework regarding import/require module
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
        console.log("!BOT_"+this.id+"!getGap " + nbCardsForGap);
        console.log("!BOT_"+this.id+"!getGap " + GapStrategy);
        console.log("!BOT_"+this.id+"!getGap " + Object.keys(GapStrategy));
        console.log("!BOT_"+this.id+"!getGap " + GapStrategy.default);
        return GapStrategy.default.get(this.given, nbCardsForGap);
    }
    getCardToPlay(firstCard, currentPlay){
        console.log("!BOT_"+this.id+"!getCardToPlay");
        return PlayCardStrategy.default.get(this.given, firstCard, currentPlay);
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