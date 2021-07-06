import zoombieSpriteUrl from '../statics/tile/anim_sprite/big_zoombie.png'
import demonSpriteUrl from '../statics/tile/anim_sprite/big_demon.png'

export interface Charactor {
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

const getCharString = (char: string) => ({
  sprite: `${char}_sprite`,
  animations: {
    idle: `${char}_idle`,
    move: `${char}_move`,
    hit: `${char}_hit`
  }
})

const gzStr = getCharString('giant_zombie')
export const giantZombie: Charactor = {
  key: 'giant_zombie',
  preload: scene => {
    scene.load.spritesheet(gzStr.sprite, zoombieSpriteUrl, { frameWidth: 32, frameHeight: 34 })
  },
  create: scene => {
    scene.anims.create({
      key: gzStr.animations.idle,
      frames: scene.anims.generateFrameNumbers(gzStr.sprite, { frames: [0, 1, 2, 3] }),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: gzStr.animations.move,
      frames: scene.anims.generateFrameNumbers(gzStr.sprite, { frames: [4, 5, 6, 7] }),
      frameRate: 8,
      repeat: -1
    });
  },
  addToScene: (scene, x, y) => {
    const phaserObject = scene.physics.add.sprite(x, y)
    phaserObject.body.setSize(16, 24)
    phaserObject.body.setOffset(8, 10)
    phaserObject.play(gzStr.animations.idle)
    phaserObject.setDepth(3)
    phaserObject.setCollideWorldBounds(true)
    return phaserObject
  },
  animations: {
    idle: gzStr.animations.idle,
    move: gzStr.animations.move
  }
}


const gdStr = getCharString('giant_demon')
export const giantDemon: Charactor = {
  key: 'giant_zombie',
  preload: scene => {
    scene.load.spritesheet(gdStr.sprite, demonSpriteUrl, { frameWidth: 32, frameHeight: 34 })
  },
  create: scene => {
    scene.anims.create({
      key: gdStr.animations.idle,
      frames: scene.anims.generateFrameNumbers(gdStr.sprite, { frames: [0, 1, 2, 3] }),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: gdStr.animations.move,
      frames: scene.anims.generateFrameNumbers(gdStr.sprite, { frames: [4, 5, 6, 7] }),
      frameRate: 8,
      repeat: -1
    });
  },
  addToScene: (scene, x, y) => {
    const phaserObject = scene.physics.add.sprite(x, y)
    phaserObject.body.setSize(16, 24)
    phaserObject.body.setOffset(8, 10)
    phaserObject.play(gdStr.animations.idle)
    phaserObject.setDepth(3)
    phaserObject.setCollideWorldBounds(true)
    return phaserObject
  },
  animations: {
    idle: gdStr.animations.idle,
    move: gdStr.animations.move
  }
}

export default { giantZombie, giantDemon }