import _ from 'lodash'
import gameState from '../../game/state'
import gameConfig from '../../game/config'
import { getLocalUserData } from '../../user'
import items from '../../items/index'
import setting from '../../../../share/setting.json'
import charactors from '../../charactors/index'

const coinConfig = items.coin
let randomCharactorConfig

let coinGroup
let resurrectCountDownText
let transitionScreen

function preload() {
  this.load.spritesheet(coinConfig.spritesheetConfig.spritesheetKey, coinConfig.spritesheetConfig.spritesheetUrl, coinConfig.spritesheetConfig.options)

  const randomCharactorKey = Object.keys(charactors)[Math.floor(Math.random() * 10) % (Object.keys(charactors).length)]
  randomCharactorConfig = charactors[randomCharactorKey]
}

function create() {
  const coinAnimConfig = coinConfig.animsConfig['idle']
  this.anims.create({
    key: coinAnimConfig.key,
    frames: this.anims.generateFrameNumbers(coinConfig.spritesheetConfig.spritesheetKey, { frames: coinAnimConfig.frames }),
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
  const text = this.add.text(centerX, centerY, 'loading...', {
    fontSize: setting.fontSize
  })


  const char = this.add.sprite(centerX - padding, centerY, randomCharactorConfig.spritesheetConfig.spritesheetKey)
  char.play(randomCharactorConfig.animsConfig.move.key)

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
  } else if (!player || !player.phaserObject) {
    transitionScreen.setVisible(true)
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