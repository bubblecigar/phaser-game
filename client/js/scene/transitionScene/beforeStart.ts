import gameConfig from '../../game/config'
import gameState from '../../game/state'
import skins from '../../skins/index'
import setting from '../../../../share/setting.json'
import coin from '../../items/coin'


function init() {

}

function preload() {

}

function create() {
  const scene = this
  const messageBox = this.add.rectangle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, gameConfig.canvasWidth, gameConfig.canvasHeight, 0x000000)
  messageBox.setOrigin(0.5, 0.5)

  const padding = 64
  const teamText1 = this.add.text(gameConfig.canvasWidth / 4, gameConfig.canvasHeight / 2 - 2 * padding, 'Team West', {
    fontSize: setting.fontSize
  })
  const teamText2 = this.add.text(gameConfig.canvasWidth * 3 / 4, gameConfig.canvasHeight / 2 - 2 * padding, 'Team East', {
    fontSize: setting.fontSize
  })
  teamText1.setOrigin(0.5, 0.5)
  teamText2.setOrigin(0.5, 0.5)

  let redTeamIndex = 1
  let blueTeamIndex = 1
  gameState.players.forEach(
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
  const hint1 = this.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 + padding * 0.75, `Collect ${setting.coinsToWin} coins to win!`, {
    fontSize: setting.fontSize
  })
  hint1.setOrigin(0.5, 0.5)

  const hint2 = this.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 + padding * 1, `SPACE to toggle status panel`, {
    fontSize: setting.fontSize
  })
  hint2.setOrigin(0.5, 0.5)

  const hint3 = this.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 + padding * 1.25, `CLICK to shoot`, {
    fontSize: setting.fontSize
  })
  hint3.setOrigin(0.5, 0.5)

  this.input.keyboard.on('keydown', e => {
    scene.scene.start('dungeon')
  })
}

function update(t, dt) {

}

export default {
  key: 'beforeStart',
  init,
  preload,
  create,
  update
}