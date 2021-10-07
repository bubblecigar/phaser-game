import _ from 'lodash'
import itemCellUrl from '../../../statics/item_cell.png'
import gameState from '../../game/state'
import gameConfig from '../../game/config'
import { getLocalUserData } from '../../user'
import items from '../../items/index'

let coinGroup
let resurrectCountDownText

function preload() {
  this.load.image('item_cell', itemCellUrl)
  Object.keys(items).forEach(
    key => {
      const item = items[key]
      this.load.spritesheet(item.spritesheetConfig.spritesheetKey, item.spritesheetConfig.spritesheetUrl, item.spritesheetConfig.options)
    }
  )
}

function create() {
  Object.keys(items).forEach(
    key => {
      const item = items[key]
      Object.keys(item.animsConfig).forEach(
        _key => {
          const animConfig = item.animsConfig[_key]
          this.anims.create({
            key: animConfig.key,
            frames: this.anims.generateFrameNumbers(item.spritesheetConfig.spritesheetKey, { frames: animConfig.frames }),
            frameRate: 8,
            repeat: -1
          })
        }
      )
    }
  )

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
    resurrectCountDownText.setText(Math.ceil(player.resurrectCountDown / 1000))
  }
}

function update() {
  const player = gameState.players.find(p => p.id === getLocalUserData().userId)
  if (!player) return
  showCoinCount(player.coins)
  showResurrectCountDown(player)
}

export default {
  key: 'GUI',
  preload,
  create,
  update
}