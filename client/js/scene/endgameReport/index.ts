import gameConfig from '../../game/config'
import setting from '../../../../share/setting.json'
import skins from '../../skins/index'

let data

function init(_data) {
  data = _data
}

function preload() {

}


const drawWinner = (scene, winner) => {
  const skin = skins[winner.skin]
  const spriteSheetKey = skin.spritesheetConfig.spritesheetKey
  const { origin } = skin.matterConfig
  const winnerSprite = scene.add.sprite(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, spriteSheetKey)
  winnerSprite.setOrigin(origin.x, origin.y)
  winnerSprite.setScale(2, 2)
  winnerSprite.play(skin.animsConfig.idle.key)
}

function create() {
  const scene = this
  const messageBox = this.add.rectangle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, gameConfig.canvasWidth, gameConfig.canvasHeight, 0x000000)
  messageBox.setOrigin(0.5, 0.5)
  messageBox.setInteractive()
  scene.input.on('gameobjectdown', () => {
    scene.scene.stop()
  })

  const winners = data

  drawWinner(this, winners[0])

  const text = scene.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 + 32, `${winners[0].team} team win!`, {
    fontSize: setting.fontSize
  })
  text.setOrigin(0.5, 0.5)
}

function update(t, dt) {

}

export default {
  key: 'endgameReport',
  init,
  preload,
  create,
  update
}