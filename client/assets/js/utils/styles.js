
var styles = (function() {

    // button style
    var hostButton = {radius: 7, bSize: 2, bColor: 0x0000FF, bAlpha: 1, fColor: 0x027a71, fAlpha: 1}; 
    var joinButton = {radius: 7, bSize: 2, bColor: 0x0000FF, bAlpha: 1, fColor: 0x027a71, fAlpha: 1};
    var startButton = {radius: 7, bSize: 2, bColor: 0x0000FF, bAlpha: 1, fColor: 0x027a71, fAlpha: 1};
    var leaveButton = {radius: 7, bSize: 2, bColor: 0x0000FF, bAlpha: 1, fColor: 0x027a71, fAlpha: 1};
    var ppyouButton = {radius: 7, bSize: 2, bColor: 0x0000FF, bAlpha: 1, fColor: 0xFFFFFF, fAlpha: 1};

    // text style
    var hostText = {font: '25px Arial', fill: '#ffffff'};
    var joinText = {font: '25px Arial', fill: '#ffffff'};
    var startText = {font: '25px Arial', fill: '#ffffff'};
    var leaveText = {font: '25px Arial', fill: '#ffffff'};
    var playerNameText = {font: '25px Arial', fill: '#ffffff'};
    var titleText = {font: '50px Arial', fill: '#ffffff'};
    var subtitleText = {font: '30px Arial', fill: '#ffffff'};
    var playerScore = {font: '20px Arial', fill: '#ffffff'};

    // card Style
    var redCard = {radius: 7, bSize: 2, bColor: 0xFF0000, bAlpha: 1, fColor: 0xFFFFFF, fAlpha: 1, font: '25px Arial', fill: '#ff0000'};
    var blackCard = {radius: 7, bSize: 2, bColor: 0x000000, bAlpha: 1, fColor: 0xFFFFFF, fAlpha: 1, font: '25px Arial', fill: '#000000'};
    var inverseCard = {radius: 7, bSize: 2, bColor: 0xFFFFFF, bAlpha: 1, fColor: 0x000000, fAlpha: 1, font: '25px Arial', fill: '#ffffff'};

    // input stype
    var playerNameInput = {font: '18px Arial',fill: '#212121', fontWeight: 'bold', width: 150, padding: 8, borderWidth: 1, borderColor: '#000', borderRadius: 6};

    //declare public functions
    return {
        hostButton: hostButton,
        joinButton: joinButton,
        startButton: startButton,
        leaveButton : leaveButton,
        hostText: hostText,
        joinText: joinText,
        startText: startText,
        leaveText : leaveText,
        playerNameText : playerNameText,
        titleText : titleText,
        subtitleText : subtitleText,
        playerNameInput: playerNameInput,
        redCard: redCard,
        blackCard: blackCard,
        inverseCard: inverseCard,
        ppyouButton: ppyouButton,
        playerScore: playerScore
    }
}())