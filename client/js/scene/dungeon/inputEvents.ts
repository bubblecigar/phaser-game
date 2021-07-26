import _ from 'lodash'
import { Player } from '../../Interface'
import { getLocalUserData } from '../../user'
import charactors from '../../charactors/index'
import mapConfigs from '../../maps/mapConfigs'

const registerInputEvents = (scene, methods, socketMethods) => {
  scene.input.keyboard.on(
    'keyup', e => {
      switch (e.key) {
        case 'a': {
          scene.scene.stop('GUI')
          break
        }
      }
    }
  )
  scene.input.keyboard.on(
    'keydown', e => {
      switch (e.key) {
        case 'a': {
          scene.scene.launch('GUI')
          break
        }
        case 'w': {
          scene.scale.toggleFullscreen();
          break
        }
        case 's': {
          const randomMapConfigKey = Object.keys(mapConfigs)[Math.floor(Math.random() * 10) % (Object.keys(mapConfigs).length)]
          socketMethods.broadcast(methods, 'syncMap', randomMapConfigKey)
          break
        }
        case 'c': {
          const randomCharactorKey = Object.keys(charactors)[Math.floor(Math.random() * 10) % (Object.keys(charactors).length)]
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const _player: Player = _.omit(_.clone(player), 'phaserObject')
          _player.charactorKey = randomCharactorKey
          socketMethods.broadcast(methods, 'setPlayer', _player)
          break
        }
        case '1': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          methods.levelUpPlayer(player, 'damage')
          break
        }
        case '2': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          methods.levelUpPlayer(player, 'duration')
          break
        }
        case '3': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          methods.levelUpPlayer(player, 'speed')
          break
        }
        case '4': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          methods.levelUpPlayer(player, 'rotation')
          break
        }
        case '5': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          methods.levelUpPlayer(player, 'consective')
          break
        }
        case '6': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          methods.levelUpPlayer(player, 'directions')
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