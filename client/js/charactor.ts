import zoombieSpriteUrl from '../statics/tile/anim_sprite/big_zoombie.png'
import demonSpriteUrl from '../statics/tile/anim_sprite/big_demon.png'
import lizardFemaleSpriteUrl from '../statics/tile/anim_sprite/female_lizard.png'

export interface Charactor {
  key: string,
  preloadAssets(arg: any): void,
  createAnims(arg: any): void,
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

interface CharConfig {
  size: { width: number, height: number },
  origin: { x: number, y: number },
  animKey: string
}
const configToScene = (config: CharConfig) => (scene, x, y) => {
  const { size, origin, animKey } = config
  const phaserObject = scene.matter.add.sprite(x, y)
  phaserObject.setBody({
    type: 'rectangle',
    width: size.width,
    height: size.height
  })
  phaserObject.setOrigin(origin.x, origin.y)
  phaserObject.setFixedRotation()
  phaserObject.setCollisionGroup(-1)
  phaserObject.play(animKey)
  phaserObject.setDepth(3)
  return phaserObject
}

const gzStr = getCharString('giant_zombie')
export const giantZombie: Charactor = {
  key: 'giant_zombie',
  preloadAssets: scene => {
    scene.load.spritesheet(gzStr.sprite, zoombieSpriteUrl, { frameWidth: 32, frameHeight: 34 })
  },
  createAnims: scene => {
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
  addToScene: configToScene({
    size: { width: 16, height: 30 },
    origin: { x: 0.5, y: 0.6 },
    animKey: gzStr.animations.idle
  }),
  animations: {
    idle: gzStr.animations.idle,
    move: gzStr.animations.move
  }
}


const gdStr = getCharString('giant_demon')
export const giantDemon: Charactor = {
  key: 'giant_zombie',
  preloadAssets: scene => {
    scene.load.spritesheet(gdStr.sprite, demonSpriteUrl, { frameWidth: 32, frameHeight: 34 })
  },
  createAnims: scene => {
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
  addToScene: configToScene({
    size: { width: 16, height: 30 },
    origin: { x: 0.5, y: 0.6 },
    animKey: gdStr.animations.idle
  }),
  animations: {
    idle: gdStr.animations.idle,
    move: gdStr.animations.move
  }
}

const flzStr = getCharString('lizard_female')
export const lizardFemale: Charactor = {
  key: 'lizard_female',
  preloadAssets: scene => {
    scene.load.spritesheet(flzStr.sprite, lizardFemaleSpriteUrl, { frameWidth: 16, frameHeight: 28 })
  },
  createAnims: scene => {
    scene.anims.create({
      key: flzStr.animations.idle,
      frames: scene.anims.generateFrameNumbers(flzStr.sprite, { frames: [1, 2, 3, 4] }),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: flzStr.animations.move,
      frames: scene.anims.generateFrameNumbers(flzStr.sprite, { frames: [5, 6, 7, 8] }),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: flzStr.animations.hit,
      frames: scene.anims.generateFrameNumbers(flzStr.sprite, { frames: [1, 0, 1] }),
      frameRate: 8,
      repeat: -1
    });
  },
  addToScene: configToScene({
    size: { width: 16, height: 16 },
    origin: { x: 0.5, y: 0.7 },
    animKey: flzStr.animations.idle
  }),
  animations: {
    idle: flzStr.animations.idle,
    move: flzStr.animations.move,
    hit: flzStr.animations.hit
  }
}


export default { giantZombie, giantDemon, lizardFemale }