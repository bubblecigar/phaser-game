import _ from 'lodash'
import gameState from '../../game/state'
import gameConfig from '../../game/config'
import { getLocalUserData } from '../../user'
import items from '../../items/index'
import setting from '../../../../share/setting.json'
import skins from '../../skins/index'

let randomSkin

let coinGroup
let resurrectCountDownText
let transitionScreen

function preload() {
  const randomSkinKey = Object.keys(skins)[Math.floor(Math.random() * 10) % (Object.keys(skins).length)]
  const skin = skins[randomSkinKey]
  randomSkin = skin
}

function create() {
  const padding = 32

  const coinX = padding
  const coinY = gameConfig.canvasHeight - padding
  createCoinGroup(this, coinX, coinY)

  const centerX = gameConfig.canvasWidth / 2
  const centerY = gameConfig.canvasHeight / 2
  createResurrectCountDownText(this, centerX, coinY)

  transitionScreen = this.add.container(0, 0)
  const text = this.add.text(centerX, centerY, 'loading...', {
    fontSize: setting.fontSize
  })

  const char = this.add.sprite(centerX - padding, centerY, randomSkin.spritesheetConfig.spritesheetKey)
  char.play(randomSkin.animsConfig.move.key)

  transitionScreen.add([text, char])
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
  if (gameState.scene === 'loginScene') {
    transitionScreen.setVisible(false)
    coinGroup.setVisible(false)
    resurrectCountDownText.setVisible(false)
  } else if (!player || !player.phaserObject) {
    transitionScreen.setVisible(true)
    coinGroup.setVisible(false)
    resurrectCountDownText.setVisible(false)
  } else {
    transitionScreen.setVisible(false)
    coinGroup.setVisible(true)
    resurrectCountDownText.setVisible(true)
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