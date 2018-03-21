var GameEngine = require("../assets/gameEngine");

var Game = function(id) {
    this.id = id;
    this.players = [];
    this.status = 'WAITING'; // WAITING, INPROGRESS
}

Game.prototype = {
    getId: function(){
        return this.id;
    },

    getPlayers: function(){
        return this.players;
    },

    addPlayer: function(player){
        var existingPlayer = this.playerById(player.getId());
        if (!existingPlayer) {
            this.players.push(player);
        }
    },

    removePlayer: function(playerId){
        var removePlayer = this.playerById(playerId);
        if (!removePlayer) {
            return;
        }
        this.players.splice(this.players.indexOf(removePlayer), 1);
    },

    playerById: function (id) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].getId() == id)
                return this.players[i];
        }    
        return false;
    },

    getStatus: function(){
        return this.status;
    },

    start: function() {
        this.status = 'INPROGRESS';
        this.gameEngine = new GameEngine(this.id, this.players);
        this.gameEngine.start();
    }
}

module.exports = Game;