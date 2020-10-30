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

        //console.log(this.playDatas);
    },
    getDTO: function(){
        //console.log("getDTO")
        return this.playDatas;
    }
}

module.exports = History;