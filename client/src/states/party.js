import Phaser from 'phaser';
import graphics from '../utils/graphics';
import logger from '../utils/logger';
import styles from '../utils/styles';

export class Party extends Phaser.State {

  constructor(socket) {
    super();
    this.socket = socket;
  }

  create() {
    const stateScope = this;
    stateScope.initiateProperties();
    // add a background image
    stateScope.sprite = stateScope.game.add.tileSprite(0, 0, 1200, 800, 'cardTable');
    // get all datas to refresh display
    stateScope.socket.on("refresh data", function (data) {
      logger.debug(stateScope.socket, "refresh data : " + data.action);
      if (stateScope.playedCardPosition.size === 0) {
        stateScope.computePlayedCardPosition(data.scoringGame);
      }
      stateScope.scoringGame = data.scoringGame;
      stateScope.action = data.action;
      stateScope.gap = data.action === "GAP" ? data.gap : 0;
      stateScope.hand = data.givenCards;
      stateScope.nbPlayedCardsBefore = stateScope.playedCards.length;
      stateScope.playedCards = data.playedCards;
      stateScope.ppyou = data.ppyou;
      stateScope.currentPlayer = data.currentPlayer;
      stateScope.refreshDisplay(true);
    });

    stateScope.socket.on("last play", function (data) {
      logger.debug(stateScope.socket, "last play : " + data);
      if(data.lastPlayedCards.length > 0){
        graphics.showPopup(data.lastPlayedCards.map((element) => element.card));
      }
    });

    stateScope.socket.on("end game", function () {
      logger.debug(stateScope.socket, "end game");
      stateScope.resetEvents();
      stateScope.state.start('EndRoom');
    });

    stateScope.fx = stateScope.add.audio('playCard');

    //send signal ready
    logger.debug(stateScope.socket, "ready to play");
    stateScope.socket.emit("ready to play", null);
  }

  initiateProperties(){
    const stateScope = this;
    stateScope.actionList = ['NONE', 'GAP', 'SELECT', 'PLAY', 'WAIT']
    stateScope.action = stateScope.actionList[0];
    stateScope.nbPlayedCardsBefore = 0;
    stateScope.playedCards = []
    stateScope.playedCardPosition = new Map();
    stateScope.hand = [];
    stateScope.fx = null;
    stateScope.playedCardPosition = new Map();
  }

