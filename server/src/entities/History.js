// contains all informations regarding a game for the scoringScene
// each cards played for each play
// the scoring history
// the ppyou history
//


var History = function(){
    this.playDatas = [];
}

History.prototype = {
    add: function(playedCardPlay, scoringPlay, ppyouPlay){
        this.playDatas.push({
            "playId": this.playDatas.length, 
            "cards": playedCardPlay, 
            "score": scoringPlay, 
            "ppyou": ppyouPlay
        });
    },
    getDTO: function(){
        return this.playDatas;
    }
}

module.exports = History;