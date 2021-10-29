import coin from './coin'
import arrow from './arrow'
import dagger from './dagger'
import fireball from './fireball'
import iceFlask from './iceFlask'
import shadowBall from './shadowBall'
import potion from './potion'
import muddy from './muddy'

export interface AnimConfig {
  key: string,
  frames: number[]
}
export interface Item {
  key: string,
  spritesheetConfig: {
    spritesheetKey: string,
    spritesheetUrl: string,
    options: {
      frameWidth: number,
      frameHeight: number
    }
  },
  animsConfig: {
    idle?: AnimConfig
  },
  matterConfig: {
    type: 'rectangle' | 'circle',
    size: {
      width?: number, height?: number, radius?: number
    },
    origin: {
      x: number, y: number
    }
  }
}

export interface Bullet extends Item {

}

const items = { shadowBall, iceFlask, fireball, coin, arrow, dagger, potion, muddy }

export default items