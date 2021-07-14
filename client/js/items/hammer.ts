import { Bullet } from '.'
import spriteUrl from '../../statics/tile/anim_sprite/weapon_big_hammer.png'

const key = 'hammer'
const item: Bullet = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: spriteUrl,
    options: {
      frameWidth: 10,
      frameHeight: 37
    }
  },
  animsConfig: {},
  matterConfig: {
    type: 'rectangle',
    size: {
      width: 10,
      height: 37
    },
    origin: {
      x: 0.5, y: 0.5
    }
  }
}

export default item