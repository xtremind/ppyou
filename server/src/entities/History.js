// contains all informations regarding a game for the scoringScene
// need to add data for each turn, and not play
// each cards played for each play
// the scoring history
// the ppyou history
//


class History {

    constructor(){
        console.log("constructor");
        this.playDatas = [];
    }

    addPlay(nbPlay, ppyouPlay){
        var play = {
            "id": nbPlay,
            "score": 0, 
            "ppyou": ppyouPlay,
            "playedCards": []
        };
        this.playDatas.push(play);
    }

    updatePlayedCards(playedCards){
        var currentPlay = this.playDatas[this.playDatas.length -1];
        currentPlay.playedCards = playedCards;
        this.playDatas[this.playDatas.length -1] = currentPlay;
    }

    endPlay(scoringPlay){
        var currentPlay = this.playDatas[this.playDatas.length -1];
        currentPlay.score = scoringPlay;
        this.playDatas[this.playDatas.length -1] = currentPlay;
    }

    getPlayedCardLastTurnDTO(){
        var currentPlay = this.playDatas[this.playDatas.length -1];
        const result = [];
        if(currentPlay.playedCards.length > 1) {
            currentPlay.playedCards[currentPlay.playedCards.length -2].forEach((value, key) => {
                result.push({
                    "id" : key,
                    "card" : value
                })
            });

        }
        //console.log(result);
        return {"lastPlayedCards" : result};
    }
}

module.exports = History;