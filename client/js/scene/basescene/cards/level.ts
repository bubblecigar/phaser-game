import _ from 'lodash'
import { getLocalUserData } from '../../../user'
import gameState from '../../../game/state'
import skins from '../../../skins'
import items from '../../../items'
import { actions } from '../../../actions'

const base_level_exp_unit = 3

const getLevelupExpRequirement = player => {
  // current formula leads to 
  // level | exp requirement
  // 1     | 3
  // 2     | 6
  // 3     | 9
  // 4     | 12
  return player.level * base_level_exp_unit
}

const isAbleToLevelUp = player => {
  const levelupExpRequirement = getLevelupExpRequirement(player)
  return player.exp >= levelupExpRequirement
}

export interface Card {
  type: 'action' | 'item' | 'skin' | 'attribute' | 'resurrect',
  value: any
}

const availableAttributes = [
  {
    property: 'maxHealth',
    value: 5
  },
  {
    property: 'movementSpeed',
    value: 1
  },
  {
    property: 'vision',
    value: 10
  }
]

const drawFromPool = (pool) => {
  return pool[Math.floor(Math.random() * pool.length)] || pool[0]
}

const createAttributeCard = (): Card => {
  return {
    type: 'attribute',
    value: drawFromPool(availableAttributes)
  }
}

const createSkinCard = (): Card => {
  return {
    type: 'skin',
    value: drawFromPool(Object.keys(skins).filter(skin => skins[skin].key !== 'skull'))
  }
}

const createItemCard = (): Card => {
  return {
    type: 'item',
    value: drawFromPool(Object.keys(items))
  }
}

const createActionCard = (): Card => {
  return {
    type: 'action',
    value: drawFromPool(Object.keys(actions))
  }
}

const createResurrectCard = (): Card => ({
  type: 'resurrect',
  value: ''
})

const openLevelUpPanel = (scene, methods, player) => {
  const cardSelectionOpened = scene.game.scene.isActive('cards')
  if (cardSelectionOpened) {
    // do nothing, this should not happen
  } else {
    // generate levelup cards according to player level

    // rules:
    // 1. at least one attribute card
    // 2. skins can only be obtained over specific level
    // 3. you can not change skin before resurrection
    // 4. only specific action / item are allowed depends on skins
    // 5. resurrection would reset skin / action / item / exp / level to init state, but attributes would be retained
    // 6. movementSpeed has upperbound 3, and should be a very rare card

    const typePool = [createAttributeCard, createItemCard, createActionCard]
    if (player.level > 5) {
      typePool.push(createSkinCard)
    }
    if (player.level > 15) {
      typePool.push(createResurrectCard)
    }

    const cards: Card[] = [
      createAttributeCard(),
      drawFromPool(typePool)(),
      drawFromPool(typePool)()
    ]
    scene.scene.launch('cards', { methods, cards })
  }
}

export const levelUp = (scene) => {
  scene.scene.stop('cards')
  const player = gameState.players.find(player => player.id === getLocalUserData().userId)
  const levelupExpRequirement = getLevelupExpRequirement(player)
  player.exp -= levelupExpRequirement
  player.level++
}

export const playerGainExp = (scene, methods, expGain) => {
  const player = gameState.players.find(player => player.id === getLocalUserData().userId)
  if (!player) {
    return console.log('player not initialized')
  }
  player.exp += expGain

  const ableToLevelUp = isAbleToLevelUp(player)
  if (ableToLevelUp) {
    openLevelUpPanel(scene, methods, player)
  }
}

