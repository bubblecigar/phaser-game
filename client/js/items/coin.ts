import { Item } from '.'
import spriteUrl from '../../statics/tile/anim_sprite/coin.png'

const key = 'coin'
const item: Item = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: spriteUrl,
    options: {
      frameWidth: 8,
      frameHeight: 8
    }
  },
  animsConfig: {
    idle: {
      key: `${key}_idle`,
      frames: [0, 1, 2, 3]
    }
  },
  matterConfig: {
    type: 'circle',
    size: {
      radius: 4
    },
    origin: {
      x: 0.5, y: 0.5
    }
  }
}

export default item