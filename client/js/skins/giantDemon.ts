import demonSpriteUrl from '../../statics/tile/anim_sprite/big_demon.png'
import { Skin } from '.'

const createSkin = (key, spritesheetUrl): Skin => ({
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
  }
})

export default createSkin('giantDemon', demonSpriteUrl)