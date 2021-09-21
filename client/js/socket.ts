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
    },
    updateUserState: data => {
      socket.emit('update-userState', data)
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
