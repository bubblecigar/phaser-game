import coin from './coin'
import arrow from './arrow'
import dagger from './dagger'
import hammer from './hammer'

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

const items = { coin, hammer, arrow, dagger }

export default items