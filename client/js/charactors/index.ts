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
import skins from '../skins/index'

export interface AnimConfig {
  key: string,
  frames: number[]
}
export interface Charactor {
  key: string,
  skin: string,
  unit: string,
  velocity?: number,
  maxHealth?: number,
  vision: number,
  shootType: string,
  shootInterval: number
}

const charactors = { skull, tinyZombie, wizzardMale, knightFemale, orge, chort, giantDemon, giantZombie, lizardFemale, elfFemale, elfMale }

Object.keys(charactors).forEach(
  key => {
    const char = charactors[key]
    const skin = skins[char.skin]
    const weight = skin.matterConfig.size.width * skin.matterConfig.size.height
    if (char.velocity === undefined) {
      if (weight > 450) {
        char.velocity = 1
      } else {
        char.velocity = 2
      }
    }
    if (char.maxHealth === undefined) {
      char.maxHealth = Math.round(weight / 5)
    }
  }
)

export default charactors