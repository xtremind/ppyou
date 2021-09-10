const Utils = require('./Utils')();
 
//Public functions
module.exports =  function (){

    //Scenario
    const random = function(given, firstCard){ 
        let chooseCardId = given[Math.floor(Math.random()*given.length)].id;
        if(firstCard !== null){
            const sameSuitCard =  given.filter((card) => card.suit === firstCard.suit);
            if(sameSuitCard.length != 0){
                // return random card with the same suit
                chooseCardId = sameSuitCard[Math.floor(Math.random()*sameSuitCard.length)].id;
            }
        }
        return chooseCardId;
    }
    
    const first = function(given, firstCard){
        let chooseCardId = given[0].id;
        if(firstCard !== null){
            const sameSuitCard =  given.filter((card) => card.suit === firstCard.suit);
            if(sameSuitCard.length != 0){
                // return the first card with the same suit
                chooseCardId = sameSuitCard[0].id;
            }
        }
        return chooseCardId;
    }
    
    //Properties to Weighted the call of each strategy
    const functionList = [random, first];
    const weigthList = [0.5, 0.5];

    return {
        get: (given, firstCard, currentPlay) => Utils.getRandomItem(functionList, weigthList)(given, firstCard, currentPlay)  
    }
}