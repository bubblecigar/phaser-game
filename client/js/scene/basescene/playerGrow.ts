import _ from 'lodash'
import { getLocalUserData } from '../../user'
import gameState from '../../game/state'

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

const openLevelUpPanel = (scene, methods) => {
  const cardSelectionOpened = scene.game.scene.isActive('cards')
  if (cardSelectionOpened) {
    // do nothing, this should not happen
  } else {
    scene.scene.launch('cards', methods)
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
    openLevelUpPanel(scene, methods)
  }
}

