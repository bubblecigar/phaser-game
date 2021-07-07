import _ from 'lodash'
import { getLocalUserData } from './user'
import io from 'socket.io-client'

const socket = io.connect({
  auth: {
    ...getLocalUserData()
  }
})


const registerSocketEvents = methods => {
  Object.keys(methods).forEach(
    method => {
      socket.on(method, (...args) => {
        methods[method](...args)
      })
    }
  )
}

export default socket
export { registerSocketEvents }