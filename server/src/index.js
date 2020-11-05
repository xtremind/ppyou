// NPM Librairies
var express = require("express"),
  app = express(),
  http = require("http").Server(app),
  io = require('socket.io')(http, { serveClient: false }),
  winston = require("winston");

// Customs Librairies
var MainEngine = require("./assets/MainEngine");

var config = winston.config;
var logger = new (winston.Logger)({
  level: process.env.NODE_ENV ===  'development' ? 'debug' : 'info',
  transports: [
    new (winston.transports.Console)({
      timestamp: function () {
        return Date.now();
      },
      formatter: function (options) {
        return new Intl.DateTimeFormat('fr-FR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour24: true
        }).format(options.timestamp()) + ' ' +
          config.colorize(options.level, options.level.toUpperCase()) + ' ' +
          (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
      }
    })
  ]
});

io.set('transports', ['polling', 'websocket']);

// Serve up index.html.
app.use(express.static("client"));

var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

http.listen(server_port, null, function () {
  logger.debug("Listening on " + this._connectionKey);
});

//redirect client part
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

var engine = new MainEngine (logger, io);

engine.start();