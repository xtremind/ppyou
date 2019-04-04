import Styles from './Styles';

//Private functions
const formatCard = function(suitLabel){
    var card = {};
    switch (suitLabel) {
        case "H":
            card.style = Styles.redCard;
            card.suit = "♥";
            break;
        case "D":
            card.style = Styles.redCard;
            card.suit = "♦";
            break;
        case "S":
            card.style = Styles.blackCard;
            card.suit = "♠";
            break;
        case "C":
            card.style = Styles.blackCard;
            card.suit = "♣";
            break;
        case "B":
            card.style = Styles.inverseCard;
            card.suit = ""
            break;
        default:
            throw "unknownd card";
        }
        return card;
}


const buildCardSuit = function (scene, txtDefinition, label, labelStyle, reverse) {
    var textElement = scene.add.text(txtDefinition.x + 20, txtDefinition.y + 40, label, labelStyle);
    textElement.smoothed = true;
    textElement.setOrigin(0.5);
    if(reverse) 
        textElement.angle = 180 ;
    return textElement;
}

const buildCardRank = function (scene, txtDefinition, label, labelStyle, reverse) {
    var textElement = scene.add.text(txtDefinition.x + 20, txtDefinition.y + 20, label, labelStyle);
    textElement.smoothed = true;
    textElement.setOrigin(0.5);
    if(reverse) 
        textElement.angle = 180 ;
    return textElement;
}

//Public functions
export default {
    drawButton: function(scene, btnDefinition, btnStyle, text, textStyle, btnName, callback){

        var container = scene.add.container()

        var rectangle = scene.add.graphics();

        rectangle.lineStyle(btnStyle.bSize, btnStyle.bColor, btnStyle.bAlpha);
        rectangle.fillStyle(btnStyle.fColor, btnStyle.fAlpha);
        rectangle.fillRoundedRect(btnDefinition.x, btnDefinition.y, btnDefinition.width, btnDefinition.height, btnStyle.radius);
        rectangle.strokeRoundedRect(btnDefinition.x +3, btnDefinition.y+3, btnDefinition.width-6, btnDefinition.height-6, btnStyle.radius-2); // x, y, width, height, radius
        if(callback !== null){
            var rect = new Phaser.Geom.Rectangle(btnDefinition.x, btnDefinition.y, btnDefinition.width, btnDefinition.height);
            rectangle.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
            rectangle.input.cursor = "pointer";
            rectangle.on('pointerup', callback);
        }
        container.add(rectangle);

        var textElement = scene.add.text(btnDefinition.x + (btnDefinition.width/2), btnDefinition.y + (btnDefinition.height / 2), text, textStyle);
        textElement.setOrigin(0.5);
        
        container.add(textElement);

        return container;
    },

    drawText: function(scene, txtDefinition, label, labelStyle, isCenter){
        var container = scene.add.container();
        var textElement = scene.add.text(txtDefinition.x + (txtDefinition.width/2), txtDefinition.y + (txtDefinition.height / 2), label, labelStyle);
        if(isCenter){
            textElement.setOrigin(0.5);
        }
        container.add(textElement);

        return container;
    },

    drawCard: function (scene, cardPosition, card, callback) {
        
        const formattedCard = formatCard(card.suit);

        var cardDefinition = { x: cardPosition.x, y: cardPosition.y, height: 200, width: 100 };
        var reverseCardDefinition = Object.assign({ x: cardPosition.x + 60, y: cardPosition.y + 140 }, formattedCard.style);
    
        var container = this.drawButton(scene, cardDefinition, formattedCard.style, '', {}, '', callback);

        var cardSuit = buildCardSuit(scene, cardDefinition, formattedCard.suit, formattedCard.style, false);
        var cardRank = buildCardRank(scene, cardDefinition, card.rank, formattedCard.style, false);
        var cardReverseSuit = buildCardSuit(scene, reverseCardDefinition, card.rank, formattedCard.style, true);
        var cardReverseRank = buildCardRank(scene, reverseCardDefinition, formattedCard.suit, formattedCard.style, true);

        container.add(cardSuit);
        container.add(cardRank);
        container.add(cardReverseSuit);
        container.add(cardReverseRank);
        
        return container;
    }, 

    drawPpyou: function(scene, suitLabel){

        const formattedCard = formatCard(suitLabel);

        var suitStyle = Object.assign({ }, formattedCard.style);
        suitStyle.font = '50px Arial';

        var ppyouDefinition = { x: 1130, y: 30, height: 20, width: 40 };
        var container = this.drawButton(scene, ppyouDefinition, formattedCard.style, '', {}, '', null);
        var cardReverseRank = buildCardRank(scene, ppyouDefinition, formattedCard.suit, formattedCard.style, true);
        container.add(cardReverseRank);

        // FIXME Reuse function from drawCard
        //var ppyouDefinition = { x: 1130, y: 30, height: 40, width: 40 };
        //var container = this.drawButton(scene, ppyouDefinition, Styles.ppyouButton, formattedCard.suit, suitStyle, '', null);
        //container.getAt(1).angle = 180;

        return container;
    },

    delete: function(container){
        container.destroy();
        return null;
    }
    
        /*rectangle.on('pointerdown', onClick);
        function onClick(target, pointer){
            console.log("onClick");
        }

        rectangle.on('pointerup', onRelease);
        function onRelease(target, pointer){
            console.log("onRelease");
        }*/
};