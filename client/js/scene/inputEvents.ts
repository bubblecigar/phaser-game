import Phaser from 'phaser'
import { v4 } from 'uuid'
import _ from 'lodash'
import { Player, Bullet } from '../../../share/game'
import { getLocalUserData } from '../user'
import charactors from '../charactors/Charactors'
import items from '../items/Items'
import socket from '../socket'
import mapConfigs from './mapConfigs'

const registerInputEvents = (scene, methods) => {
  scene.input.keyboard.on('keyup', e => {
    switch (e.key) {
      case ' ': {
        // stop aiming
        break
      }
      default: {
        // do nothing
      }
    }
  })
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
        case 'x': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const bullet = items.arrow
          const itemConstructor: Bullet = {
            interface: 'Bullet',
            id: v4(),
            itemKey: bullet.key,
            damage: bullet.damage,
            position: player.position,
            velocity: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
            phaserObject: null
          }
          methods.shootInClient(itemConstructor)
          socket.emit('shootInClient', itemConstructor)
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
        case ' ': {
          // on aim
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