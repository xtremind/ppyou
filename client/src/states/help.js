import Phaser from 'phaser';
import graphics from '../utils/graphics';
import styles from '../utils/styles';


export class Help extends Phaser.State {

  constructor() {
    super();
    this.firstPart = true;
  }

  create() {
    //console.log("Help.create");
    this.display();
  }

  display(){
    this.game.world.removeAll();
    this.displayCommonPart();
    this.firstPart ? this.displayFirstPart() : this.displaySecondPart();
    this.displayButtonsPart();
  }

  displayCommonPart(){
    // add a background image
    this.game.add.tileSprite(0, 0, 1200, 800, 'cardTable');

    // add a title
    graphics.drawText(this.game, { x: this.world.centerX, y: 80, height: 0, width: 0 }, '♥ ♣  PPyou  ♠ ♦', styles.titleText);
    // add a subtitle
    graphics.drawText(this.game, { x: this.world.centerX, y: 150, height: 0, width: 0 }, 'Help', styles.subtitleText);
  }

  displayFirstPart(){    
    graphics.drawLeftText(this.game, { x: 100, y: 200, height: 0, width: 0 }, 'But du jeu :', styles.helpTitleText);
    graphics.drawLeftText(this.game, { x: 100, y: 230, height: 0, width: 0 }, 'Récolter aussi peu de points que possible', styles.helpCommentText);

    graphics.drawLeftText(this.game, { x: 100, y: 260, height: 0, width: 0 }, 'Valeur des cartes :', styles.helpTitleText);
    graphics.drawLeftText(this.game, { x: 100, y: 290, height: 0, width: 0 }, 'Chaque Payoo vaut sa propre valeur, soit 1 à 20 points; l\'un des quatres 7 (♥, ♦, ♠ et ♣)', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 315, height: 0, width: 0 }, 'est le Ppyou : Il change à chaque donne et vaut 40 points. Les autres cartes n\'ont aucune valeur.', styles.helpCommentText);

    graphics.drawLeftText(this.game, { x: 100, y: 345, height: 0, width: 0 }, 'Ecart :', styles.helpTitleText);
    graphics.drawLeftText(this.game, { x: 100, y: 375, height: 0, width: 0 }, 'Après avoir récupéré leurs jeux, les joueurs procèdent à l\'écart. Chacun se débarasse des', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 400, height: 0, width: 0 }, 'cartes de son choix en retirant de son jeu le nombre de cartes indiqués, pour les transmettre', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 425, height: 0, width: 0 }, 'à son voisin de gauche.', styles.helpCommentText);

    graphics.drawLeftText(this.game, { x: 100, y: 455, height: 0, width: 0 }, 'Déroulement d\'une manche :', styles.helpTitleText);
    graphics.drawLeftText(this.game, { x: 100, y: 485, height: 0, width: 0 }, 'Un joueur est désigné afin de jouer une carte de son choix. Les autres joueurs jouent ensuite', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 510, height: 0, width: 0 }, 'chacun à leur tour dans le sens horaire, en suivant impérativement la couleur demandée par', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 535, height: 0, width: 0 }, 'le premier (mais il n\'est pas impératif de jouer une carte de plus forte valeur). Le Payoo', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 560, height: 0, width: 0 }, 'doit ête considéré comme la cinquième couleur, au même titre que ♥, ♦, ♠ et ♣. Si un joueur', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 585, height: 0, width: 0 }, 'n\'a pas la couleur demandée, il se défausse de toute autre carte de son choix. Celui qui', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 610, height: 0, width: 0 }, 'a joué la carte la plus forte dans la couleur demandée ramasse le pli, et entame le pli suivant.', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 635, height: 0, width: 0 }, 'Si aucun joueur ne peut suivre dans la couleur demandée, c\'est le joueur qui a entamé qui', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 660, height: 0, width: 0 }, 'ramasse le pli', styles.helpCommentText);
  }

  displaySecondPart(){
    graphics.drawLeftText(this.game, { x: 100, y: 200, height: 0, width: 0 }, 'Fin d\'une manche :', styles.helpTitleText);
    graphics.drawLeftText(this.game, { x: 100, y: 230, height: 0, width: 0 }, 'A l\'issue du dernier pli, le compte des points est réalisé. Le total des scores d\'une manche', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 255, height: 0, width: 0 }, 'doit faire 250 points. On additionne ces points à ceux des donnes précédentes.', styles.helpCommentText);

    graphics.drawLeftText(this.game, { x: 100, y: 285, height: 0, width: 0 }, 'Fin d\'une partie :', styles.helpTitleText);
    graphics.drawLeftText(this.game, { x: 100, y: 320, height: 0, width: 0 }, 'La partie se termine lorsque le nombre de manches jouées est également à xxx. Celui qui a', styles.helpCommentText);
    graphics.drawLeftText(this.game, { x: 100, y: 345, height: 0, width: 0 }, 'le moins de points à l\'issue de la dernière manche est déclaré vainqueur', styles.helpCommentText); //TODO définir un nombre de tours maximum (4 tours ~ 30 min)
  }

  displayButtonsPart(){
    const stateScope = this;
    //add buttons
    graphics.drawButtonWithText(stateScope.game, { x: stateScope.world.centerX - 100 , y: 700, height: 50, width: 200 }, styles.hostButton, 'Back', styles.hostText, 'Back', 
      function () {
        stateScope.state.start('MainMenu');
    });
    //switch part
    graphics.drawButtonWithText(stateScope.game, { x: stateScope.world.centerX - (stateScope.firstPart ? -120 : 170), y: 700, height: 50, width: 50 }, styles.hostButton, stateScope.firstPart ? '>' : '<', styles.hostText, stateScope.firstPart ? '>' : '<', 
      function () {
        stateScope.firstPart = !stateScope.firstPart;
        stateScope.display();
    });

  }
}