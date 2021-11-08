import _ from 'lodash'
// import gameState from '../../game/state'
// import { Player } from '../../Interface'
// import { getLocalUserData } from '../../user'
// import skins from '../../skins/index'
// import items from '../../items/index'
// import { actions } from '../../actions/index'
// import { playerGainExp } from './cards/level'

const registerInputEvents = (scene, methods, socketMethods) => {
  scene.input.keyboard.on(
    'keyup', e => {
      switch (e.key) {
        case ' ': {
          scene.scene.stop('tabPanel')
          break
        }
        default: {
          // do nothing
        }
      }
    }
  )
  scene.input.keyboard.on(
    'keydown', e => {
      switch (e.key) {
        case ' ': {
          scene.scene.launch('tabPanel')
          break
        }
        // case 'c': {
        //   scene.scene.start('beforeStart')
        //   break
        // }
        // case 'v': {
        //   scene.scene.start('afterEnd', { serverGameState: { winners: [gameState.players[0]] } })
        //   break
        // }
        // case 'f': {
        //   scene.scale.toggleFullscreen();
        //   break
        // }
        // case 'c': {
        //   const randomSkinKey = Object.keys(skins)[Math.floor(Math.random() * Object.keys(skins).length) % (Object.keys(skins).length)]
        //   const player: Player = methods.getPlayer(getLocalUserData().userId)
        //   const _player: Player = _.omit(_.clone(player), 'phaserObject')
        //   _player.skin = randomSkinKey
        //   socketMethods.clientsInScene(scene.scene.key, methods, 'rebuildPlayer', _player)
        //   break
        // }
        // case 'z': {
        //   const randomActionKey = Object.keys(actions)[Math.floor(Math.random() * Object.keys(actions).length) % (Object.keys(actions).length)]
        //   const player: Player = methods.getPlayer(getLocalUserData().userId)
        //   const _player: Player = _.omit(_.clone(player), 'phaserObject')
        //   _player.action = randomActionKey
        //   socketMethods.clientsInScene(scene.scene.key, methods, 'rebuildPlayer', _player)
        //   break
        // }
        // case 'x': {
        //   const randomItemKey = Object.keys(items)[Math.floor(Math.random() * Object.keys(items).length) % (Object.keys(items).length)]
        //   const player: Player = methods.getPlayer(getLocalUserData().userId)
        //   const _player: Player = _.omit(_.clone(player), 'phaserObject')
        //   _player.item = randomItemKey
        //   socketMethods.clientsInScene(scene.scene.key, methods, 'rebuildPlayer', _player)
        //   break
        // }
        // case 'a': {
        //   playerGainExp(scene, methods, 10)
        //   break
        // }
        default: {
          // do nothing
        }
      }
    }
  )
}

export default registerInputEvents