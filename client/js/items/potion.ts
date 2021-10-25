import { Bullet } from '.'
import spriteUrl from '../../statics/tile/anim_sprite/potions.png'

const key = 'potion'
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
      width: 8,
      height: 12
    },
    origin: {
      x: 0.5, y: 0.5
    }
  }
}

export default item