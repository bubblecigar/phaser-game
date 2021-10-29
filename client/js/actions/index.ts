import collisionCategories from './collisionCategories'
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
      collisionCategories.CATEGORY_PLAYER,
      collisionCategories.CATEGORY_MAP_BLOCK
    ]
  } else {
    if (performer.id === getLocalUserData().userId) {
      collisionCategory = collisionCategories.CATEGORY_PLAYER_BULLET
    } else {
      collisionCategory = collisionCategories.CATEGORY_ENEMY_BULLET
    }
    collisionTargets = [
      collisionCategories.CATEGORY_PLAYER,
      collisionCategories.CATEGORY_MAP_BLOCK,
      collisionCategories.CATEGORY_MONSTER
    ]
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

