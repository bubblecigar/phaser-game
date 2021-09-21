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
    registerSocketEvents: methods => {
      socket.on('clients', (key, ...args) => {
        methods[key](...args)
      })
    },
    updateUserState: data => {
      socket.emit('update-userState', data)
    },
    clients: (methods, key, ...args) => {
      methods[key](...args)
      socket.emit('clients', key, ...args)
    },
    server: (key, ...args) => {
      socket.emit('server', key, ...args)
    }
  }
}
