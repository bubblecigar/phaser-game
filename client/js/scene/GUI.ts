import _ from 'lodash'
import itemCellUrl from '../../statics/item_cell.png'
import gameState from '../game/state'
import gameConfig from '../game/config'
import { getLocalUserData } from '../user'
import items from '../items/index'
import charactors from '../charactors/index'
import { aimingTime, skillInUse } from '../scene/dungeon'

let scene, coinGroup, maximumBar, currentBar
let aimingBarContainer, aimingBar

function preload() {
  scene = this
  this.load.image('item_cell', itemCellUrl)
  Object.keys(items).forEach(
    key => {
      const item = items[key]
      this.load.spritesheet(item.spritesheetConfig.spritesheetKey, item.spritesheetConfig.spritesheetUrl, item.spritesheetConfig.options)
    }
  )
}

const addItemCell = (x, y, i) => {
  const itemCell = scene.add.image(x, y, 'item_cell')
  itemCell.setX(itemCell.x + (itemCell.width - 1) * i)
  itemCell.angle = 90 * (i + 1)
  const text = scene.add.text(itemCell.x + 3, y + 3, i + 1, { fontSize: 8 })
  text.setOrigin(0, 0)
  return itemCell
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
  addItemCell(gameConfig.canvasWidth / 2 - 16, gameConfig.canvasHeight - padding, 0)
  addItemCell(gameConfig.canvasWidth / 2 - 16, gameConfig.canvasHeight - padding, 1)
  addItemCell(gameConfig.canvasWidth / 2 - 16, gameConfig.canvasHeight - padding, 2)

  const coinX = padding
  const coinY = gameConfig.canvasHeight - padding
  createCoinGroup(this, coinX, coinY)

  const healthX = gameConfig.canvasWidth - padding
  const healthY = gameConfig.canvasHeight - padding
  createHealthBar(this, healthX, healthY)

  const aimingBarX = gameConfig.canvasWidth / 2 - 10
  const aimingBarY = gameConfig.canvasHeight / 2 + 20
  createAimingBar(aimingBarX, aimingBarY)
}

const createAimingBar = (x, y) => {
  aimingBarContainer = scene.add.rectangle(x - 1, y, 20 + 2, 5, 0xFFFFFF)
  aimingBarContainer.setOrigin(0, 0.5)
  aimingBar = scene.add.rectangle(x, y, aimingTime, 3)
}

const showAimingBar = () => {
  if (!aimingTime || !skillInUse) {
    aimingBar.setVisible(false)
    aimingBarContainer.setVisible(false)
  } else {
    aimingBarContainer.setVisible(true)
    aimingBar.setVisible(true)
    const percentage = Math.min(aimingTime / skillInUse.castTime, 1)
    aimingBar.setSize(percentage * 20, 3)
    aimingBarContainer.setOrigin(0, 0.5)
    if (percentage >= 1) {
      aimingBar.setFillStyle(0x4ba747)
    } else {
      aimingBar.setFillStyle(0xee8e2e)
    }
  }
}

const createHealthBar = (scene, x, y) => {
  const text = scene.add.text(x + 1, y, 'hp', { fontSize: 8 })
  text.setOrigin(0, 0)

  maximumBar = scene.add.rectangle(x, y, 60, 6, 0xDDDDDD)
  maximumBar.setOrigin(1, 1)
  currentBar = scene.add.rectangle(x - 1, y, 40, 4, 0xda4e38)
  currentBar.setOrigin(1, 1)
}

const showHealthBar = (current, maximum) => {
  maximumBar.width = maximum
  maximumBar.setOrigin(1, 0.5)
  currentBar.width = current - 2
  currentBar.setOrigin(1, 0.5)
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

function update(t, dt) {
  const player = gameState.players.find(p => p.id === getLocalUserData().userId)
  if (!player) return
  showCoinCount(player.coins)
  const maximumHealth = charactors[player.charactorKey].maxHealth
  showHealthBar(player.health, maximumHealth)
  showAimingBar()
}

export default {
  key: 'GUI',
  preload,
  create,
  update
}