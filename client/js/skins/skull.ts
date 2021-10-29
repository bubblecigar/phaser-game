import { Skin } from '.'
import SpriteUrl from '../../statics/tile/skull.png'

const key = 'skull'
const Skin: Skin = {
  key,
  spritesheetConfig: {
    spritesheetKey: `${key}_sprite`,
    spritesheetUrl: SpriteUrl,
    options: {
      frameWidth: 16,
      frameHeight: 16
    }
  },
  animsConfig: {
    idle: {
      key: `${key}_idle`,
      frames: [0]
    },
    move: {
      key: `${key}_move`,
      frames: [0]
    }
  },
  matterConfig: {
    size: { width: 10, height: 10 },
    origin: { x: 0.5, y: 0.7 }
  }
}

export default Skin