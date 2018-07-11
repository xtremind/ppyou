import styles from './styles';
// Graphics Utility

// private part
var drawRoundedRect = function (graphics, btnDefinition, btnStyle) {
  graphics.beginFill(btnStyle.fColor, btnStyle.fAlpha);
  graphics.lineStyle(btnStyle.bSize, btnStyle.bColor, btnStyle.bAlpha);
  graphics.drawRoundedRect(btnDefinition.x, btnDefinition.y, btnDefinition.width, btnDefinition.height, btnStyle.radius);
  graphics.endFill();
  return graphics;
};

var addInputDownToRect = function (graphics, callback) {
  if (callback === null) {
    return graphics;
  }
  graphics.inputEnabled = true;
  graphics.input.useHandCursor = true;
  graphics.events.onInputDown.add(callback, this);
  return graphics;
};

// public part
export default {
  drawCard: function (game, cardPosition, card, callback) {
    var graphics = game.add.graphics(0, 0);
    graphics.clear();

    //id, rank, suit, value
    var cardstyle = null;
    var suit = "";
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

    var cardDefinition = { x: cardPosition.x, y: cardPosition.y, height: 200, width: 100 };
    var reverseCardDefinition = Object.assign({ x: cardPosition.x + 60, y: cardPosition.y + 140 }, cardstyle);

    var buttonRect = drawRoundedRect(graphics, cardDefinition, cardstyle);
    var cardSuit = this.drawCardSuit(game, cardDefinition, suit, cardstyle);
    var cardRank = this.drawCardRank(game, cardDefinition, card.rank, cardstyle);
    var cardReverseSuit = this.drawCardSuit(game, reverseCardDefinition, card.rank, cardstyle);
    var cardReverseRank = this.drawCardRank(game, reverseCardDefinition, suit, cardstyle);
    cardReverseRank.angle = 180;
    cardReverseSuit.angle = 180;
    buttonRect.addChild(cardSuit);
    buttonRect.addChild(cardRank);
    buttonRect.addChild(cardReverseSuit);
    buttonRect.addChild(cardReverseRank);

    return addInputDownToRect(buttonRect, callback);
  },

  drawCardSuit: function (game, txtDefinition, label, labelStyle) {
    var text = game.add.text(txtDefinition.x + 20, txtDefinition.y + 40, label, labelStyle);
    text.smoothed = true;
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    return text;
  },

  drawCardRank: function (game, txtDefinition, label, labelStyle) {
    var text = game.add.text(txtDefinition.x + 20, txtDefinition.y + 20, label, labelStyle);
    text.smoothed = true;
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    return text;
  },

  drawPpyou: function (game, suit) {
    var graphics = game.add.graphics(0, 0);

    graphics.clear();
    graphics.name = "ppyou";

    var text = "";
    var cardstyle;
    switch (suit) {
      case "H":
        text = "♥";
        cardstyle = Object.assign({}, styles.redCard);
        break;
      case "D":
        text = "♦";
        cardstyle = Object.assign({}, styles.redCard);
        break;
      case "S":
        text = "♠";
        cardstyle = Object.assign({}, styles.blackCard);
        break;
      case "C":
        text = "♣";
        cardstyle = Object.assign({}, styles.blackCard);
        break;
      default:
        throw "unknowd suit";
    }

    var ppyouDefinition = { x: 1130, y: 30, height: 40, width: 40 };
    cardstyle.font = '50px Arial';

    var buttonRect = drawRoundedRect(graphics, ppyouDefinition, styles.ppyouButton);
    var buttonText = this.drawText(game, ppyouDefinition, text, cardstyle);
    buttonText.angle = 180;
    buttonRect.addChild(buttonText);

    return buttonRect;
  },

  drawButtonWithText: function (game, btnDefinition, btnStyle, text, textStyle, btnName, callback) {
    var graphics = game.add.graphics(0, 0);

    graphics.clear();
    graphics.name = btnName;

    var buttonRect = drawRoundedRect(graphics, btnDefinition, btnStyle);
    var buttonText = this.drawText(game, btnDefinition, text, textStyle);
    buttonRect.addChild(buttonText);

    return addInputDownToRect(buttonRect, callback);
  },

  drawText: function (game, txtDefinition, label, labelStyle) {
    var text = game.add.text(txtDefinition.x + txtDefinition.width / 2, txtDefinition.y + txtDefinition.height / 2, label, labelStyle);
    text.smoothed = true;
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    return text;
  },

  drawLeftText: function (game, txtDefinition, label, labelStyle) {
    var text = game.add.text(txtDefinition.x + txtDefinition.width / 2, txtDefinition.y + txtDefinition.height / 2, label, labelStyle);
    text.smoothed = true;
    return text;
  },

  drawInputText: function (game, iptDefinition, defaultValue, iptStyle) {
    var ipt = game.add.inputField(iptDefinition.x, iptDefinition.y, iptStyle);
    ipt.setText(defaultValue);
    return ipt;
  },

  deleteButton: function (button) {
    button.children[0].destroy();
    button.clear();
    return null;
  },

  deleteText: function (text) {
    text.destroy();
    return null;
  }

};