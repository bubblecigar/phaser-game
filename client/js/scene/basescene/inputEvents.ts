import _ from 'lodash'
import { Player } from '../../Interface'
import { getLocalUserData } from '../../user'
import charactors from '../../charactors/index'

const registerInputEvents = (scene, methods, socketMethods) => {
  scene.input.keyboard.on(
    'keydown', e => {
      switch (e.key) {
        case 'w': {
          scene.scale.toggleFullscreen();
          break
        }
        case 'c': {
          const randomCharactorKey = Object.keys(charactors)[Math.floor(Math.random() * Object.keys(charactors).length) % (Object.keys(charactors).length)]
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const _player: Player = _.omit(_.clone(player), 'phaserObject')
          _player.charactorKey = randomCharactorKey
          socketMethods.clientsInScene(scene.scene.key, methods, 'rebuildPlayer', _player)
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