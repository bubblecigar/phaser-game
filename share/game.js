"use strict";
exports.__esModule = true;
exports.gameMethods = exports.gameState = void 0;
var gameState = {
    scene: null,
    players: []
};
exports.gameState = gameState;
var gameMethods = {
    addPlayer: function (p, icon, id) {
        var scene = gameState.scene;
        if (!scene) {
            console.log('not initialize');
            return;
        }
        var playerAlreadyExist = gameState.players.some(function (player) { return player.id === id; });
        if (playerAlreadyExist) {
            console.log('player already exist');
            return;
        }
        var phaserObject = scene.physics.add.image(p.x, p.y, icon);
        phaserObject.setDepth(3);
        phaserObject.setCollideWorldBounds(true);
        var player = {
            id: id,
            phaserObject: phaserObject,
            position: p,
            velocity: { x: 0, y: 0 }
        };
        gameState.players.push(player);
    },
    setPlayer: function (id, data) {
        var playerIndex = gameState.players.findIndex(function (player) { return player.id === id; });
        var player = gameState.players[playerIndex];
        if (!player)
            return;
        if (data.position) {
            player.position = data.position;
            player.phaserObject.setX(data.position.x);
            player.phaserObject.setY(data.position.y);
        }
        if (data.velocity) {
            player.velocity = data.velocity;
            player.phaserObject.setVelocityX(player.velocity.x);
            player.phaserObject.setVelocityY(player.velocity.y);
        }
    }
};
exports.gameMethods = gameMethods;