  refreshDisplay(full) {
    logger.debug(this.socket, "refreshDisplay");
    const stateScope = this;
    //clear display
    stateScope.game.world.removeAll()
    // add a background image
    stateScope.sprite = stateScope.game.add.tileSprite(0, 0, 1200, 800, 'cardTable');
    //display message
    if (stateScope.action === 'WAIT') {
      graphics.drawText(stateScope.game, { x: stateScope.game.world.centerX, y: stateScope.game.world.centerY, height: 0, width: 0 }, "En attente des autres joueurs", styles.titleText);
    }
    if (stateScope.action === 'GAP') {
      graphics.drawText(stateScope.game, { x: stateScope.game.world.centerX, y: stateScope.game.world.centerY, height: 0, width: 0 }, "Merci de choisir " + stateScope.gap + " cartes à donner à votre voisin", styles.titleText);
    }
    // display current score
    stateScope.scoringGame.forEach(function (element, index) {
      var style = Object.assign(index === stateScope.currentPlayer && stateScope.action != "GAP" ? { fontWeight: 'bold'} : {}, styles.playerScore);
      const playerElement = graphics.drawLeftText(stateScope.game, { x: 30, y: 30 + index * 20, height: 0, width: 0 }, element.name + " : " + element.score, style);
      if(index === stateScope.currentPlayer && stateScope.action != "GAP"){
        playerElement.alpha = 0.1;
        playerElement.addColor('#ff6347', 0);
        graphics.blink(stateScope.game, playerElement);
      }
    })
    // display ppyou
    if (stateScope.action != "GAP") {
      graphics.drawPpyou(stateScope.game, stateScope.ppyou);
    }
    // display card in hand
    var posX = (1200 - (100 + (this.hand.length - 1) * 50)) / 2
    this.hand.forEach((card, index) => {
      var cardPosition = { x: posX + 50 * index++, y: stateScope.game.world.height - (card.selected ? 200 : 150) };

      graphics.drawCard(stateScope.game, cardPosition, card, function () {
        var nbSelected = 0
        if (stateScope.action === "GAP") {
          logger.debug(stateScope.socket, "Card action : GAP");
          nbSelected = stateScope.hand.filter(function (card) { return card.selected }).length;
          for (let i = 0; i < stateScope.hand.length; i++) {
            if (stateScope.hand[i].id == card.id)
              stateScope.hand[i].selected = !stateScope.hand[i].selected && nbSelected < stateScope.gap;
          }
          stateScope.refreshDisplay(false);
        } else if (stateScope.action === "PLAY") {
          logger.debug(stateScope.socket, "Card action : PLAY");
          nbSelected = stateScope.hand.filter(function (card) { return card.selected }).length;
          for (let i = 0; i < stateScope.hand.length; i++) {
            if (stateScope.hand[i].id == card.id && nbSelected < 1) {
              stateScope.hand[i].selected = true;
              stateScope.socket.emit("play card", card.id);
              stateScope.action === "NONE"
            }
          }
          stateScope.refreshDisplay(false);
        } else {
          logger.debug(stateScope.socket, "Card action : NONE");
        }
      });
    });
    // draw valid gap
    if (stateScope.action === "GAP" && stateScope.hand.filter(function (card) { return card.selected }).length === stateScope.gap) {
      graphics.drawButtonWithText(stateScope.game, { x: stateScope.game.world.centerX - 100, y: stateScope.game.world.height - 300, height: 50, width: 200 }, styles.startButton, 'Valider ecart', styles.startText, 'test', function () {
        logger.debug(stateScope.socket, "Send Gap");
        stateScope.socket.emit("gap", stateScope.hand.filter(function (card) { return card.selected }).map(function (card) { return card.id }));
        stateScope.action = 'WAIT';
        stateScope.refreshDisplay(false);
      });
    }
    // display card played
    this.playedCards.forEach((playedCard) => {
      graphics.drawCard(stateScope.game, stateScope.playedCardPosition.get(playedCard.id), playedCard.card, null);
    });

    if (stateScope.action != "GAP" && full && this.playedCards.length != 0){
      if (this.nbPlayedCardsBefore != this.playedCards.length) {
        stateScope.fx.play();
      } else {
        logger.debug(stateScope.socket, "Bad card played");
      }
    }
    
    // display last turn played if it's my turn
    if (stateScope.action === "PLAY"){ 
      graphics.drawButtonWithText(stateScope.game, {x:970, y:30, height:40, width: 150}, styles.startButton, 'Last turn', styles.lastTurnText, 'Last turn', function(){
        stateScope.socket.emit("get last turn", null);
      });
      //show play ...
    }

  }

  computePlayedCardPosition(players) {
    const stateScope = this;
    var playTable = { x0: 550, y0: 200, rx: 350, ry: 200 };
    var radius = (Math.PI * 2) / players.length;
    var initial = players.findIndex(function (player) {
      return player.id === stateScope.socket.id;
    });
    players.forEach((player, index) => {
      var cardPosition = { x: playTable.x0 + playTable.rx * Math.sin(radius * (index - initial % players.length)), y: playTable.y0 + playTable.ry * Math.cos(radius * (index - initial % players.length)) };
      stateScope.playedCardPosition.set(player.id, cardPosition);
    });
  }

  resetEvents() {
    this.socket.off("refresh data");
    this.socket.off("last play");
    this.socket.off("end game");
  }

}