import zoombieSpriteUrl from '../statics/tile/anim_sprite/big_zoombie.png'

interface Charactor {
  key: string,
  preload(arg: any): void,
  create(arg: any): void,
  addToScene(arg: any, x: number, y: number): object,
  animations: {
    idle: string,
    move: string,
    hit?: string
  }
}

export const giantZombie: Charactor = {
  key: 'giant_zombie',
  preload: scene => {
    scene.load.spritesheet('zoombie_sprite', zoombieSpriteUrl, { frameWidth: 32, frameHeight: 34 })
  },
  create: scene => {
    scene.anims.create({
      key: 'giant_zombie_idle',
      frames: scene.anims.generateFrameNumbers('zoombie_sprite', { frames: [0, 1, 2, 3] }),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: 'giant_zombie_move',
      frames: scene.anims.generateFrameNumbers('zoombie_sprite', { frames: [4, 5, 6, 7] }),
      frameRate: 8,
      repeat: -1
    });
  },
  addToScene: (scene, x, y) => {
    const phaserObject = scene.physics.add.sprite(x, y)
    phaserObject.body.setSize(16, 24)
    phaserObject.body.setOffset(8, 10)
    phaserObject.play('idle')
    phaserObject.setDepth(3)
    phaserObject.setCollideWorldBounds(true)
    return phaserObject
  },
  animations: {
    idle: 'giant_zombie_idle',
    move: 'giant_zombie_move'
  }
}