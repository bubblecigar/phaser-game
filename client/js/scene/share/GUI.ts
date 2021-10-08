import _ from 'lodash'
import gameState from '../../game/state'
import gameConfig from '../../game/config'
import { getLocalUserData } from '../../user'
import items from '../../items/index'
import setting from '../../../../share/setting.json'

const coinConfig = items.coin

let coinGroup
let resurrectCountDownText
let transitionScreen

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

  const centerX = gameConfig.canvasWidth / 2
  const centerY = gameConfig.canvasHeight / 2
  createResurrectCountDownText(this, centerX, coinY)

  transitionScreen = this.add.container(0, 0)
  const background = this.add.rectangle(0, 0, gameConfig.canvasWidth, gameConfig.canvasHeight, 0x000000)
  background.setOrigin(0, 0)
  const text = this.add.text(centerX, centerY, 'loading...', {
    fontSize: setting.fontSize
  })

  transitionScreen.add(background, text)
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
  resurrectCountDownText = scene.add.text(x, y, '', {
    fontSize: setting.fontSize
  })
}

const showResurrectCountDown = player => {
  if (player.health > 0) {
    resurrectCountDownText.setVisible(false)
  } else {
    resurrectCountDownText.setVisible(true)
    const countdown = (player.resurrectCountDown / 1000).toFixed(2)
    resurrectCountDownText.setText(countdown)
  }
}

function update() {
  const player = gameState.players.find(p => p.id === getLocalUserData().userId)
  if (!player) {
    transitionScreen.setVisible(true)
    return // show transition screen
  } else {
    transitionScreen.setVisible(false)
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