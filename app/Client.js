var EventSocket = require('eventsocket');
var _ = require('lodash');
var log = require('debug')('JGF:client');

function Client(io, ip, port) {
    var client = this;
    var info = {};
    var diff = {};
    var map = {};
    var status = {};
    var turn = -1;
    var views = {};

    log('connecting... %s:%s', ip, port);

    var socket = new EventSocket(port, ip);

    socket.on('connect', function () {
        socket.emit('token', '00000000000000000000000000000000');
    });

    socket.on('disconnect', function () {
        log('disconnect');
    });

    socket.on('init', function (_info, _map, _diff) {
        info = _info || {};
        turn = info.turn || -1;
        _diff = _diff || {};
        diff = {};
        map = _map || {};
        status = {};

        io.to('_clients').emit('info', info);
        io.to('_clients').emit('map', map);
        io.to('_clients').emit('status', status);

        views = {};
        _(info.views)
            .each(function (view) {
                views[view] = true;
                diff[view] = {};
                _(_diff[view])
                    .each(function (item) {
                        diff[view][item.id] = item;
                    })
                    .value();
                io.to(view).emit('diff', diff[view]);
            })
            .value();
    });

    socket.on('turn', function (_turn, _diff) {
        log('turn', _turn, _diff);
        turn = _turn;
        _(_diff)
            .each(function (data) {
                var view = data.view;
                log('view ' + view);
                var outDiff = {
                    static: [],
                    dynamic: [],
                    transient: []
                };
                if (diff[view] == undefined) {
                    diff[view] = {};
                }
                _(data.static)
                    .each(function (item) {
                        diff[view][item.id] = item;
                        outDiff.static.push(item);
                    })
                    .value();
                outDiff.static = data.static || [];
                outDiff.dynamic = data.dynamic || [];
                outDiff.transient = data.transient || [];
                io.to(view).emit('turn', turn, outDiff);
            })
            .value();
    });

    socket.on('msgs', function (_msgs) {
        io.to('_clients').emit('msgs', _msgs);
    });
    socket.on('status', function (_status) {
        status = _status || {};
        io.to('_clients').emit('status', _status);
    });

    client.getInfo = function () {
        return info;
    };
    client.getViews = function () {
        return views;
    };
    client.getViewData = function (view) {
        return _.values(diff[view]);
    };
    client.getMap = function () {
        return map;
    };
    client.getStatus = function () {
        return status;
    };
}
module.exports = Client;