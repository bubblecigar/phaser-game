import { Item } from './Items'
import spriteUrl from '../../statics/tile/anim_sprite/weapon_arrow.png'

const key = 'arrow'
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
  }
}

export default item