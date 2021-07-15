import _ from 'lodash'
import { Player } from '../Interface'
import { getLocalUserData } from '../user'
import charactors from '../charactors/index'
import socket from '../socket'
import mapConfigs from '../maps/mapConfigs'

const registerInputEvents = (scene, methods) => {
  scene.input.keyboard.on(
    'keydown', e => {
      switch (e.key) {
        case 'w': {
          scene.scale.toggleFullscreen();
          break
        }
        case 's': {
          const randomMapConfigKey = Object.keys(mapConfigs)[Math.floor(Math.random() * 10) % (Object.keys(mapConfigs).length)]
          methods.syncMap(randomMapConfigKey)
          socket.emit('syncMap', randomMapConfigKey)
          break
        }
        case 'c': {
          const randomCharactorKey = Object.keys(charactors)[Math.floor(Math.random() * 10) % (Object.keys(charactors).length)]
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const _player: Player = _.omit(_.clone(player), 'phaserObject')
          _player.charactorKey = randomCharactorKey
          methods.setPlayer(_player)
          socket.emit('setPlayer', _player)
          break
        }
        default: {
          // do nothing
        }
      }
    }
  )
}

export default registerInputEvents