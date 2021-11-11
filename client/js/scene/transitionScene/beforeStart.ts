import gameConfig from '../../game/config'
import gameState from '../../game/state'
import skins from '../../skins/index'
import setting from '../../../../share/setting.json'
import coin from '../../items/coin'
import { socketMethods } from '../../index'
import { isMobile } from '../../deviceDetection'

let serverGameState

function init(data) {
  serverGameState = data.serverGameState
}

function preload() {

}

function create() {
  const scene = this
  const messageBox = this.add.rectangle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, gameConfig.canvasWidth, gameConfig.canvasHeight, 0x000000)
  messageBox.setOrigin(0.5, 0.5)

  const padding = 25
  const teamText1 = this.add.text(gameConfig.canvasWidth / 4, padding, 'Team West', {
    fontSize: setting.fontSize
  })
  const teamText2 = this.add.text(gameConfig.canvasWidth * 3 / 4, padding, 'Team East', {
    fontSize: setting.fontSize
  })
  teamText1.setOrigin(0.5, 0.5)
  teamText2.setOrigin(0.5, 0.5)

  let redTeamIndex = 1
  let blueTeamIndex = 1
  gameState.players.forEach(
    player => {
      const skin = skins[player.skin]
      let x, y
      if (player.team === 'red') {
        x = gameConfig.canvasWidth / 4
        y = padding + 20 * redTeamIndex
        redTeamIndex++

        const text = this.add.text(x + 16, y, player.name, {
          fontSize: setting.fontSize
        })
        text.setOrigin(0, 0.5)
      }
      if (player.team === 'blue') {
        x = gameConfig.canvasWidth * 3 / 4
        y = padding + 20 * blueTeamIndex
        blueTeamIndex++

        const text = this.add.text(x - 16, y, player.name, {
          fontSize: setting.fontSize
        })
        text.setOrigin(1, 0.5)
      }

      const spriteSheetKey = skin.spritesheetConfig.spritesheetKey
      const { origin } = skin.matterConfig
      const playerSprite = scene.add.sprite(x, y, spriteSheetKey)
      playerSprite.setOrigin(origin.x, origin.y)
      playerSprite.setFlipX(player.team === 'red' ? false : true)
      playerSprite.play(skin.animsConfig.idle.key)
    }
  )

  const coinSprite = this.add.sprite(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 + padding / 2, coin.spritesheetConfig.spritesheetKey)
  coinSprite.play(coin.animsConfig.idle.key)
  const hint1 = this.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight * 0.7, `Collect ${serverGameState.coinsToWin} coins to win!`, {
    fontSize: setting.fontSize
  })
  hint1.setOrigin(0.5, 0.5)

  if (!isMobile) {
    const hint2 = this.add.text(gameConfig.canvasWidth / 2, hint1.y + 10, `SPACE to shoot`, {
      fontSize: setting.fontSize
    })
    hint2.setOrigin(0.5, 0.5)
  }

  const continueKey = scene.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, `PRESS ${isMobile ? '' : 'ENTER '}TO CONTINUE`, {
    fontSize: setting.fontSize,
    color: '#ff0000'
  })
  continueKey.setOrigin(0.5, 0.5)
  this.tweens.add({
    targets: continueKey,
    scaleX: 1,
    ease: 'Sine.easeInOut',
    duration: 800,
    alpha: 0,
    repeat: -1,
    yoyo: true
  })

  this.input.keyboard.on('keydown', e => {
    if (e.key === 'Enter') {
      socketMethods.enterDungeon()
    }
  })
  if (isMobile) {
    continueKey.setInteractive()
    continueKey.on('pointerdown', () => {
      socketMethods.enterDungeon()
    })
  }
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