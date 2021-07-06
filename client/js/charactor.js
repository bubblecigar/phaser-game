"use strict";
exports.__esModule = true;
exports.giantZombie = void 0;
var big_zoombie_png_1 = require("../statics/tile/anim_sprite/big_zoombie.png");
exports.giantZombie = {
    key: 'giant_zombie',
    preload: function (scene) {
        scene.load.spritesheet('zoombie_sprite', big_zoombie_png_1["default"], { frameWidth: 32, frameHeight: 34 });
    },
    create: function (scene) {
        scene.anims.create({
            key: 'giant_zombie_idle',
            frames: scene.anims.generateFrameNumbers('zoombie_sprite', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'giant_zombie_move',
            frames: scene.anims.generateFrameNumbers('zoombie_sprite', { frames: [4, 5, 6, 7] }),
            frameRate: 8,
            repeat: -1
        });
    },
    addToScene: function (scene, x, y) {
        var phaserObject = scene.physics.add.sprite(x, y);
        phaserObject.body.setSize(16, 24);
        phaserObject.body.setOffset(8, 10);
        phaserObject.play('idle');
        phaserObject.setDepth(3);
        phaserObject.setCollideWorldBounds(true);
        return phaserObject;
    },
    animations: {
        idle: 'giant_zombie_idle',
        move: 'giant_zombie_move'
    }
};
