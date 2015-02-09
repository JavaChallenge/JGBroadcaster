var _ = require('lodash');
var net = require('net');
var JsonSocket = require('jsonsocket');
var log = require('debug')('JGF:server-terminal');
var lastI = 0;

var server = net.createServer(function (con) {
    var end = false;
    var socket = new JsonSocket(con);
    var i = lastI++;
    log('connect', i);
    socket.on('disconnect', function () {
        log('disconnect', i);
        end = true;
    });


    socket.on('json', function (json) {
        log(json);
        if (json.name == 'token') {
            log('token %s', json.args[0]);
        }
        if (json.name == 'command') {
            log('command ' + JSON.stringify(json.args));
        }
        if (json.name == 'event') {
            log('event ' + JSON.stringify(json.args));
        }

        sendInit();
        sendRepoart();
    });

    function sendInit() {
        if (end) {
            return;
        }
        socket.write({
            "name": "init",
            "args": [
                [
                    "server version 2.0.3",
                    "some useful data",
                    "for help you can type help"
                ]
            ]
        });
    }

    function sendRepoart() {
        if (end) {
            return;
        }
        socket.write({
            "name": "report",
            "args": [
                [
                    "map size : 32 * 32",
                    "1 player is online",
                    "turn number : 100"
                ]
            ]
        });
        setTimeout(sendRepoart, 10000);
    }
});


server.listen(7001, function () {
    log('server started at 7001');
});