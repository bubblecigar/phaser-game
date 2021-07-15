import { Bullet } from '.'
import spriteUrl from '../../statics/tile/anim_sprite/ice_flask.png'

const key = 'ice_flask'
const item: Bullet = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: spriteUrl,
    options: {
      frameWidth: 21,
      frameHeight: 21
    }
  },
  animsConfig: {
    idle: {
      key: `${key}_idle`,
      frames: [0, 1]
    }
  },
  matterConfig: {
    type: 'circle',
    size: {
      radius: 10
    },
    origin: {
      x: 0.5, y: 0.5
    }
  }
}

export default item