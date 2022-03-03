// NPM Libraries
var express = require("express");
var app = express();
const path = require('path')
var http = require("http").Server(app);
var io = require('socket.io')(http, { serveClient: false, pingTimeout: 30000, pingInterval: 5000 });
var winston = require("winston");
//var RateLimit = require('express-rate-limit');
// Customs Libraries
var MainEngine = require("./assets/MainEngine");

var config = winston.config;
var logger = new (winston.Logger)({
  level: process.env.NODE_ENV ===  'production' ? 'info' : 'debug',
  transports: [
    new (winston.transports.Console)({
      timestamp: () => Date.now(),
      formatter: (options) => 
        new Intl.DateTimeFormat('fr-FR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour24: true
        }).format(options.timestamp()) + ' ' +
          config.colorize(options.level, options.level.toUpperCase()) + ' ' +
          (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '')
    })
  ]
});

if(process.env.NODE_ENV ===  'production'){
  logger.debug("Adding file logger");
  logger.add(winston.transports.File, { 
    name: "error",
    filename: 'ppyou-error.log' ,
    level: 'warn',
    json: false
  });
  
  logger.add(winston.transports.File, { 
    name: "trace",
    filename: 'ppyou-trace.log' ,
    level: 'debug',
    json: false
  })
} else {
  logger.debug("No file logger");
}

io.set('transports', ['polling', 'websocket']);

// set up rate limiter: maximum of five requests per minute
//var limiter = new RateLimit({
//  windowMs: 1*60*1000, // 1 minute
//  max: 5
//});

// apply rate limiter to all requests
//app.use(limiter);

// Serve up index.html.
app.use(express.static("client"));

var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
//var server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

http.listen(server_port, null, function () {
  logger.debug("Listening on " + this._connectionKey);
});

//redirect client part
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'/client/index.html'));
});

var engine = new MainEngine (logger, io);

engine.start();
