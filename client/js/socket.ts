import _ from 'lodash'
import io from 'socket.io-client'
import { getLocalUserData } from './user'
import gameState from './game/state'
import { GameState } from './Interface'

const socket = io.connect({
  auth: {
    ...getLocalUserData()
  }
})

let registered = false
export const registerSocketEvents = methods => {
  if (registered) {
    return // only register once
  } else {
    Object.keys(methods).forEach(
      method => {
        socket.on(method, (...args) => {
          methods[method](...args)
        })
      }
    )
    registered = true
  }
  socket.on('UPDATE_CLIENT_GAME_STATE', (serverGameState: GameState) => {
    methods.syncPlayers(serverGameState.players)
  })
}

export const readStateFromServer = () => {
  socket.emit('READ_SERVER_GAME_STATE')
}

export const writeStateToServer = (userId, playerState) => {
  socket.emit('WRITE_SERVER_GAME_STATE', userId, playerState)
}

export default socket