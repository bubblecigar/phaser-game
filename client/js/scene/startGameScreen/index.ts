import gameConfig from '../../game/config'
import charactors from '../../charactors/index'
import setting from '../../../../share/setting.json'
import coin from '../../items/coin'

let players

function init(data) {
  players = data
}

function preload() {

}


function create() {
  const scene = this
  const messageBox = this.add.rectangle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, gameConfig.canvasWidth, gameConfig.canvasHeight, 0x000000)
  messageBox.setOrigin(0.5, 0.5)
  messageBox.setInteractive()
  scene.input.on('gameobjectdown', () => {
    scene.scene.stop()
  })

  // const winner = data
  const padding = 68
  let offsetIndex = (players.length % 2 === 0) ? 1 : 0
  players.forEach(
    player => {
      const charactor = charactors[player.charactorKey]
      const offsetX = offsetIndex * padding
      if (offsetIndex <= 0) {
        offsetIndex *= -1
        offsetIndex++
      } else {
        offsetIndex *= -1
      }
      const spriteSheetKey = charactor.spritesheetConfig.spritesheetKey
      const { origin } = charactor.matterConfig
      const playerSprite = scene.add.sprite(gameConfig.canvasWidth / 2 + offsetX, gameConfig.canvasHeight / 2 - padding, spriteSheetKey)
      playerSprite.setOrigin(origin.x, origin.y)
      playerSprite.setFlipX(offsetIndex >= 0 ? false : true)
      playerSprite.play(charactor.animsConfig.idle.key)

      const text = this.add.text(gameConfig.canvasWidth / 2 + offsetX, gameConfig.canvasHeight / 2 + padding / 4 - padding, player.name, {
        fontSize: setting.fontSize
      })
      text.setOrigin(0.5, 0.5)
    }
  )

  const coinSprite = this.add.sprite(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 + padding / 2, coin.spritesheetConfig.spritesheetKey)
  coinSprite.play(coin.animsConfig.idle.key)
  const hint = this.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 + padding * 0.75, `Collect ${setting.coinsToWin} coins to win!`, {
    fontSize: setting.fontSize
  })
  hint.setOrigin(0.5, 0.5)
}

function update(t, dt) {

}

export default {
  key: 'startGameScreen',
  init,
  preload,
  create,
  update
}