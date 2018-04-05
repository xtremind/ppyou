// Graphics Utility
var graphics = (function() {
    
    var drawCard = function (game, cardPosition, card, callback) {
        var graphics = game.add.graphics(0, 0);
        graphics.clear();
        
        //id, rank, suit, value
        var text = "";
        switch (card.suit) {
            case "H":
                cardstyle = styles.redCard;
                suit = "♥";
                break;
            case "D":
                cardstyle = styles.redCard;
                suit = "♦";
                break;
            case "S":
                cardstyle = styles.blackCard;
                suit = "♠";
                break; 
            case "C":
                cardstyle = styles.blackCard;
                suit = "♣";
                break;
            case "B":
                cardstyle = styles.inverseCard;
                suit = ""
                break;
            default:
                throw "unknownd card";
        }

        var cardDefinition = {x:cardPosition.x, y:cardPosition.y, height:200, width: 100};
        var reverseCardDefinition = Object.assign({x:cardPosition.x+60, y:cardPosition.y+140}, cardstyle);

        var buttonRect = drawRoundedRect(graphics, cardDefinition, cardstyle);
        var cardSuit = drawCardSuit(game, cardDefinition, suit, cardstyle);
        var cardRank = drawCardRank(game, cardDefinition, card.rank, cardstyle);
        var cardReverseSuit = drawCardSuit(game, reverseCardDefinition, card.rank, cardstyle);
        var cardReverseRank = drawCardRank(game, reverseCardDefinition, suit, cardstyle);
        cardReverseRank.angle=180;
        cardReverseSuit.angle=180;
        buttonRect.addChild(cardSuit);
        buttonRect.addChild(cardRank);
    
        return addInputDownToRect(buttonRect, callback);
    };

    var drawCardSuit = function (game, txtDefinition, label, labelStyle) {
        var text = game.add.text(txtDefinition.x + 20, txtDefinition.y + 40, label, labelStyle);
        text.smoothed = true;
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        return text;
    };

    var drawCardRank = function (game, txtDefinition, label, labelStyle) {
        var text = game.add.text(txtDefinition.x + 20, txtDefinition.y + 20, label, labelStyle);
        text.smoothed = true;
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        return text;
    };

    var drawButtonWithText = function (game, btnDefinition, btnStyle, text, textStyle, btnName, callback) {
        var graphics = game.add.graphics(0, 0);
        
        graphics.clear();  
        graphics.name = btnName;
    
        var buttonRect = drawRoundedRect(graphics, btnDefinition, btnStyle);
        var buttonText = drawText(game, btnDefinition, text, textStyle);
        buttonRect.addChild(buttonText);
    
        return addInputDownToRect(buttonRect, callback);
    }
    
    var drawText = function (game, txtDefinition, label, labelStyle) {
        var text = game.add.text(txtDefinition.x + txtDefinition.width / 2, txtDefinition.y + txtDefinition.height / 2, label, labelStyle);
        text.smoothed = true;
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        return text;
    };
    
    var drawInputText = function (game, iptDefinition, defaultValue, iptStyle) {
        var ipt = game.add.inputField(iptDefinition.x, iptDefinition.y, iptStyle);
        ipt.setText(defaultValue);
        return ipt;
    };

    var deleteButton = function(button) {
        button.children[0].destroy();
        button.clear();
        return null;
    };
    
    var deleteText = function(text){
        text.destroy();
        return null;
    };
    
    // private part
    var drawRoundedRect = function (graphics, btnDefinition, btnStyle) {
        graphics.beginFill(btnStyle.fColor, btnStyle.fAlpha);
        graphics.lineStyle(btnStyle.bSize, btnStyle.bColor, btnStyle.bAlpha);
        graphics.drawRoundedRect(btnDefinition.x, btnDefinition.y, btnDefinition.width, btnDefinition.height, btnStyle.radius);
        graphics.endFill();
        return graphics;
    };
    
    var addInputDownToRect = function(graphics, callback){
        graphics.inputEnabled = true;
        graphics.input.useHandCursor = true;
        graphics.events.onInputDown.add(callback, this);
        return graphics;
    };

    //declare public functions
    return {
        drawCard: drawCard,
        drawButtonWithText: drawButtonWithText,
        drawText: drawText,
        drawInputText: drawInputText,
        deleteButton: deleteButton,
        deleteText: deleteText
    }
}()) 