import Utils from './Utils';

//Private functions
const random = function(given, nbCardsForGap){
    const shuffled = given.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, nbCardsForGap).map(function (card) { return card.id });
}

const first = function(given, nbCardsForGap){
    return given.filter((card, index) => (index < nbCardsForGap)).map(function (card) { return card.id });
}    

//Properties to Weighted the call of each strategy
const functionList = [random, first];
const weigthList = [0.8, 0.2];
 
//Public functions
export default {
    get: function(given, nbCardsForGap){
        return Utils.getRandomItem(functionList, weigthList)(given, nbCardsForGap);
    }
};