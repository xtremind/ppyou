var Player = function (id, socket) {
  this.id = id;
  this.name = 'player_' + id.substring(0, 6);
  this.socket = socket;
  this.type = "player";
};

Player.prototype = {
  getId: function () {
    return this.id;
  },
  getName: function () {
    return this.name;
  },
  setName: function (name) {
    this.name = name;
  },
  getSocket: function () {
    return this.socket;
  },
  getDTO: function () {
    return {
      "id": this.getId(),
      "name": this.getName(),
      "type": this.type
    }
  }
};

module.exports = Player;