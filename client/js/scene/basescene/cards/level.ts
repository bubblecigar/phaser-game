import _ from 'lodash'
import { getLocalUserData } from '../../../user'
import gameState from '../../../game/state'
import { createActionPool, createAttributePool, createItemPool, createSkinPool } from './constraint'

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

const drawFromPool = (pool) => {
  return pool[Math.floor(Math.random() * pool.length)] || pool[0]
}

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

    // createActionPool, createAttributePool, createItemPool, createSkinPool
    const skinPool = {
      type: 'skin',
      pool: createSkinPool(player.level, player.skin)
    }
    const itemPool = {
      type: 'item',
      pool: createItemPool(player.skin, player.action, player.item)
    }
    const actionPool = {
      type: 'action',
      pool: createActionPool(player.skin, player.item, player.action)
    }
    const attributePool = {
      type: 'attribute',
      pool: createAttributePool(player.skin)
    }


    const drawCard = () => {
      const typePool = [skinPool, itemPool, actionPool, attributePool]
      const nonEmptyPools = typePool.filter(pool => pool.pool.length)
      const randomPool = drawFromPool(nonEmptyPools)
      const randomCard: Card = {
        type: randomPool.type,
        value: drawFromPool(randomPool.pool)
      }
      return randomCard
    }

    const cards: Card[] = [
      {
        type: 'attribute',
        value: drawFromPool(attributePool.pool)
      },
      drawCard(),
      player.level > 14 ? {
        type: 'resurrect',
        value: ''
      } : drawCard()
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

