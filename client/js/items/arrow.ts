import { Bullet } from '.'
import spriteUrl from '../../statics/tile/anim_sprite/weapon_arrow.png'

const key = 'arrow'
const item: Bullet = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: spriteUrl,
    options: {
      frameWidth: 7,
      frameHeight: 21
    }
  },
  animsConfig: {},
  matterConfig: {
    type: 'rectangle',
    size: {
      width: 4,
      height: 20
    },
    origin: {
      x: 0.5, y: 0.5
    }
  },
  damage: 5
}

export default item