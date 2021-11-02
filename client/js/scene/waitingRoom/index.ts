import basescene from '../basescene/index'
import gameState from '../../game/state'
import setting from '../../../../share/setting.json'

let redTeamReadyHintText
let blueTeamReadyHintText

const updateReadyHintText = () => {
  const players = gameState.players
  const totalPlayers = Math.max(players.length, setting.minumumPlayers)
  const playersRequired = totalPlayers + (totalPlayers % 2 === 1 ? 1 : 0)
  const eachTeamRequired = playersRequired / 2
  const redTeamPlayersReady = players.filter(player => player.ready && player.team === 'red').length
  const blueTeamPlayersReady = players.filter(player => player.ready && player.team === 'blue').length

  if (redTeamPlayersReady === eachTeamRequired && blueTeamPlayersReady === eachTeamRequired) {
    const countDownInSeconds = Math.ceil(gameState.gameStartCountDown / 1000) || 1
    redTeamReadyHintText.setText(countDownInSeconds)
    blueTeamReadyHintText.setText(countDownInSeconds)
  } else {
    redTeamReadyHintText.setText(`${redTeamPlayersReady}/${eachTeamRequired}`)
    blueTeamReadyHintText.setText(`${blueTeamPlayersReady}/${eachTeamRequired}`)
  }
}


function create() {
  basescene.create.apply(this)

  try {
    const sensorLayer = this.map.objects.find(layer => layer.name === 'sensor_layer')
    const redTeamReadyZone = sensorLayer.objects.find(object => object.name === 'red_team_ready_zone')
    const redTeamReadyZoneCenter = {
      x: redTeamReadyZone.x + redTeamReadyZone.width * 0.5,
      y: redTeamReadyZone.y + redTeamReadyZone.height * 0.35
    }
    redTeamReadyHintText = this.add.text(redTeamReadyZoneCenter.x, redTeamReadyZoneCenter.y, '', {
      fontSize: setting.fontSize,
    })
    redTeamReadyHintText.setOrigin(0.5, 0.5)

    const blueTeamReadyZone = sensorLayer.objects.find(object => object.name === 'blue_team_ready_zone')
    const blueTeamReadyZoneCenter = {
      x: blueTeamReadyZone.x + blueTeamReadyZone.width * 0.5,
      y: blueTeamReadyZone.y + blueTeamReadyZone.height * 0.35
    }
    blueTeamReadyHintText = this.add.text(blueTeamReadyZoneCenter.x, blueTeamReadyZoneCenter.y, '', {
      fontSize: setting.fontSize,
    })
    blueTeamReadyHintText.setOrigin(0.5, 0.5)
  } catch (error) {
    console.log(error)
  }
}

function update(...args) {

  basescene.update.apply(this, args)

  updateReadyHintText()
}


export default {
  key: 'waitingRoom',
  init: basescene.init,
  preload: basescene.preload,
  create,
  update
}