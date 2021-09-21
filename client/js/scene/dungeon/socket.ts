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
    server: (key, ...args) => {
      socket.emit('server', key, ...args)
    },
    disconnect: () => socket.disconnect()
  }

  return socketMethods
}
