import { Bullet } from '.'
import spriteUrl from '../../statics/tile/anim_sprite/muddy.png'

const key = 'muddy'
const item: Bullet = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: spriteUrl,
    options: {
      frameWidth: 16,
      frameHeight: 16
    }
  },
  animsConfig: {
    idle: {
      key: `${key}_idle`,
      frames: [0, 1, 2, 3]
    }
  },
  matterConfig: {
    type: 'rectangle',
    size: {
      width: 14,
      height: 14
    },
    origin: {
      x: 0.5, y: 0.5
    }
  }
}

export default item