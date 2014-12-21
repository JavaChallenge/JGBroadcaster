var _ = require('lodash');
var net = require('net');
var util = require('util');
var events = require('events');
var log = require('debug')('JGF:json');

function JsonSocket(ip, port) {
    var socket = this;
    var connection = null;
    var json = "";
    if (_.isString(ip)) {
        log('connecting... %s:%s', ip, port);
        connection = net.connect({ip: ip, port: port}, function () {
            log('connect');
            socket.emit('connect');
        });
    } else if (ip instanceof net.Socket) {
        connection = ip;
    } else {
        return;
    }


    connection.on('data', function (data) {
        var str = data.toString();
        var parts = str.split('\0');
        json += parts.shift();
        while (parts.length > 0) {
            log('receive %s', json);
            socket.emit('json', JSON.parse(json));
            json = parts.shift();
        }
    });

    connection.on('end', function () {
        socket.emit('disconnect');
    });



    socket.write = function (data) {
        log('write %s', JSON.stringify(data));
        connection.write(JSON.stringify(data) + '\0');
    }
}

util.inherits(JsonSocket, events.EventEmitter);

module.exports = JsonSocket;
