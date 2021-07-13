import { Charactor } from './Charactors'
import SpriteUrl from '../../statics/tile/anim_sprite/elf_male.png'

const key = 'elf_male'
const charactor: Charactor = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: SpriteUrl,
    options: {
      frameWidth: 16,
      frameHeight: 28
    }
  },
  animsConfig: {
    idle: {
      key: `${key}_idle`,
      frames: [1, 2, 3, 4]
    },
    move: {
      key: `${key}_move`,
      frames: [5, 6, 7, 8]
    },
    hit: {
      key: `${key}_hit`,
      frames: [1, 0, 1]
    }
  },
  matterConfig: {
    size: { width: 16, height: 16 },
    origin: { x: 0.5, y: 0.7 }
  },
  bullet: 'arrow'
}

export default charactor