import Phaser from 'phaser'
import { v4 } from 'uuid';
import _ from 'lodash'
import { gameState, Player, Item } from '../../../share/game'
import { getLocalUserData } from '../user'
import charactors from '../charactors/Charactors'
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
        case 'z': {
          const getNearestReachableItem = (position, items = gameState.items): false | Item => {
            let reachable = false
            const nearestItem = _.minBy(items, item => {
              const distance = Phaser.Math.Distance.BetweenPoints(item.position, position)
              if (distance < 30) { reachable = true }
              return distance
            })
            return reachable && nearestItem
          }

          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const interactableItem = getNearestReachableItem(player.position)
          if (!interactableItem) return
          socket.emit('removeItem', interactableItem.id)
          methods.removeItem(interactableItem.id)
          break
        }
        case 'x': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const itemConstructor: Item = {
            interface: 'Item',
            id: v4(),
            itemKey: 'arrow',
            position: player.position,
            velocity: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
            phaserObject: null
          }
          const item: Item = methods.addItem(itemConstructor)
          socket.emit('addItem', _.omit(item, 'phaserObject'))
          setTimeout(
            () => {
              socket.emit('removeItem', item.id)
              methods.removeItem(item.id)
            }, 1000
          )
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