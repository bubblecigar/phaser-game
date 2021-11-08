import _ from 'lodash'
import gameConfig from '../../game/config'
import setting from '../../../../share/setting.json'
import skins from '../../skins/index'

function init() {

}

function preload() {
  const randomSkinKey = Object.keys(skins)[Math.floor(Math.random() * 10) % (Object.keys(skins).length)]
  const skin = skins[randomSkinKey]
  this.randomSkin = skin
}

function create() {
  const padding = 32

  const centerX = gameConfig.canvasWidth / 2
  const centerY = gameConfig.canvasHeight / 2

  this.transitionScreen = this.add.container(0, 0)
  const text = this.add.text(centerX, centerY, 'loading...', {
    fontSize: setting.fontSize
  })
  const char = this.add.sprite(centerX - padding, centerY, this.randomSkin.spritesheetConfig.spritesheetKey)
  char.play(this.randomSkin.animsConfig.move.key)

  this.transitionScreen.add([text, char])

  this.scene.start('waitingRoom')
}

function update() {

}

export default {
  init,
  preload,
  create,
  update
}