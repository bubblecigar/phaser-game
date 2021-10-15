import zombieSpriteUrl from '../../statics/tile/anim_sprite/big_zoombie.png'
import { Charactor } from '.'

const createCharactor = (key, spritesheetUrl): Charactor => ({
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl,
    options: {
      frameWidth: 32,
      frameHeight: 34
    }
  },
  animsConfig: {
    idle: {
      key: `${key}_idle`,
      frames: [0, 1, 2, 3]
    },
    move: {
      key: `${key}_move`,
      frames: [4, 5, 6, 7]
    }
  },
  matterConfig: {
    size: { width: 16, height: 30 },
    origin: { x: 0.5, y: 0.6 }
  },
  shootType: 'potion'
})

export default createCharactor('giant_zombie', zombieSpriteUrl)