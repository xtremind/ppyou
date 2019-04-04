import Phaser from 'phaser';
import Graphics from '../utils/Graphics';
import Styles from '../utils/Styles';

class GameScene extends Phaser.Scene {

    constructor(socket) {
      super({
        key: 'GameScene'
      });
      this.socket = socket;
      this.debug = false;
      this.actionList = ['NONE', 'GAP', 'SELECT', 'PLAY', 'WAIT']
      this.action = this.actionList[0];
      this.playedCards = []
      this.playedCardPosition = new Map();
      this.hand = [];
      this.fx = null;
    }
  
    preload() {
        console.log("GameScene");
    }
  
    create() {
      console.log("GameScene.create");
      const sceneScope = this;

      //add background image
      sceneScope.add.image(0, 0, 'cardTable').setOrigin(0);

      // get all datas to refresh display
      sceneScope.sys.game.socket.on("refresh data", function (data) {
        console.log("refresh data : " + data.action);
        if (sceneScope.playedCardPosition.size === 0) {
          sceneScope.computePlayedCardPosition(data.scoringGame);
        }
        sceneScope.scoringGame = data.scoringGame;
        sceneScope.action = data.action;
        sceneScope.gap = data.action === "GAP" ? data.gap : 0;
        sceneScope.hand = data.givenCards;
        sceneScope.playedCards = data.playedCards;
        sceneScope.ppyou = data.ppyou;
        sceneScope.currentPlayer = data.currentPlayer;
        sceneScope.refreshDisplay();
      });

      //sceneScope.fx = sceneScope.add.audio('playCard');

      //TODO if receive 'END Game', go to scoreScene

      //send signal ready
      console.log("ready to play");
      sceneScope.sys.game.socket.emit("ready to play", null);
    }

    refreshDisplay() {
      console.log("refreshDisplay");
      const sceneScope = this;
      //clear display
      //FIXME : sceneScope.cameras.main.removeAll();
      //add background image
      sceneScope.add.image(0, 0, 'cardTable').setOrigin(0);
      //display message
      if (sceneScope.action === 'WAIT') {
        Graphics.drawText(sceneScope, { x: sceneScope.cameras.main.centerX, y: sceneScope.cameras.main.centerY, height: 0, width: 0 }, "En attente des autres joueurs", Styles.titleText, true);
      }
      if (sceneScope.action === 'GAP') {
        Graphics.drawText(sceneScope, { x: sceneScope.cameras.main.centerX, y: sceneScope.cameras.main.centerY, height: 0, width: 0 }, "Merci de choisir " + sceneScope.gap + " cartes à donner à votre voisin", Styles.titleText, true);
      }
      // display current score
      sceneScope.scoringGame.forEach(function (element, index) {
        var style = Object.assign(index === sceneScope.currentPlayer && sceneScope.action != "GAP" ? { 'fontStyle': 'bold' } : {}, Styles.playerScore); //FIXME bold not applying
        Graphics.drawText(sceneScope, { x: 30, y: 30 + index * 20, height: 0, width: 0 }, element.name + " : " + element.score, style, false);
      });
      // display ppyou
      Graphics.drawPpyou(sceneScope, sceneScope.ppyou);
      // display card in hand
      var posX = (1200 - (100 + (this.hand.length - 1) * 50)) / 2
      this.hand.forEach((card, index) => {
        var cardPosition = { x: posX + 50 * index++, y: sceneScope.cameras.main.height - (card.selected ? 200 : 150) };
  
        Graphics.drawCard(sceneScope, cardPosition, card, function () {
          if (sceneScope.action === "GAP") {
            console.log("Card action : GAP");
            var nbSelected = sceneScope.hand.filter(function (card) { return card.selected }).length;
            for (var i = 0; i < sceneScope.hand.length; i++) {
              if (sceneScope.hand[i].id == card.id)
                sceneScope.hand[i].selected = !sceneScope.hand[i].selected && nbSelected < sceneScope.gap;
            }
          } else if (sceneScope.action === "PLAY") {
            console.log("Card action : PLAY");
            //FIXME sceneScope.fx.play();
            var nbSelected = sceneScope.hand.filter(function (card) { return card.selected }).length;
            for (var i = 0; i < sceneScope.hand.length; i++) {
              if (sceneScope.hand[i].id == card.id && nbSelected < 1) {
                sceneScope.hand[i].selected = true;
                sceneScope.sys.game.socket.emit("play card", card.id);
                sceneScope.action === "NONE"
              }
            }
          } else {
            console.log("Card action : NONE");
          }
  
          sceneScope.refreshDisplay();
        });
      });
      // draw valid gap
      if (sceneScope.action === "GAP" && sceneScope.hand.filter(function (card) { return card.selected }).length === sceneScope.gap) {
        Graphics.drawButton(sceneScope, { x: sceneScope.cameras.main.centerX - 100, y: sceneScope.cameras.main.height - 300, height: 50, width: 200 }, Styles.startButton, 'Valider ecart', Styles.startText, 'test', function () {
          console.log("Send Gap");
          sceneScope.sys.game.socket.emit("gap", sceneScope.hand.filter(function (card) { return card.selected }).map(function (card) { return card.id }));
          sceneScope.action = 'WAIT';
          sceneScope.refreshDisplay();
        });
      }
      // display card played
      this.playedCards.forEach((playedCard) => {
        Graphics.drawCard(sceneScope, sceneScope.playedCardPosition.get(playedCard.id), playedCard.card, null);
      });
  
      // display last hand played
      //lastHand = Graphics.drawButtonWithText(sceneScope, {x:50, y:170, height:50, width: 200}, Styles.startButton, 'Last hand', Styles.startText, 'test', function(){
      //sceneScope.sys.game.socket.emit("ready to play", null);
      //if( sceneScope.action != sceneScope.actionList[0])
      //  sceneScope.sys.game.socket.emit(sceneScope.action, sceneScope.cardID).value;
      //});
    }

    computePlayedCardPosition(players) {
      const sceneScope = this;
      var playTable = { x0: 550, y0: 200, rayon: 200 };
      var radius = (Math.PI * 2) / players.length;
      var initial = players.findIndex(function (player) {
        return player.id === sceneScope.sys.game.socket.id;
      });
      players.forEach((player, index) => {
        var cardPosition = { x: playTable.x0 + playTable.rayon * Math.sin(radius * (index - initial % players.length)), y: playTable.y0 + playTable.rayon * Math.cos(radius * (index - initial % players.length)) };
        sceneScope.playedCardPosition.set(player.id, cardPosition);
      });
    }
  
    update(){}

}

export default GameScene;