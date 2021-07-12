import coin from './coin'

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

const items = { coin }

export default items