var express = require('express');
var sockjs  = require('sockjs');
var http = require('http');

var clients = {};
var clientCount = 0;

function broadcast() {
    var random = Math.floor(Math.random() * 1000);

    for (var key in clients) {
        if(clients.hasOwnProperty(key)) {
            clients[key].write(JSON.stringify({ random: random, clients: clientCount }));
        }
    }
}

function startBroadcast () {
    setInterval(broadcast, 500);
}

var sockjsServer = sockjs.createServer();

sockjsServer.on('connection', function(conn) {
    clientCount++;
    if (clientCount === 1) {
        startBroadcast();
    }

    clients[conn.id] = conn;

    conn.on('close', function() {
        clientCount--;
        delete clients[conn.id];
    });
});

var app = express();
app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
sockjsServer.installHandlers(server, { prefix: '/random' });
