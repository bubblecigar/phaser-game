import { Bullet } from '.'
import spriteUrl from '../../statics/tile/anim_sprite/fireball.png'

const key = 'fireball'
const item: Bullet = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: spriteUrl,
    options: {
      frameWidth: 8,
      frameHeight: 14
    }
  },
  animsConfig: {
    idle: {
      key: `${key}_idle`,
      frames: [0, 1, 2, 1]
    }
  },
  matterConfig: {
    type: 'rectangle',
    size: {
      width: 8,
      height: 14
    },
    origin: {
      x: 0.5, y: 0.5
    }
  }
}

export default item