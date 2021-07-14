import { Bullet } from '.'
import spriteUrl from '../../statics/tile/anim_sprite/weapon_knife.png'

const key = 'dagger'
const item: Bullet = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: spriteUrl,
    options: {
      frameWidth: 6,
      frameHeight: 13
    }
  },
  animsConfig: {},
  matterConfig: {
    type: 'rectangle',
    size: {
      width: 6,
      height: 13
    },
    origin: {
      x: 0.5, y: 0.5
    }
  },
  damage: 3
}

export default item