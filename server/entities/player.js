var Player = function (id) {
    this.id = id;
    this.name = 'player' + id.substring(0,6);
};

Player.prototype = {
    getId: function(){
        return this.id;
    },
    getName: function(){
        return this.name;
    },
    setName: function(name){
        this.name = name;
    }
};

module.exports = Player;