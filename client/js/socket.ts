import _ from 'lodash'
import { getLocalUserData } from './user'
import io from 'socket.io-client'

const socket = io.connect({
  auth: {
    ...getLocalUserData()
  }
})

export default socket