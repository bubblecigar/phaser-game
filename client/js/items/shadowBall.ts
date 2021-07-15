import { Bullet } from '.'
import spriteUrl from '../../statics/tile/anim_sprite/shadow_ball.png'

const key = 'shadow_ball'
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
      frames: [0, 1, 2, 3]
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