import { Charactor } from '.'
import SpriteUrl from '../../statics/tile/anim_sprite/tiny_zombie.png'

const key = 'tiny_zombie'
const charactor: Charactor = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: SpriteUrl,
    options: {
      frameWidth: 16,
      frameHeight: 16
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
    size: { width: 10, height: 10 },
    origin: { x: 0.5, y: 0.7 }
  },
  velocity: 1,
  shootType: ''
}

export default charactor