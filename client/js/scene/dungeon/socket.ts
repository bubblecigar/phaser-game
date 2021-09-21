import _ from 'lodash'
import io from 'socket.io-client'
import { getLocalUserData } from '../../user'
import { GameState } from '../../Interface'

export const connectToServer = (item_layer) => {
  const socket = io.connect({
    auth: {
      ...getLocalUserData(),
      item_layer
    }
  })

  const socketMethods = {
    getSocketInstance: () => socket,
    registerSocketEvents: methods => {
      socket.on('clients', (key, ...args) => {
        methods[key](...args)
      })
    },
    clients: (methods, key, ...args) => {
      methods[key](...args)
      socket.emit('clients', key, ...args)
    },
    serverGameStateUpdate: (action, ...args) => {
      socket.emit('serverGameStateUpdate', action, ...args)
    },
    readStateFromServer: () => {
      socket.emit('READ_SERVER_GAME_STATE')
    },
    writeStateToServer: (userId, playerState) => {
      socket.emit('WRITE_PLAYER_STATE_TO_SERVER', userId, _.omit(playerState, 'phaserObject'))
    },
    disconnect: () => socket.disconnect()
  }

  return socketMethods
}
