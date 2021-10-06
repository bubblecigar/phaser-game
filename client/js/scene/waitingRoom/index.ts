import basescene from '../share/index'
import gameState from '../../game/state'
import setting from '../../../../share/setting.json'

let readyHintText

const updateReadyHintText = () => {
  const players = gameState.players
  const totalPlayers = Math.max(players.length, setting.minumumPlayers)
  const playersReady = players.filter(player => player.ready).length

  if (playersReady === totalPlayers) {
    readyHintText.setText(`starting...`)
  } else {
    readyHintText.setText(`${playersReady}/${totalPlayers} ready`)
  }
}


function create() {
  basescene.create.apply(this)

  try {
    const sensorLayer = this.map.objects.find(layer => layer.name === 'sensor_layer')
    const readyZone = sensorLayer.objects.find(object => object.name === 'ready_zone')
    const readyZoneCenter = {
      x: readyZone.x + readyZone.width * 0.5,
      y: readyZone.y + readyZone.height * 0.35
    }
    readyHintText = this.add.text(readyZoneCenter.x, readyZoneCenter.y, '', {
      fontSize: '12px',
    })
    readyHintText.setOrigin(0.5, 0.5)
  } catch (error) {
    console.log(error)
  }
}

function update() {
  basescene.update.apply(this)

  updateReadyHintText()
}


export default {
  key: 'waitingRoom',
  init: basescene.init,
  preload: basescene.preload,
  create,
  update
}