class Bot  {
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
        //console.log("!BOT_"+this.id+"!given " + this.given.map(function (card) { return card.id }));
        // TODO : depending of the level, choose a method to compute gap
        return this.given.filter((card, index) => (index < nbCardsForGap)).map(function (card) { return card.id });
    }
    getCardToPlay(firstCard, currentPlay){
        //currentPlay should contain all the cards on the table in the current play, and the current suit
        console.log("!BOT_"+this.id+"!getCardToPlay " + firstCard + "/" + currentPlay);
        console.log("!BOT_"+this.id+"!given " + this.given.map(function (card) { return card.id }));
        //return an idCard from the given
        let chooseCardId;
        if(firstCard === null){
            // choose first card to play
            chooseCardId =  this.given[0].id;
        } else {
            // return a card with the same suit
            const sameSuitCard =  this.given.filter(card => card.suit === firstCard.suit);
            
            if(sameSuitCard.length != 0){
                chooseCardId = sameSuitCard[0].id;
            } else {
                chooseCardId =  this.given[0].id;
            }
        }
        //this.given = this.given.filter(card => card.id !== chooseCardId); //TODO remove, and update given from gameEngine
        console.log("!BOT_"+this.id+"!chooseCardId " + chooseCardId);
        return chooseCardId;
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