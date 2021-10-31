import _ from 'lodash'
import { Player } from '../../Interface'
import { getLocalUserData } from '../../user'
import skins from '../../skins/index'
import items from '../../items/index'
import { actions } from '../../actions/index'

const registerInputEvents = (scene, methods, socketMethods) => {
  scene.input.keyboard.on(
    'keydown', e => {
      switch (e.key) {
        case 'w': {
          scene.scale.toggleFullscreen();
          break
        }
        case 'c': {
          const randomSkinKey = Object.keys(skins)[Math.floor(Math.random() * Object.keys(skins).length) % (Object.keys(skins).length)]
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const _player: Player = _.omit(_.clone(player), 'phaserObject')
          _player.skin = randomSkinKey
          socketMethods.clientsInScene(scene.scene.key, methods, 'rebuildPlayer', _player)
          break
        }
        case 'z': {
          const randomActionKey = Object.keys(actions)[Math.floor(Math.random() * Object.keys(actions).length) % (Object.keys(actions).length)]
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const _player: Player = _.omit(_.clone(player), 'phaserObject')
          _player.action = randomActionKey
          socketMethods.clientsInScene(scene.scene.key, methods, 'rebuildPlayer', _player)
          break
        }
        case 'x': {
          const randomItemKey = Object.keys(items)[Math.floor(Math.random() * Object.keys(items).length) % (Object.keys(items).length)]
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const _player: Player = _.omit(_.clone(player), 'phaserObject')
          _player.item = randomItemKey
          socketMethods.clientsInScene(scene.scene.key, methods, 'rebuildPlayer', _player)
          break
        }
        case 'a': {
          const shopOpened = scene.game.scene.isActive('cards')
          if (shopOpened) {
            scene.scene.stop('cards')
          } else {
            const player: Player = methods.getPlayer(getLocalUserData().userId)
            scene.scene.launch('cards', { methods, player })
          }

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