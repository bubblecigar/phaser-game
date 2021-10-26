import { Charactor } from '.'
import SpriteUrl from '../../statics/tile/anim_sprite/chort.png'

const key = 'chort'
const charactor: Charactor = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: SpriteUrl,
    options: {
      frameWidth: 16,
      frameHeight: 24
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
    size: { width: 12, height: 20 },
    origin: { x: 0.5, y: 0.6 }
  },
  shootType: 'fireball',
  shootInterval: 500,
  velocity: 3,
  vision: 150
}

export default charactor