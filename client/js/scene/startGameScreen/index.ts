import gameConfig from '../../game/config'
import skins from '../../skins/index'
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

  const padding = 64
  let redTeamIndex = 1
  let blueTeamIndex = 1
  players.forEach(
    player => {
      const skin = skins[player.skin]
      let offsetX = 0
      if (player.team === 'red') {
        offsetX = -((0.5 + redTeamIndex) * padding / 2)
        redTeamIndex++
      }
      if (player.team === 'blue') {
        offsetX = ((0.5 + blueTeamIndex) * padding / 2)
        blueTeamIndex++
      }

      const spriteSheetKey = skin.spritesheetConfig.spritesheetKey
      const { origin } = skin.matterConfig
      const playerSprite = scene.add.sprite(gameConfig.canvasWidth / 2 + offsetX, gameConfig.canvasHeight / 2 - padding, spriteSheetKey)
      playerSprite.setOrigin(origin.x, origin.y)
      playerSprite.setFlipX(player.team === 'red' ? false : true)
      playerSprite.play(skin.animsConfig.idle.key)

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