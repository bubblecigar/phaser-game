import _ from 'lodash'
import { getLocalUserData } from '../../../user'
import gameState from '../../../game/state'
import { createActionPool, createAttributePool, createItemPool, createSkinPool } from './constraint'
import { socketMethods } from '../../../index'
import { Player } from '../../../Interface'

const base_level_exp_unit = 1

const getLevelupExpRequirement = player => {
  // current formula leads to 
  // lv | exp | tinyMonsters
  // 1 1 1
  // 2 3 1
  // 3 4 2
  // 4 5 2
  // 5 6 2
  // 6 8 3
  // 7 9 3
  // 8 10 4
  // 9 12 4
  // 10 13 5
  // 11 14 5
  // 12 16 6
  // 13 17 6
  // 14 19 7
  // 15 20 7
  // 16 22 8
  // 17 23 8
  // 18 25 9
  // 19 26 9
  // 20 27 9
  return Math.pow(player.level, 1.1) * base_level_exp_unit
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
      pool: createActionPool(player.item, player.action)
    }
    const attributePool = {
      type: 'attribute',
      pool: createAttributePool(player)
    }


    const drawCard = (): Card => {
      const typePool = [skinPool, itemPool, actionPool, attributePool]
      const nonEmptyPools = typePool.filter(pool => pool.pool.length)
      if (nonEmptyPools.length === 0) {
        return {
          type: 'resurrect',
          value: ''
        }
      }
      const randomPool = drawFromPool(nonEmptyPools)
      if (randomPool.pool.length === 0) {
        return {
          type: 'resurrect',
          value: ''
        }
      }
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
      player.level > 30 ? {
        type: 'resurrect',
        value: ''
      } : drawCard()
    ]

    cards.sort(
      () => (Math.random() - 0.5)
    )

    scene.scene.launch('cards', { methods, cards })
  }
}

export const levelUp = (scene, methods) => {
  scene.scene.stop('cards')
  const player = gameState.players.find(player => player.id === getLocalUserData().userId)
  const levelupExpRequirement = getLevelupExpRequirement(player)
  player.exp -= levelupExpRequirement
  player.level++
  player.attributes.maxHealth += 3
  const _player: Player = _.omit(_.clone(player), 'phaserObject')
  socketMethods.clientsInScene('all-scene', methods, 'rebuildPlayer', _player)
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

