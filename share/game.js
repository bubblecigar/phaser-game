"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    canvasHeight: 300
};
exports.gameConfig = gameConfig;
var createPlayerMatter = function (variables, player) {
    var scene = variables.scene, charactors = variables.charactors;
    var charactor = charactors[player.charactorKey];
    var _a = charactor.matterConfig, size = _a.size, origin = _a.origin;
    var _b = player.position, x = _b.x, y = _b.y;
    var Bodies = variables.Phaser.Physics.Matter.Matter.Bodies;
    var rect = Bodies.rectangle(x, y, size.width, size.height, { label: 'player-body' });
    var sensor = Bodies.circle(x, y, 1, { isSensor: true, label: 'body-sensor' });
    var compound = variables.Phaser.Physics.Matter.Matter.Body.create({
        parts: [sensor, rect],
        inertia: Infinity
    });
    var phaserObject = scene.matter.add.sprite(x, y, undefined, undefined, {
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0
    });
    phaserObject.setExistingBody(compound);
    phaserObject.setOrigin(origin.x, origin.y);
    phaserObject.setCollisionGroup(-1);
    phaserObject.play(charactor.animsConfig.idle.key);
    phaserObject.setDepth(3);
    phaserObject.setData(player);
    return phaserObject;
};
var createBulletMatter = function (variables, bulletConstructor) {
    var scene = variables.scene, items = variables.items;
    var bullet = items[bulletConstructor.itemKey];
    var _a = bullet.matterConfig, size = _a.size, origin = _a.origin;
    var _b = bulletConstructor.position, x = _b.x, y = _b.y;
    var Bodies = variables.Phaser.Physics.Matter.Matter.Bodies;
    var body;
    if (bullet.matterConfig.type === 'circle') {
        body = Bodies.circle(x, y, size.radius);
    }
    else if (bullet.matterConfig.type === 'rectangle') {
        body = Bodies.rectangle(x, y, size.width, size.height);
    }
    else {
        return; // creation fail
    }
    var phaserObject = scene.matter.add.sprite(x, y, bullet.spritesheetConfig.spritesheetKey);
    phaserObject.setExistingBody(body);
    bullet.animsConfig.idle && phaserObject.play(bullet.animsConfig.idle.key);
    phaserObject.setOrigin(origin.x, origin.y);
    phaserObject.setSensor(true);
    phaserObject.setData(__assign(__assign({}, bulletConstructor), { phaserObject: phaserObject }));
    phaserObject.setVelocityX(bulletConstructor.velocity.x);
    phaserObject.setVelocityY(bulletConstructor.velocity.y);
    var angle = Math.atan2(bulletConstructor.velocity.y, bulletConstructor.velocity.x);
    var degree = 90 + 180 * angle / Math.PI;
    phaserObject.setAngle(degree);
    if (bullet.angularVelocity) {
        phaserObject.setAngularVelocity(bullet.angularVelocity);
    }
    setTimeout(function () { return bulletConstructor.phaserObject.destroy(); }, bullet.duration || 1000);
    return phaserObject;
};
var createItemMatter = function (variables, itemConstructor) {
    var scene = variables.scene, items = variables.items;
    var item = items[itemConstructor.itemKey];
    var _a = item.matterConfig, size = _a.size, origin = _a.origin;
    var _b = itemConstructor.position, x = _b.x, y = _b.y;
    var Bodies = variables.Phaser.Physics.Matter.Matter.Bodies;
    var body;
    if (item.matterConfig.type === 'circle') {
        body = Bodies.circle(x, y, size.radius);
    }
    else if (item.matterConfig.type === 'rectangle') {
        body = Bodies.rectangle(x, y, size.width, size.height);
    }
    else {
        return; // creation fail
    }
    var phaserObject = scene.matter.add.sprite(x, y, item.spritesheetConfig.spritesheetKey);
    phaserObject.setExistingBody(body);
    item.animsConfig.idle && phaserObject.play(item.animsConfig.idle.key);
    phaserObject.setOrigin(origin.x, origin.y);
    phaserObject.setSensor(true);
    phaserObject.setData(itemConstructor);
    phaserObject.setVelocityX(itemConstructor.velocity.x);
    phaserObject.setVelocityY(itemConstructor.velocity.y);
    var angle = Math.atan2(itemConstructor.velocity.y, itemConstructor.velocity.x);
    var degree = 90 + 180 * angle / Math.PI;
    phaserObject.setAngle(degree);
    return phaserObject;
};
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
        setPlayer: function (playerConstructor) {
            methods.removePlayer(playerConstructor.id);
            methods.addPlayer(playerConstructor);
        },
        addPlayer: function (playerConstructor) {
            var playerAlreadyExist = gameState.players.some(function (player) { return player.id === playerConstructor.id; });
            if (playerAlreadyExist) {
                console.log('player already exist');
                return;
            }
            var player = playerConstructor;
            gameState.players.push(player);
            if (env === 'client') {
                var scene = variables.scene;
                if (!scene) {
                    console.log('not initialize');
                    return;
                }
                player.phaserObject = createPlayerMatter(variables, player);
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
        movePlayer: function (_player) {
            var player = methods.getPlayer(_player.id);
            if (!player) {
                return;
            }
            var changeDirection = !(_player.velocity.x === player.velocity.x
                && _player.velocity.y === player.velocity.y);
            player.position = _player.position;
            player.velocity = _player.velocity;
            if (env === 'client') {
                if (!player.phaserObject) {
                    console.log('player not initialized');
                    return;
                }
                player.phaserObject.setVelocityX(player.velocity.x);
                player.phaserObject.setVelocityY(player.velocity.y);
                if (player.id !== variables.userId) {
                    player.phaserObject.setX(player.position.x);
                    player.phaserObject.setY(player.position.y);
                }
                player.position = { x: player.phaserObject.x, y: player.phaserObject.y };
                player.velocity = { x: player.phaserObject.body.velocity.x, y: player.phaserObject.body.velocity.y };
                if (changeDirection) {
                    if (player.velocity.x === 0 && player.velocity.y === 0) {
                        player.phaserObject.play(variables.charactors[player.charactorKey].animsConfig.idle.key);
                    }
                    else {
                        player.phaserObject.play(variables.charactors[player.charactorKey].animsConfig.move.key);
                        if (player.velocity.x > 0) {
                            player.phaserObject.setFlipX(false);
                        }
                        else if (player.velocity.x < 0) {
                            player.phaserObject.setFlipX(true);
                        }
                    }
                }
            }
        },
        getItem: function (id) { return gameState.items.find(function (p) { return p.id === id; }); },
        shootInClient: function (bulletConstructor) {
            if (env === 'client') {
                var scene = variables.scene;
                if (!scene) {
                    console.log('not initialize');
                    return;
                }
                bulletConstructor.phaserObject = createBulletMatter(variables, bulletConstructor);
            }
        },
        onHit: function (playerId, bullet) {
            var player = methods.getPlayer(playerId);
            player.health -= bullet.damage;
            if (player.health <= 0) {
                player.health = 0;
                var ghostCharactor = __assign(__assign({}, player), { charactorKey: 'skull', velocity: { x: 0, y: 0 }, phaserObject: null, health: 0, items: [], coins: 0 });
                methods.setPlayer(ghostCharactor);
            }
        },
        addItem: function (itemConstructor) {
            var id = itemConstructor.id, position = itemConstructor.position, itemKey = itemConstructor.itemKey, velocity = itemConstructor.velocity;
            var item = {
                interface: 'Item',
                id: id,
                position: position,
                itemKey: itemKey,
                velocity: velocity,
                phaserObject: null
            };
            gameState.items.push(item);
            if (env === 'client') {
                var scene = variables.scene;
                if (!scene) {
                    console.log('not initialize');
                    return;
                }
                var phaserObject = createItemMatter(variables, itemConstructor);
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
        collectItem: function (playerId, item) {
            var player = methods.getPlayer(playerId);
            if (!player) {
                console.log('no player for collectItem');
                return;
            }
            switch (item.itemKey) {
                case 'coin': {
                    player.coins++;
                    break;
                }
                default: {
                    console.log('unhandled itemKey');
                }
            }
            methods.removeItem(item.id);
        },
        interact: function (player, item, action) {
            if (action === void 0) { action = 'default'; }
            console.log(player);
            console.log(item);
        }
    };
    return methods;
}; };
exports.gameMethods = gameMethods;
