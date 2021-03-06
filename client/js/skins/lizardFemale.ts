import { Skin } from '.'
import lizardFemaleSpriteUrl from '../../statics/tile/anim_sprite/female_lizard.png'

const key = 'lizardFemale'
const Skin: Skin = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: lizardFemaleSpriteUrl,
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
  }
}

export default Skin