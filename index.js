function Broadcaster(ip, port) {
    var broadcaster = this;
    var express = require('express');
    var app = express();
    var server = require('http').Server(app);
    var io = require('socket.io')(server);
    var domain = require('domain');
    var dio = domain.create();
    dio.on('error', function (err) {
        log('socket io domain:', err.stack);
    });
    var log = require('debug')('JGF:index');
    log('=======');
    log('Ya hagh');
    log('-------');
    var Client = require('./app/Client');

    broadcaster.app = app;
    broadcaster.express = express;
    broadcaster.start = function (port) {
        server.listen(port);
    };

    broadcaster.static = function (dir) {
        app.use(express.static(dir));
    };

    broadcaster.run = function (serverId, token) {
        var channel = '/server' + serverId;
        var client = new Client(io.of(channel), ip, port + serverId, token);
        dio.run(function () {
            io
                .of(channel)
                .on('connection', function (socket) {
                    var socketViews = {};
                    socket.join('_clients');

                    socket.emit('info', client.getInfo());
                    socket.emit('map', client.getMap());
                    socket.emit('status', client.getStatus());

                    socket.on('join', function (view, fn) {
                        log('join', view);
                        fn = (typeof fn === 'function') ? fn : function () {
                        };
                        var views = client.getViews();
                        if (views[view]) {
                            socket.join(view);
                            socketViews[view] = true;
                            var data = client.getViewData(view);
                            fn({ok: true});
                            socket.emit('diff', data);
                        } else {
                            fn({ok: false});
                        }
                    });

                    socket.on('leave', function (view, fn) {
                        log('leave', view);
                        fn = (typeof fn === 'function') ? fn : function () {
                        };
                        if (socketViews[view]) {
                            socket.leave(view);
                            delete socketViews[view];
                            fn({ok: true});
                        } else {
                            fn({ok: false});
                        }
                    });
                });
        });
        return client;
    }

}
module.exports = Broadcaster;