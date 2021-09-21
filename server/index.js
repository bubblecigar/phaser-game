const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const rooms = require('./state.js').rooms
const { methods } = require('./methods.js')
const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'))

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port)
})

const joinRoom = (socket, userState) => {
  const { roomId, userId } = userState
  socket.rooms.forEach(
    id => {
      if (id !== socket.id) {
        socket.leave(id)
      }
    }
  )
  socket.removeAllListeners('clients')
  socket.removeAllListeners('server')
  socket.removeAllListeners('disconnect')

  socket.join(roomId)
  socket.on('clients', (sceneKey, method, ...args) => {
    socket.to(roomId).emit(sceneKey, method, ...args)
  })

  const roomMethods = methods.getRoomMethods(roomId, io)
  socket.on('server', (key, ...args) => {
    roomMethods[key](...args)
  })

  socket.on('disconnect', async function () {
    rooms.disconnectFromRoom(roomId, userId)
  })
}

io.on('connection', async function (socket) {
  const userState = {
    ...socket.handshake.auth
  }
  socket.on('update-userState', (data) => {

    const changeRoom = data.roomId !== userState.roomId
    if (changeRoom) {
      rooms.disconnectFromRoom(userState.roomId, userState.userId)
    }

    Object.keys(data).forEach(
      key => {
        userState[key] = data[key]
      }
    )
    rooms.createRoom(data.roomId, io)
    rooms.connectToRoom(data.roomId, data.userId)
    joinRoom(socket, userState)
  })
})
