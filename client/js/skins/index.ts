import giantDemon from './giantDemon'
import giantZombie from './giantZombie'
import lizardFemale from './lizardFemale'
import elfFemale from './elfFemale'
import elfMale from './elfMale'
import chort from './chort'
import orge from './orge'
import wizzardMale from './wizzardMale'
import knightFemale from './knightFemale'
import tinyZombie from './tinyZombie'
import skull from './skull'
import imp from './imp'
import skeleton from './skeleton'

export interface AnimConfig {
  key: string,
  frames: number[]
}
export interface Skin {
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
    idle: AnimConfig,
    move: AnimConfig,
    hit?: AnimConfig
  },
  matterConfig: {
    size: {
      width: number, height: number
    },
    origin: {
      x: number, y: number
    }
  }
}

const skins = { skull, tinyZombie, wizzardMale, knightFemale, orge, chort, giantDemon, giantZombie, lizardFemale, elfFemale, elfMale, imp, skeleton }


export default skins