"use strict";
exports.__esModule = true;
exports.gameMethods = exports.gameState = exports.gameConfig = void 0;
var gameState = {
    scene: null,
    players: []
};
exports.gameState = gameState;
var gameConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    playerVelocity: 300
};
exports.gameConfig = gameConfig;
var gameMethods = function (env) { return ({
    addPlayer: function (p, icon, id) {
        var playerAlreadyExist = gameState.players.some(function (player) { return player.id === id; });
        if (playerAlreadyExist) {
            console.log('player already exist');
            return;
        }
        var player = {
            id: id,
            phaserObject: null,
            position: p,
            velocity: { x: 0, y: 0 }
        };
        gameState.players.push(player);
        if (env === 'client') {
            var scene = gameState.scene;
            if (!scene) {
                console.log('not initialize');
                return;
            }
            var phaserObject = scene.physics.add.image(p.x, p.y, icon);
            phaserObject.setDepth(3);
            phaserObject.setCollideWorldBounds(true);
            player.phaserObject = phaserObject;
        }
    },
    removePlayer: function (id) {
        gameState.players = gameState.players.filter(function (player) { return player.id !== id; });
        if (env === 'client') {
            // remove object on canvas
        }
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
}); };
exports.gameMethods = gameMethods;
