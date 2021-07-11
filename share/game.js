"use strict";
exports.__esModule = true;
exports.gameMethods = exports.gameState = exports.gameConfig = void 0;
var gameState = {
    mapConfigKey: '',
    players: [],
    items: []
};
exports.gameState = gameState;
var gameConfig = {
    canvasWidth: 400,
    canvasHeight: 300,
    playerVelocity: 3
};
exports.gameConfig = gameConfig;
var gameMethods = function (env) { return function (variables) {
    var methods = {
        init: function () {
            gameState.players = [];
            gameState.items = [];
        },
        emitGameStateFromServer: function (gameState) {
            methods.syncPlayers(gameState.players);
            methods.syncItems(gameState.items);
        },
        syncMap: function (mapConfigKey) {
            gameState.mapConfigKey = mapConfigKey;
            if (env === 'client') {
                methods.init();
                variables.scene.scene.restart({ mapConfigKey: mapConfigKey });
            }
        },
        syncPlayers: function (players) {
            if (env === 'client') {
                gameState.players.forEach(function (player) {
                    methods.removePlayer(player.id);
                });
                gameState.players = [];
                players.forEach(function (player) {
                    methods.addPlayer(player);
                });
            }
        },
        syncItems: function (items) {
            if (env === 'client') {
                gameState.items.forEach(function (item) {
                    methods.removeItem(item.id);
                });
                gameState.items = [];
                items.forEach(function (item) {
                    methods.addItem(item);
                });
            }
        },
        addPlayer: function (playerConstructor) {
            var position = playerConstructor.position, velocity = playerConstructor.velocity, charactorKey = playerConstructor.charactorKey, id = playerConstructor.id;
            var playerAlreadyExist = gameState.players.some(function (player) { return player.id === id; });
            if (playerAlreadyExist) {
                console.log('player already exist');
                return;
            }
            var player = {
                interface: 'Player',
                id: id,
                charactorKey: charactorKey,
                position: position,
                velocity: velocity,
                health: 100,
                items: [],
                phaserObject: null
            };
            gameState.players.push(player);
            if (env === 'client') {
                var scene = variables.scene;
                if (!scene) {
                    console.log('not initialize');
                    return;
                }
                var charactor = variables.charactors[player.charactorKey];
                player.phaserObject = charactor.addToScene(scene, position.x, position.y);
                player.phaserObject.setData(player);
                if (playerConstructor.id === variables.userId) {
                    var camera = scene.cameras.main;
                    camera.startFollow(player.phaserObject, true, 0.5, 0.5);
                    var Phaser = variables.Phaser;
                    var circle = new Phaser.GameObjects.Graphics(scene).fillCircle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, 100);
                    var mask = new Phaser.Display.Masks.GeometryMask(scene, circle);
                    camera.setMask(mask);
                }
            }
        },
        removePlayer: function (id) {
            var playerIndex = gameState.players.findIndex(function (player) { return player.id === id; });
            var player = gameState.players[playerIndex];
            if (!player) {
                console.log('no such player');
                return;
            }
            gameState.players = gameState.players.filter(function (player) { return player.id !== id; });
            if (env === 'client') {
                player.phaserObject.destroy();
            }
        },
        getPlayer: function (id) { return gameState.players.find(function (p) { return p.id === id; }); },
        movePlayer: function (id, data) {
            var player = methods.getPlayer(id);
            if (!player) {
                console.log('player not found');
                return;
            }
            var changeDirection = !(data.velocity.x === player.velocity.x
                && data.velocity.y === player.velocity.y);
            if (data.position) {
                player.position = data.position;
            }
            if (data.velocity) {
                player.velocity = data.velocity;
            }
            if (env === 'client') {
                if (data.position) {
                    player.phaserObject.setX(player.position.x);
                    player.phaserObject.setY(player.position.y);
                }
                if (data.velocity) {
                    player.phaserObject.setVelocityX(player.velocity.x);
                    player.phaserObject.setVelocityY(player.velocity.y);
                }
                player.position = { x: player.phaserObject.x, y: player.phaserObject.y };
                player.velocity = { x: player.phaserObject.body.velocity.x, y: player.phaserObject.body.velocity.y };
                if (changeDirection) {
                    if (player.velocity.x === 0 && player.velocity.y === 0) {
                        player.phaserObject.play(variables.charactors[player.charactorKey].animations.idle);
                    }
                    else {
                        player.phaserObject.play(variables.charactors[player.charactorKey].animations.move);
                        if (player.velocity.x >= 0) {
                            player.phaserObject.setFlipX(false);
                        }
                        else {
                            player.phaserObject.setFlipX(true);
                        }
                    }
                }
            }
        },
        addItem: function (itemConstructor) {
            var builderId = itemConstructor.builderId, id = itemConstructor.id, key = itemConstructor.key, icon = itemConstructor.icon, type = itemConstructor.type, position = itemConstructor.position;
            var builder = methods.getPlayer(builderId);
            var item = {
                interface: 'PlayerItem',
                id: id,
                key: key,
                builderId: builderId,
                position: position,
                icon: icon,
                type: type,
                phaserObject: null
            };
            gameState.items.push(item);
            if (env === 'client') {
                var scene = variables.scene;
                if (!scene) {
                    console.log('not initialize');
                    return;
                }
                var phaserObject = scene.matter.add.image(position.x, position.y, icon, undefined, { isStatic: true });
                item.phaserObject = phaserObject;
                item.phaserObject.setData(item);
            }
            return item;
        },
        removeItem: function (id) {
            var itemIndex = gameState.items.findIndex(function (item) { return item.id === id; });
            var item = gameState.items[itemIndex];
            if (!item) {
                console.log('no such item');
                return;
            }
            gameState.items = gameState.items.filter(function (item) { return item.id !== id; });
            if (env === 'client') {
                item.phaserObject.destroy();
            }
        },
        interact: function (player, item, action) {
            if (action === void 0) { action = 'default'; }
            if (item.key === 'player-bomb' && action === 'default') {
                methods.removeItem(item.id);
            }
        }
    };
    return methods;
}; };
exports.gameMethods = gameMethods;
