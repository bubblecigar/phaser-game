import _ from 'lodash'
import gameState from '../../game/state'
import gameConfig from '../../game/config'
import { getLocalUserData } from '../../user'
import items from '../../items/index'

const coinConfig = items.coin

let coinGroup
let resurrectCountDownText

function preload() {
  this.load.spritesheet(coinConfig.spritesheetConfig.spritesheetKey, coinConfig.spritesheetConfig.spritesheetUrl, coinConfig.spritesheetConfig.options)
}

function create() {
  const animConfig = coinConfig.animsConfig['idle']
  this.anims.create({
    key: animConfig.key,
    frames: this.anims.generateFrameNumbers(coinConfig.spritesheetConfig.spritesheetKey, { frames: animConfig.frames }),
    frameRate: 8,
    repeat: -1
  })

  const padding = 32

  const coinX = padding
  const coinY = gameConfig.canvasHeight - padding
  createCoinGroup(this, coinX, coinY)

  const bottomCenter = gameConfig.canvasWidth / 2
  createResurrectCountDownText(this, bottomCenter, coinY)
}

const createCoinGroup = (scene, x, y) => {
  coinGroup = scene.add.group({ classType: Phaser.GameObjects.Sprite })
  for (let i = 0; i < 10; i++) {
    coinGroup.add(scene.add.sprite(x + 10 * i, y))
  }
  coinGroup.playAnimation(items.coin.animsConfig.idle.key, 0)
  coinGroup.setVisible(false)
}

const showCoinCount = count => {
  coinGroup.setVisible(true)
  coinGroup.setVisible(false, count, 1)
}

const createResurrectCountDownText = (scene, x, y) => {
  resurrectCountDownText = scene.add.text(x, y, 'resurrect in...')
}

const showResurrectCountDown = player => {
  if (player.health > 0) {
    // player is not dead
    resurrectCountDownText.setVisible(false)
  } else {
    // show count down in second
    resurrectCountDownText.setVisible(true)
    resurrectCountDownText.setText(Math.ceil(player.resurrectCountDown / 100) / 10)
  }
}

function update() {
  const player = gameState.players.find(p => p.id === getLocalUserData().userId)
  if (!player) {
    return // show transition screen
  } else {
    showCoinCount(player.coins)
    showResurrectCountDown(player)
  }
}

export default {
  key: 'GUI',
  preload,
  create,
  update
}