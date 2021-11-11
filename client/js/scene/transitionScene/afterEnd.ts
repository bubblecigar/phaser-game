import gameConfig from '../../game/config'
import setting from '../../../../share/setting.json'
import skins from '../../skins/index'

let serverGameState

function init(_data) {
  serverGameState = _data.serverGameState
}

function preload() {

}


const drawWinner = (scene, winner, position) => {
  const skin = skins[winner.skin]
  const spriteSheetKey = skin.spritesheetConfig.spritesheetKey
  const { origin } = skin.matterConfig
  const winnerSprite = scene.add.sprite(position.x, position.y, spriteSheetKey)
  winnerSprite.setOrigin(origin.x, origin.y)
  winnerSprite.setScale(2, 2)
  winnerSprite.play(skin.animsConfig.idle.key)
}

function create() {
  const scene = this
  const messageBox = this.add.rectangle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, gameConfig.canvasWidth, gameConfig.canvasHeight, 0x000000)
  messageBox.setOrigin(0.5, 0.5)
  const winners = serverGameState.winners

  const interval = gameConfig.canvasWidth / (winners.length + 1)


  winners.forEach(
    (winner, i) => {
      const x = interval * (i + 1)
      const y = gameConfig.canvasHeight / 2 - 32
      drawWinner(this, winner, { x, y })
    }
  )

  const text = scene.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, `${winners[0].team === 'blue' ? 'Team East' : 'Team West'} win!`, {
    fontSize: setting.fontSize
  })
  text.setOrigin(0.5, 0.5)

  const continueKey = scene.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight * 0.8, `PRESS ${IS_TOUCH ? '' : 'ENTER '}TO CONTINUE`, {
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
      scene.scene.start('waitingRoom', { mapKey: 'readyRoom' })
    }
  })
  if (IS_TOUCH) {
    continueKey.setInteractive()
    continueKey.on('pointerdown', () => {
      scene.scene.start('waitingRoom', { mapKey: 'readyRoom' })
    })
  }
}

function update(t, dt) {

}

export default {
  key: 'afterEnd',
  init,
  preload,
  create,
  update
}