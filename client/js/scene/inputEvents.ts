import _ from 'lodash'
import { Player } from '../Interface'
import { getLocalUserData } from '../user'
import charactors from '../charactors/index'
import mapConfigs from '../maps/mapConfigs'
import { broadcast } from '../socket'

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
          broadcast('syncMap', randomMapConfigKey)
          break
        }
        case 'c': {
          const randomCharactorKey = Object.keys(charactors)[Math.floor(Math.random() * 10) % (Object.keys(charactors).length)]
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const _player: Player = _.omit(_.clone(player), 'phaserObject')
          _player.charactorKey = randomCharactorKey
          broadcast(methods, 'setPlayer', _player)
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