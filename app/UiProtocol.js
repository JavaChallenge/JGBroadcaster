var _ = require('lodash');
var net = require('net');
var util = require('util');
var events = require('events');
var JsonSocket = require('./JsonSocket');
var log = require('debug')('JGF:UI');

function UiProtocol(ip, port) {
    var protocol = this;
    var socket;
    if (_.isString(ip)) {
        log('connecting... %s:%s', ip, port);
        socket = new JsonSocket(ip, port);
    } else if (ip instanceof JsonSocket) {
        socket = ip;
    } else if (ip instanceof net.Socket) {
        socket = new JsonSocket(ip);
    } else {
        return;
    }

    protocol.write = function (data) {
        socket.write(data);
    };
    socket.on('connect', function () {
        protocol.emit('connect');
    });
    socket.on('json', function (json) {
        if (json.name) {
            var args = json.args;
            if (args === undefined) {
                args = [];
            }
            json.args.unshift(json.name);
            protocol.emit.apply(protocol, args)
        }
    });
    socket.on('disconnect', function () {
        protocol.emit('disconnect');
    });

}
util.inherits(UiProtocol, events.EventEmitter);


module.exports = UiProtocol;