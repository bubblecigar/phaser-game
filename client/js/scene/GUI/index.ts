import _ from 'lodash'
import gameState from '../../game/state'
import gameConfig from '../../game/config'
import { getLocalUserData } from '../../user'
import setting from '../../../../share/setting.json'
import skins from '../../skins/index'

let randomSkin
let transitionScreen

function preload() {
  const randomSkinKey = Object.keys(skins)[Math.floor(Math.random() * 10) % (Object.keys(skins).length)]
  const skin = skins[randomSkinKey]
  randomSkin = skin
}

function create() {
  const bgmusic = document.getElementById('bgmusic')
  const soundButton = this.add.text(10, gameConfig.canvasHeight - 10, 'sound', {
    fontSize: '10px'
  })
  if (bgmusic.muted) {
    soundButton.setText('sound off')
  } else {
    soundButton.setText('sound on')
  }
  soundButton.setInteractive({
    cursor: 'pointer'
  })
  const scene = this
  soundButton.on('pointerdown', function (pointer, x, y, event) {
    bgmusic.muted = !bgmusic.muted
    if (!bgmusic.muted) {
      bgmusic.play()
      scene.game.sound.mute = false
      soundButton.setText('sound on')
    } else {
      scene.game.sound.mute = true
      soundButton.setText('sound off')
    }
  })

  const padding = 32

  const centerX = gameConfig.canvasWidth / 2
  const centerY = gameConfig.canvasHeight / 2

  transitionScreen = this.add.container(0, 0)
  const text = this.add.text(centerX, centerY, 'loading...', {
    fontSize: setting.fontSize
  })

  const char = this.add.sprite(centerX - padding, centerY, randomSkin.spritesheetConfig.spritesheetKey)
  char.play(randomSkin.animsConfig.move.key)

  transitionScreen.add([text, char])
}

function update() {
  const player = gameState.players.find(p => p.id === getLocalUserData().userId)
  if (gameState.scene === 'loginScene') {
    transitionScreen.setVisible(false)
  } else if (!player || !player.phaserObject) {
    transitionScreen.setVisible(true)
  } else {
    transitionScreen.setVisible(false)
  }
}

export default {
  key: 'GUI',
  preload,
  create,
  update
}