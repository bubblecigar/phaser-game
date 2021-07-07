import _ from 'lodash'
import { getLocalUserData } from './user'
import io from 'socket.io-client'

const socket = io.connect({
  auth: {
    ...getLocalUserData()
  }
})

let registered = false
const registerSocketEvents = methods => {
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
}

export default socket
export { registerSocketEvents }