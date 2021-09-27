const Achievement = require('../entities/achievement.js')
  // Achievements possibles : 
  // miss clic => player who has choose a bad card most of the time
  // best player => player who has scored 0 most of the time
  // bad player => player who has scored 250 most of the time
  // stack best player => player who has stack the lesser point
  // stack bad player => player who has stack the higher point
  // discard ppyou => player who has choose the papayou most of the time
  // papayou player => player who has got the papayou most of the time

module.exports = function () {

    this.achievements = new Map();
    this.libelles = new Map();

    //init map
    var initialize = function (logger, players){
        this.logger = logger;

        this.logger.debug("achievmentEngine - initialize");

        var score = new Map();
        players.forEach(player => {
            score.set(player.id, 0);
        });
        this.achievements = new Map();
        this.achievements.set("miss_clic", new Map(score));
        this.achievements.set("best_player", new Map(score));
        this.achievements.set("bad_player", new Map(score));
        this.achievements.set("best_stack_player", new Map(score));
        this.achievements.set("bad_stack_player", new Map(score));
        this.achievements.set("discard_ppyou", new Map(score));
        this.achievements.set("ppyou_player", new Map(score));
        
        this.libelles = new Map();
        this.libelles.set("miss_clic", "🏥 Clumsy 🏥");
        this.libelles.set("best_player", "🍀 Luckiest 🍀");
        this.libelles.set("bad_player", "🔪 Targetted 🔪");
        this.libelles.set("best_stack_player", "");
        this.libelles.set("bad_stack_player", "");
        this.libelles.set("discard_ppyou", "🚽 Taking out the trash 🚽");
        this.libelles.set("ppyou_player", "💢 Unluckiest 💢");
    
        this.update = function(achievementId, playerId, increment) {
            this.logger.debug("achievmentEngine - update " + achievementId + " -> " + playerId);
            var achivement = this.achievements.get(achievementId);
            achivement.set(playerId, achivement.get(playerId)+increment);
        }
    }

    var missClic = function (playerId) {
        this.logger.debug("achievmentEngine - missClic " + playerId);
        this.update("miss_clic", playerId, 1);
    }
    
    var computeGap = function (playerId, cards) {
        this.logger.debug("achievmentEngine - computeGap " + playerId);
        if (cards.some((card) => card.value === 40)) {
            this.update("discard_ppyou", playerId, 1);
        }
    }

    var computePlay = function (playerId, cards) {
        this.logger.debug("achievmentEngine - computePlay " + playerId);
        let score = cards.map(function (card) { return card.value }).reduce(function (a, b) { return a + b }, 0);
        if (score === 0 ) {
            this.update("best_player", playerId, 1);
        } else if (score === 250) {
            this.update("bad_player", playerId, 1);
        } else if (cards.some((card) => card.value === 40)) {
            this.update("ppyou_player", playerId, 1);
        }
    }

    var getAchievements = function(playersList) {
        this.logger.debug("achievmentEngine - getAchievements");
        var arr = [];
        var result = [];

        while(result.length < 3 && arr.length != this.achievements.size){
            var r = Math.floor(Math.random() * this.achievements.size);
            if(arr.indexOf(r) === -1) {
                arr.push(r);
                let key = Array.from(this.achievements.keys())[r];
                let players = Array.from(this.achievements.get(key)).filter(player => player[1] != 0).sort((a, b) => b[1] - a[1]);
                if(players.length > 0){
                    
                    result.push(new Achievement(this.libelles.get(key), playersList.filter((player) => player.id === players[0][0])[0].name, players[0][1]));
                }
            }
        }
        return result;
    }

    return {
        initialize: initialize,
        missClic: missClic,
        computePlay: computePlay,
        computeGap: computeGap,
        getAchievements: getAchievements
    }
}
