import gameState from '../../../game/state'
import gameConfig from '../../../game/config'
import skins from '../../../skins'
import setting from '../../../../../share/setting.json'

function init() {

}

function preload() {

}

function create() {
  const padding = 32
  let redTeamIndex = 0
  let blueTeamIndex = 0
  gameState.players.forEach(
    player => {
      let x, y, flip
      if (player.team === 'red') {
        x = padding
        y = padding + redTeamIndex * padding
        flip = false
        redTeamIndex++
      } else if (player.team === 'blue') {
        x = gameConfig.canvasWidth - padding
        y = padding + blueTeamIndex * padding
        flip = true
        blueTeamIndex++
      }
      if (x && y) {
        const sprite = this.add.sprite(x, y, skins[player.skin].spritesheetConfig.spritesheetKey)
        sprite.setFlipX(flip)
        const playerInfo = `hp ${player.attributes.maxHealth.toFixed(0)} dmg ${player.attributes.damage.toFixed(1)} ₵ ${player.coins.toFixed(0)}`
        const text = this.add.text(x + 15 * (flip ? -1 : 1), y, playerInfo, {
          fontSize: setting.fontSize
        })
        text.setOrigin(flip ? 1 : 0, 0.5)
      }
    }
  )
}

function update(t, dt) {

}

export default {
  key: 'tabPanel',
  init,
  preload,
  create,
  update
}