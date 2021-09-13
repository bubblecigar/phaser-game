import _ from 'lodash'
import io from 'socket.io-client'
import { getLocalUserData } from '../../user'
import { GameState } from '../../Interface'

export const connectToServer = () => {
  const socket = io.connect({
    auth: {
      ...getLocalUserData()
    }
  })

  const socketMethods = {
    getSocketInstance: () => socket,
    registerSocketEvents: methods => {
      socket.on('broadcast', (key, ...args) => {
        methods[key](...args)
      })
      socket.on('UPDATE_CLIENT_GAME_STATE', (serverGameState: GameState) => {
        methods.syncServerStateToClient(serverGameState)
      })
    },
    broadcast: (methods, key, ...args) => {
      methods[key](...args)
      socket.emit('broadcast', key, ...args)
    },
    serverGameStateUpdate: (action, ...args) => {
      socket.emit('serverGameStateUpdate', action, ...args)
    },
    readStateFromServer: () => {
      socket.emit('READ_SERVER_GAME_STATE')
    },
    writeStateToServer: (userId, playerState) => {
      socket.emit('WRITE_SERVER_GAME_STATE', userId, _.omit(playerState, 'phaserObject'))
    },
    disconnect: () => socket.disconnect()
  }

  return socketMethods
}
