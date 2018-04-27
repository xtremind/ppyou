window.onload = function () {

    //connect to server
    socket = io.connect(window.location.href);

    //Initialise game variable
    game = new Phaser.Game(1200, 800, Phaser.CANVAS);

    //Declare states
    game.state.add('Boot', Game.Boot);
    game.state.add('Preloader', Game.Preloader);
    game.state.add('MainMenu', Game.MainMenu);
    game.state.add('WaitingRoom', Game.WaitingRoom);
    game.state.add('Party', Game.Party);

    //Launch Boot state
    game.state.start('Boot');

};
