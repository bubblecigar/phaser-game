import { Skin } from '.'
import SpriteUrl from '../../statics/tile/anim_sprite/orge.png'

const key = 'orge'
const Skin: Skin = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: SpriteUrl,
    options: {
      frameWidth: 32,
      frameHeight: 32
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
    size: { width: 20, height: 28 },
    origin: { x: 0.5, y: 0.6 }
  }
}

export default Skin