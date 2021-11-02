import collisionCategories from '../scene/basescene/collisionCategories'
import { getLocalUserData } from '../user'
import { tab } from './tab'
import { throws } from './throws'
import { rain } from './rain'
import { spin } from './spin'
import { shoot } from './shoot'
import { summon } from './summon'

export const itemsStorageKey = 'items_storage'

export const actions = {
  tab,
  throws,
  rain,
  spin,
  shoot,
  summon
}

export const perform = (scene, performer, action, target, options) => {
  if (!scene[itemsStorageKey]) {
    scene[itemsStorageKey] = {}
  }
  const itemStorage = scene[itemsStorageKey]
  let collisionCategory
  let collisionTargets
  if (performer.interface === 'Monster') {
    collisionCategory = collisionCategories.CATEGORY_MOSNTER_BULLET
    collisionTargets = [
      collisionCategories.CATEGORY_TEAM_RED_PLAYER,
      collisionCategories.CATEGORY_TEAM_BLUE_PLAYER,
      collisionCategories.CATEGORY_MAP_BLOCK
    ]
  } else {
    if (performer.team === 'red') {
      collisionCategory = collisionCategories.CATEGORY_TEAM_RED_BULLET
      collisionTargets = [
        collisionCategories.CATEGORY_TEAM_BLUE_PLAYER,
        collisionCategories.CATEGORY_MAP_BLOCK,
        collisionCategories.CATEGORY_MONSTER
      ]
    } else if (performer.team === 'blue') {
      collisionCategory = collisionCategories.CATEGORY_TEAM_BLUE_BULLET
      collisionTargets = [
        collisionCategories.CATEGORY_TEAM_RED_PLAYER,
        collisionCategories.CATEGORY_MAP_BLOCK,
        collisionCategories.CATEGORY_MONSTER
      ]
    }
  }

  actions[action]({
    scene,
    itemStorage,
    performer,
    target,
    collisionCategory,
    collisionTargets,
    options
  })
}

