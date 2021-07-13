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

export interface AnimConfig {
  key: string,
  frames: number[]
}
export interface Charactor {
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
  },
  velocity?: number,
  maxHealth?: number,
  bullet?: string
}

const charactors = { skull, tinyZombie, wizzardMale, knightFemale, orge, chort, giantDemon, giantZombie, lizardFemale, elfFemale, elfMale }

Object.keys(charactors).forEach(
  key => {
    const char = charactors[key]
    const weight = char.matterConfig.size.width * char.matterConfig.size.height
    if (char.velocity === undefined) {
      if (weight > 500) {
        char.velocity = 1
      } else {
        char.velocity = 2 + Math.round((500 - weight) / 100)
      }
    }
    if (char.maxHealth === undefined) {
      char.maxHealth = Math.round(weight / 5)
    }
    if (char.bullet === undefined) {
      char.bullet = 'arrow'
      if (weight < 200) {
        // no bullet
      } else if (weight < 300) {
        //dagger
      } else if (weight < 400) {
        // arrow
      } else if (weight < 500) {
        //
      } else {
        // giant
      }
    }
  }
)

export default charactors