var _ = require('lodash');
var net = require('net');
var JsonSocket = require('../app/JsonSocket');
var log = require('debug')('JGF:server');
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
            sendInit();
            sendMsg();
            sendStatus();
            sendTurn();
        }
    });

    function sendMsg() {
        if (end) {
            return;
        }
        var rand = _.random(10);
        var msgs = {
            name: "msgs",
            args: [[{"text": "Team 1 is Winner. rnd: " + rand, "type": "success"}]]
        };
        socket.write(msgs);
        setTimeout(sendMsg, _.random(20000));
    }

    function sendStatus() {
        if (end) {
            return;
        }
        var status = {
            "name": "status",
            "args": [
                {
                    "gameStatus": "run",
                    "points": {
                        "team1": _.random(100),
                        "team2": _.random(100)
                    },
                    "connections": {
                        "team1": _.random(100) % 2 == 1,
                        "team2": _.random(100) % 2 == 1
                    }
                }
            ]
        };
        socket.write(status);
        setTimeout(sendStatus, _.random(10000));
    }

    function sendInit() {
        if (end) {
            return;
        }
        turn = 0;
        var init = {
            "name": "init",
            "args": [
                {
                    "turn": turn,
                    "teams": ["team1", "team2"],
                    "views": ["global", "team1", "team2"],
                    "mapSize": {
                        "height": 30,
                        "width": 60
                    }
                },
                [
                    wall
                ],
                [
                    {
                        "view": "global",
                        "static": []
                    },
                    {
                        "view": "team1",
                        "static": []
                    },
                    {
                        "view": "team2",
                        "static": []
                    }
                ]
            ]
        };
        socket.write(init);
        setTimeout(sendInit, _.random(60000));
    }


    var obj = {
        id: '3i3i3i3i',
        type: 'player',
        position: {
            x: 10,
            y: 10
        }
    };
    var wall = {
        id: 'oei2di3e9',
        type: 'wall',
        position: {
            x: 12,
            y: 15
        }
    };

    var bomb = {
        "type": "bomb",
        "position": {"x": _.random(30), "y": _.random(30)},
        "duration": 2
    };
    var turn = 1;
    var d2 = [];

    function sendTurn() {
        if (end) {
            return;
        }
        turn++;
        obj.position.x += _.random(-1, 1);
        obj.position.y += _.random(-1, 1);
        if (obj.position.x < 0) {
            obj.position.x = 0;
        }
        if (obj.position.y < 0) {
            obj.position.y = 0;
        }
        if (obj.position.x > 29) {
            obj.position.x = 29;
        }
        if (obj.position.y > 29) {
            obj.position.y = 29;
        }

        bomb.position.x = _.random(0, 29);
        bomb.position.y = _.random(0, 29);
        var wallType = wall.type;
        wall.type = _.shuffle([wallType, wallType, wallType, 'wall', 'ground'])[0];
        if (wallType != wall.type) {
            wall.turn = turn;
        }
        d2 = _.shuffle([d2, d2, [], [obj]])[0];
        var t = {
            "name": "turn",
            "args": [
                turn,
                [
                    {
                        "view": "global",
                        "static": [
                            _.shuffle([[], [wall]])[0]
                        ],
                        "dynamic": [
                            obj
                        ],
                        "transient": _.shuffle([[], [bomb]])[0]
                    },
                    {
                        "view": "team1",
                        "static": _.shuffle([[], [wall]])[0],
                        "dynamic": [
                            obj
                        ],
                        "transient": _.shuffle([[], [], [bomb]])[0]
                    },
                    {
                        "view": "team2",
                        "static": _.shuffle([[], [], [], [wall]])[0],
                        "dynamic": d2,
                        "transient": _.shuffle([[], [], [bomb]])[0]
                    }
                ]
            ]
        };
        socket.write(t);
        setTimeout(sendTurn, 1000);
    }

});


server.listen(7000, function () {
    log('server started at 7000');
});