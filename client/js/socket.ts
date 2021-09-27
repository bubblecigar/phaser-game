import _ from 'lodash'
import io from 'socket.io-client'
import { getLocalUserData } from './user'


export const connectToServer = () => {
  const socket = io.connect({
    auth: {
      ...getLocalUserData()
    }
  })
  return socket
}

export const getSocketMethods = socket => {
  return {
    registerSocketEvents: (sceneKey, methods) => {
      socket.removeAllListeners()
      socket.on(sceneKey, (methodKey, ...args) => {
        methods[methodKey](...args)
      })
      socket.on('all-scene', (methodKey, ...args) => {
        methods[methodKey](...args)
      })
    },
    changeRoom: roomId => {
      socket.emit('change-room', roomId)
    },
    clientsInScene: (sceneKey, methods, key, ...args) => {
      methods[key](...args)
      socket.emit('clients', sceneKey, key, ...args)
    },
    server: (key, ...args) => {
      socket.emit('server', key, ...args)
    }
  }
}
